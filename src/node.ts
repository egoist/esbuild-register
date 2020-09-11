import { dirname } from 'path'
import { RawSourceMap } from 'source-map'
import sourceMapSupport from 'source-map-support'
import { buildSync } from 'esbuild'
import { addHook } from 'pirates'
import atob from 'atob'
import { getOptions, getOptionsPath } from './options'

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

function getSourceMap(js: string): string {
  const matched = js.match(
    /\/\/# sourceMappingURL=data:application\/json;base64,.*\n?/,
  )
  const result = ((matched && matched[0]) || '')
    .trim()
    .replace(/\/\/# sourceMappingURL=data:application\/json;base64,/, '')
  return atob(result)
}

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs']

function compile(code: string, filename: string) {
  const options = getOptions(dirname(filename))
  const optionsPath = getOptionsPath(dirname(filename))

  const { warnings, outputFiles } = buildSync({
    // tsconfig options
    tsconfig: optionsPath,
    target: optionsPath ? undefined : options.target,
    jsxFactory: optionsPath ? undefined : options.jsxFactory,
    jsxFragment: optionsPath ? undefined : options.jsxFragment,
    // TODO: support process.argv options, sourcemap, format and stdin.loader
    sourcemap: true,
    format: 'cjs',
    write: false,
    stdin: {
      loader: 'tsx',
      sourcefile: filename,
      contents: code,
    },
  })

  const js = new TextDecoder('utf-8').decode(
    outputFiles?.find((_) => _)?.contents,
  )
  const jsSourceMap = getSourceMap(js)

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
