import fs from 'fs'
import JoyCon from 'joycon'
import { parse } from 'jsonc-parser'

const joycon = new JoyCon()

joycon.addLoader({
  test: /\.json$/,
  loadSync: (file) => {
    const content = fs.readFileSync(file, 'utf8')
    return parse(content)
  },
})

export const getOptions = (
  cwd: string,
): { jsxFactory?: string; jsxFragment?: string; target?: string } => {
  const { data, path } = joycon.loadSync(['tsconfig.json'], cwd)
  if (path && data) {
    return {
      jsxFactory: data.compilerOptions?.jsxFactory,
      jsxFragment: data.compilerOptions?.jsxFragmentFactory,
      target: data.compilerOptions?.target,
    }
  }
  return {}
}

export const inferPackageFormat = (
  cwd: string,
  filename: string,
): 'esm' | 'cjs' => {
  if (filename.endsWith('.mjs')) {
    return 'esm'
  }
  if (filename.endsWith('.cjs')) {
    return 'cjs'
  }
  const { data } = joycon.loadSync(['package.json'], cwd)
  return data && data.type === 'module' ? 'esm' : 'cjs'
}
