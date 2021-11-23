const { register } = require('../../dist/node')
register({
  hookIgnoreNodeModules: false,
  hookMatcher(fileName) {
    return fileName.includes('foo') || fileName.includes('index')
  },
})
