import path, { dirname } from 'path'
import sourceMapSupport from 'source-map-support'
import { transformSync, Loader } from 'esbuild'
import { addHook } from 'pirates'
import { getOptions } from './options'

function installSourceMapSupport() {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: 'node',
  })
}

const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs']

function compile(code: string, filename: string) {
  const options = getOptions(dirname(filename))
  const { js, warnings } = transformSync(code, {
    sourcefile: filename,
    sourcemap: 'inline',
    // Just use tsx for everything until we find a way to let user configure this
    loader: 'tsx',
    target: options.target,
    jsxFactory: options.jsxFactory,
    jsxFragment: options.jsxFragment,
  })
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
