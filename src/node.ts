import { dirname, extname } from 'path'
import { RawSourceMap } from 'source-map'
import sourceMapSupport from 'source-map-support'
import { transformSync } from 'esbuild'
import { addHook } from 'pirates'
import { getOptions } from './options'
import { FILE } from 'dns'

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

type EXTENSIONS = '.js' | '.jsx' | '.ts' |'.tsx'|'.mjs'
type LOADERS = 'js' | 'jsx' | 'ts' |'tsx'
const FILE_LOADERS: Record<EXTENSIONS, LOADERS> = {
  '.js': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.mjs': 'js',
};

const DEFAULT_EXTENSIONS = Object.keys(FILE_LOADERS);

const getLoader = (filename: string): LOADERS => FILE_LOADERS[extname(filename) as EXTENSIONS]

function compile(code: string, filename: string) {
  const options = getOptions(dirname(filename))
  const { js, warnings, jsSourceMap } = transformSync(code, {
    sourcefile: filename,
    sourcemap: true,
    loader: getLoader(filename),
    target: options.target,
    jsxFactory: options.jsxFactory,
    jsxFragment: options.jsxFragment,
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

export function register() {
  installSourceMapSupport()
  addHook(compile, {
    exts: DEFAULT_EXTENSIONS,
  })
}
