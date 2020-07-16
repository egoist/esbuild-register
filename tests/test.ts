import path from 'path'
import {test} from 'uvu'
import assert from 'uvu/assert'
import execa from 'execa'

test('register', async ()=> {
  const { stdout } = await execa('node', [
    '-r',
    'esm',
    '-r',
    `${process.cwd()}/register.js`,
    `${process.cwd()}/tests/fixture.ts`,
  ])
  assert.is(stdout, 'text')
})

test.run()