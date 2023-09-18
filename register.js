const ESBUILD_CONFIG_NAME = '--esbuild-config'

// parse process.argv.slice(2) and return an object
const parseArgs = (argv) => {
  const args = {}
  argv.forEach(arg => {
    const index = arg.indexOf('=')
    if (index !== -1) {
      const key = arg.slice(0, index)
      const value = arg.slice(index + 1)
      args[key] = value
    }
  })
  return args
}

const args = parseArgs(process.argv.slice(2));

// Determine if a string is json
const isJson = (str) => {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  if (typeof result !== 'object' || Array.isArray(result) || result === null) {
    return false;
  }
  return result;
}

let isJsonConfig;

if (typeof args[ESBUILD_CONFIG_NAME] === 'string') {
  isJsonConfig = isJson(args[ESBUILD_CONFIG_NAME]);
  if (!isJsonConfig) {
    // not json
    console.log('esbuild-config is not json');
  }
}

require('./dist/node.js').register({
  target: `node${process.version.slice(1)}`,
  ...(isJsonConfig || {}),
})
