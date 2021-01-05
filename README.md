# esbuild-register

## Install

```bash
yarn add esbuild-register --dev
```

[`esbuild`](https://github.com/evanw/esbuild) is required as a peer dependency.

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

register({
  // ...options
})
```

## License

MIT &copy; [EGOIST](https://egoist.sh)
w
