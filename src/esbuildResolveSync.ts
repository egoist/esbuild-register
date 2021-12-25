import { buildSync } from "esbuild"
import Module from "module"
import path from 'path'

export const esbuildResolveSync = (id: string, parent: Module) => {
  const meta = buildSync({
    stdin: {
      contents: `require(${JSON.stringify(id)})`,
      resolveDir: parent.path,
    },
    write: false,
    metafile: true,
    bundle: true,
    treeShaking: 'ignore-annotations',
    platform: 'node',
    loader: {
      '.js': 'text',
      '.ts': 'text',
      '.jsx': 'text',
      '.tsx': 'text',
      '.mjs': 'text',
      '.mts': 'text',
      '.mjsx': 'text',
      '.mtsx': 'text',
      '.cjs': 'text',
      '.cts': 'text',
      '.cjsx': 'text',
      '.ctsx': 'text',
    },
  })
  
  const result = meta.metafile?.inputs && path.resolve(Object.keys(meta.metafile.inputs)[0])

  return result
}