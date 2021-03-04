import { dirname, extname } from 'path'
import type { RawSourceMap } from 'source-map'
import sourceMapSupport from 'source-map-support'
import { transformSync, TransformOptions } from 'esbuild'
import { addHook } from 'pirates'
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

type LOADERS = 'js' | 'jsx' | 'ts' | 'tsx'
const FILE_LOADERS = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'js',
} as const

type EXTENSIONS = keyof typeof FILE_LOADERS

const DEFAULT_EXTENSIONS = Object.keys(FILE_LOADERS)

const getLoader = (filename: string): LOADERS =>
  FILE_LOADERS[extname(filename) as EXTENSIONS]

export function register(
  esbuildOptions: TransformOptions & { extensions?: EXTENSIONS[] } = {},
) {
  const { extensions = DEFAULT_EXTENSIONS, ...overrides } = esbuildOptions

  function compile(code: string, filename: string) {
    const dir = dirname(filename)
    const options = getOptions(dir)
    const format = inferPackageFormat(dir, filename)

    const { code: js, warnings, map: jsSourceMap } = transformSync(code, {
      sourcefile: filename,
      sourcemap: 'both',
      loader: getLoader(filename),
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
  addHook(compile, {
    exts: extensions,
  })
}
