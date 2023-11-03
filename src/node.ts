import { dirname, extname, join } from 'path'
import type { RawSourceMap } from 'source-map'
import sourceMapSupport from 'source-map-support'
import type { UrlAndMap } from 'source-map-support'
import { transformSync, TransformOptions } from 'esbuild'
import { addHook } from 'pirates'
import fs from 'fs'
import module from 'module'
import process from 'process'
import { getOptions, inferPackageFormat } from './options'
import { removeNodePrefix } from './utils'
import { registerTsconfigPaths } from './tsconfig-paths'
import { debug } from './debug'

const IMPORT_META_URL_VARIABLE_NAME = '__esbuild_register_import_meta_url__'
const map: { [file: string]: string | RawSourceMap } = {}

function installSourceMapSupport() {
  if ((process as any).setSourceMapsEnabled) {
    ;(process as any).setSourceMapsEnabled(true)
  } else {
    sourceMapSupport.install({
      handleUncaughtExceptions: false,
      environment: 'node',
      retrieveSourceMap(file) {
        if (map[file]) {
          return {
            url: file,
            map: map[file],
          } as UrlAndMap
        }
        return null
      },
    })
  }
}

type COMPILE = (
  code: string,
  filename: string,
  format?: 'cjs' | 'esm',
) => string

/**
 * Patch the Node CJS loader to suppress the ESM error
 * https://github.com/nodejs/node/blob/069b5df/lib/internal/modules/cjs/loader.js#L1125
 *
 * As per https://github.com/standard-things/esm/issues/868#issuecomment-594480715
 */
function patchCommonJsLoader(compile: COMPILE) {
  // @ts-expect-error
  const extensions = module.Module._extensions
  const jsHandler = extensions['.js']

  extensions['.js'] = function (module: any, filename: string) {
    try {
      return jsHandler.call(this, module, filename)
    } catch (error: any) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error
      }

      let content = fs.readFileSync(filename, 'utf8')
      content = compile(content, filename, 'cjs')
      module._compile(content, filename)
    }
  }

  return () => {
    extensions['.js'] = jsHandler
  }
}

type LOADERS = 'js' | 'jsx' | 'ts' | 'tsx'
const FILE_LOADERS: Record<string, LOADERS> = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'js',
  '.mts': 'ts',
  '.cts': 'ts',
}

type EXTENSIONS = keyof typeof FILE_LOADERS

const DEFAULT_EXTENSIONS = Object.keys(FILE_LOADERS)

const getLoader = (filename: string): LOADERS =>
  FILE_LOADERS[extname(filename) as EXTENSIONS]

interface RegisterOptions extends TransformOptions {
  extensions?: EXTENSIONS[]
  /**
   * Auto-ignore node_modules. Independent of any matcher.
   * @default true
   */
  hookIgnoreNodeModules?: boolean
  /**
   * A matcher function, will be called with path to a file. Should return truthy if the file should be hooked, falsy otherwise.
   */
  hookMatcher?(fileName: string): boolean
}

export function register(esbuildOptions: RegisterOptions = {}) {
  const {
    extensions = DEFAULT_EXTENSIONS,
    hookIgnoreNodeModules = true,
    hookMatcher,
    ...overrides
  } = esbuildOptions

  const compile: COMPILE = function compile(code, filename, format) {
    const define = {
      // Computed property name is used because literally writing
      // `import.meta.url` may be transformed by esbuild-register itself
      ['IMPORT.META.URL'.toLowerCase()]: IMPORT_META_URL_VARIABLE_NAME,
      ...overrides.define,
    }
    const banner = `const ${IMPORT_META_URL_VARIABLE_NAME} = require('url').pathToFileURL(__filename).href;${
      overrides.banner || ''
    }`

    // For some reason if the code is already compiled by esbuild-register
    // just return it as is
    if (code.includes(banner)) {
      return code
    }

    const dir = dirname(filename)
    const options = getOptions(dir)
    format = format ?? inferPackageFormat(dir, filename)

    const result = transformSync(code, {
      sourcefile: filename,
      loader: getLoader(filename),
      sourcemap: 'both',
      target: options.target,
      jsxFactory: options.jsxFactory,
      jsxFragment: options.jsxFragment,
      format,
      define,
      banner,
      ...overrides,
    })

    const js = result.code
    debug('compiled %s', filename)
    debug('%s', js)

    const warnings = result.warnings
    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }
    if (format === 'esm') return js
    return removeNodePrefix(js)
  }

  const revert = addHook(compile, {
    exts: extensions,
    ignoreNodeModules: hookIgnoreNodeModules,
    matcher: hookMatcher,
  })

  installSourceMapSupport()
  const unpatchCommonJsLoader = patchCommonJsLoader(compile)
  const unregisterTsconfigPaths = registerTsconfigPaths()

  return {
    unregister() {
      revert()
      unpatchCommonJsLoader()
      unregisterTsconfigPaths()
    },
  }
}

export type Register = ReturnType<typeof register>
