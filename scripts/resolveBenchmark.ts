import { esbuildResolveSync } from './esbuildResolveSync'
import path from 'path'
import { loadConfig, createMatchPath } from 'tsconfig-paths'

function bmSync(func: () => void, n: number) {
  let t0 = Date.now();
  for (let i = 0; i < n; i++) {
    func()
  }

  console.log(func.name, (Date.now() - t0) / n, 'ms')
}

process.chdir('tests/tsconfig-paths/')

const parent = path.resolve('./src/utils/');

bmSync(function esbuild() {
  esbuildResolveSync('@apis/foo', { path: parent } as any);
}, 100);

const config = loadConfig('.')

if (config.resultType === 'failed') throw new Error();

const matchPath = createMatchPath(
  config.absoluteBaseUrl,
  config.paths,
  config.mainFields,
  config.addMatchAll
);

bmSync(function tsconfigPaths() {
  matchPath('@apis/foo')
}, 100);