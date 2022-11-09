import fs from 'fs'
import path from 'path'
import { Loader, Plugin as EsbuildPlugin } from 'esbuild'
import { pathToFileURL } from 'url'

const JS_EXT_RE = /\.(mjs|cjs|ts|js|tsx|jsx)$/
const DIRNAME_VAR_NAME = '__esbuild_register_dirname__'
const FILENAME_VAR_NAME = '__esbuild_register_filename__'
const IMPORT_META_URL_VAR_NAME = '__esbuild_register_import_meta_url__'

function inferLoader(ext: string): Loader {
  if (ext === '.mjs' || ext === '.cjs') return 'js'
  return ext.slice(1) as Loader
}

export const injectFileScopePlugin = (): EsbuildPlugin => {
  return {
    name: 'bundle-require:inject-file-scope',
    setup(ctx) {
      ctx.initialOptions.define = {
        ...ctx.initialOptions.define,
        __dirname: DIRNAME_VAR_NAME,
        __filename: FILENAME_VAR_NAME,
        'import.meta.url': IMPORT_META_URL_VAR_NAME,
      }

      ctx.onLoad({ filter: JS_EXT_RE }, async (args) => {
        const contents = await fs.promises.readFile(args.path, 'utf-8')
        const injectLines = [
          `const ${FILENAME_VAR_NAME} = ${JSON.stringify(args.path)};`,
          `const ${DIRNAME_VAR_NAME} = ${JSON.stringify(
            path.dirname(args.path),
          )};`,
          `const ${IMPORT_META_URL_VAR_NAME} = ${JSON.stringify(
            pathToFileURL(args.path).href,
          )};`,
        ]
        return {
          contents: injectLines.join('') + contents,
          loader: inferLoader(path.extname(args.path)),
        }
      })
    },
  }
}
