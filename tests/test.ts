import path from 'path'
import fs from 'fs'
import { tmpdir } from 'os'
import { test } from 'uvu'
import assert from 'uvu/assert'
import execa from 'execa'

const realFs = (dir: string, files: Record<string, string>) => {
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(dir, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
}

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

test('tsconfig-paths', async () => {
  const cwd2 = `${process.cwd()}/tests/tsconfig-paths`
  const { stdout } = await execa(
    'node',
    [
      '-r',
      `${process.cwd()}/register.js`,
      `${process.cwd()}/tests/tsconfig-paths/src/utils/fixture.ts`,
    ],
    {
      cwd: cwd2,
    },
  )
  assert.equal(stdout, 'foobar\nfoobar')
})

test('tsconfig-paths handles not found', async () => {
  const cwd2 = `${process.cwd()}/tests/tsconfig-paths`

  const { stderr } = await execa(
    'node',
    [
      '-r',
      `${process.cwd()}/register.js`,
      `${process.cwd()}/tests/tsconfig-paths/src/utils/notfound.ts`,
    ],
    {
      cwd: cwd2,
      reject: false,
    },
  )
  assert.ok(stderr.includes(`Error: Cannot find module '@apis/foos'`))
})

test('works without tsconfig', async () => {
  const cwd = `${tmpdir()}/${Date.now()}-without-tsconfig-paths`
  realFs(cwd, {
    'index.ts': `console.log('hi' as any)`,
  })

  const { stdout } = await execa(
    'node',
    ['-r', `${process.cwd()}/register.js`, `./index.ts`],
    {
      cwd,
    },
  )
  assert.ok(stdout.includes('hi'))
})

test.run()
