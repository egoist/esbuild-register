require('./dist/node').register({
  format: 'cjs',
  target: `node${process.version.slice(1)}`,
})
