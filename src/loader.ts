// https://github.com/egoist/esbuild-register/issues/26#issuecomment-1173015785

const extensionsRegex = /\.(ts|tsx|mts|cts)$/

export async function load(url: any, context: any, defaultLoad: any) {
  if (extensionsRegex.test(url)) {
    const { source } = await defaultLoad(url, { format: 'module' })
    return {
      format: 'commonjs',
      source: source,
    }
  }
  // let Node.js handle all other URLs
  return defaultLoad(url, context, defaultLoad)
}
