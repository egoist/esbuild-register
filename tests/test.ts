import { test } from 'uvu'
import assert from 'uvu/assert'
import execa from 'execa'

test('register', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/fixture.ts`,
  ])
  assert.is(stdout, 'text')
})

test('register2', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/fixture.arrowFunction.ts`,
  ])
  assert.is(stdout, 'hello from ts')
})

test('register cjs', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/fixture.cjs.ts`,
  ])
  assert.is(stdout, 'fs imported')
})

test('package type module', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/fixture-type-module/index.js`,
  ])
  assert.is(stdout, 'foo')
})

test('import type module', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/import-type-module/index.js`,
  ])
  assert.is(stdout, 'foo')
})

test('import TypeScript npm module', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/tests/fixture-register/register-with-node_modules.js`,
    `${process.cwd()}/tests/import-typescript-module/index.js`,
  ])
  assert.is(stdout, 'hello from typescript in node_modules')
})

test('import TypeScript npm module with matcher', async () => {
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/tests/fixture-register/register-with-matcher.js`,
    `${process.cwd()}/tests/import-typescript-module/index.js`,
  ])
  assert.is(stdout, 'hello from typescript in node_modules')
})

test('tsconfig-paths', async() => {
  const cwd2 = `${process.cwd()}/tests/tsconfig-paths`
  const { stdout } = await execa('node', [
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/tsconfig-paths/src/utils/fixture.ts`,
  ], {
    cwd: cwd2,
  })
  assert.equal(stdout, 'foo1\nfoo1')
})

test.run()
