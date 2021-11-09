# esbuild-register

[![npm version](https://badgen.net/npm/v/esbuild-register)](https://npm.im/esbuild-register) [![npm downloads](https://badgen.net/npm/dm/esbuild-register)](https://npm.im/esbuild-register)

## Install

```bash
npm i esbuild esbuild-register -D
# Or Yarn
yarn add esbuild esbuild-register --dev
# Or pnpm
pnpm add esbuild esbuild-register -D
```

## Usage

```bash
node -r esbuild-register file.ts
```

It will use `jsxFactory`, `jsxFragmentFactory` and `target` options from your `tsconfig.json`

When using Yarn, you can add an npm script:

```json
"ts": "node -r esbuild-register"
```

to shorten the command, now just run `yarn ts file.ts` instead.

## Programmatic Usage

```ts
const { register } = require('esbuild-register/dist/node')

const { unregister } = register({
  // ...options
})

// Unregister the require hook if you don't need it anymore
unregister()
```

## Sponsors

[![sponsors](https://sponsors-images.egoist.sh/sponsors.svg)](https://github.com/sponsors/egoist)

## License

MIT &copy; [EGOIST](https://egoist.sh)
w
