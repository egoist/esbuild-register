import fs from 'fs'
import JoyCon from 'joycon'
import strip from 'strip-json-comments'

const joycon = new JoyCon()

joycon.addLoader({
  test: /\.json$/,
  loadSync: (file) => {
    const content = fs.readFileSync(file, 'utf8')
    return JSON.parse(strip(content))
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

export const getOptionsPath = (cwd: string): undefined | string => {
  const { path } = joycon.loadSync(['tsconfig.json'], cwd)
  return path
}
