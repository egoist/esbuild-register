import { dirname, extname } from 'path'
import type { RawSourceMap } from 'source-map'
import sourceMapSupport from 'source-map-support'
import { transformSync, TransformOptions, Loader } from 'esbuild'
import { addHook } from 'pirates'
import fs from 'fs';
import module from 'module';
import { getOptions, inferPackageFormat } from './options'

const map: { [file: string]: string | RawSourceMap } = {}

function installSourceMapSupport() {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveSourceMap(file) {
      if (map[file]) {
        return {
          url: file,
          map: map[file],
        }
      }
      return null
    },
  })
}

type COMPILE = (code: string, filename: string, format?: 'cjs' | 'esm') => string

interface SystemError extends Error {
  code?: string | undefined;
}

/**
 * Patch the Node CJS loader to suppress the ESM error
 * https://github.com/nodejs/node/blob/069b5df/lib/internal/modules/cjs/loader.js#L1125
 * 
 * As per https://github.com/standard-things/esm/issues/868#issuecomment-594480715
 */
function patchCommonJsLoader(compile: COMPILE) {
  // @ts-expect-error
  const extensions = module.Module._extensions;
  const jsHandler = extensions['.js'];
  
  extensions['.js'] = function(module: any, filename: string) {
    try {
      return jsHandler.call(this, module, filename)
    } catch (error) {
      if ((error as SystemError).code !== 'ERR_REQUIRE_ESM') {
        throw error;
      }

      let content = fs.readFileSync(filename, 'utf8');
      content = compile(content, filename, 'cjs');
      module._compile(content, filename);
    }
  };
}

const DEFAULT_FILE_LOADERS = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'js',
} as const

export function register(
  esbuildOptions: TransformOptions & {
    loaders?: { [ext: string]: Loader },
    extensions?: string[],
  } = {}
) {
  const {
    loaders = DEFAULT_FILE_LOADERS,
    extensions = Object.keys(loaders),
    ...overrides
  } = esbuildOptions

  const compile: COMPILE = function compile(code, filename, format) {
    const dir = dirname(filename)
    const options = getOptions(dir)
    format = format ?? inferPackageFormat(dir, filename)
    const loader = loaders[extname(filename)]

    const { code: js, warnings, map: jsSourceMap } = transformSync(code, {
      sourcefile: filename,
      sourcemap: 'both',
      loader,
      target: options.target,
      jsxFactory: options.jsxFactory,
      jsxFragment: options.jsxFragment,
      format,
      ...overrides,
    })
    map[filename] = jsSourceMap
    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }
    return js
  }
  installSourceMapSupport()
  patchCommonJsLoader(compile)
  addHook(compile, {
    exts: extensions,
  })
}
