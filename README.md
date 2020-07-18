# esbuild-register

## Install

```bash
yarn add esm esbuild-register --dev
```

You need [`esm`](https://github.com/standard-things/esm) as well because `esbuild` doesn't compile `import` and `export` statements to commonjs `require`.

[`esbuild`](https://github.com/evanw/esbuild) is also required as a peer dependency.

## Usage

```bash
node -r esm -r esbuild-register file.ts
```

It will use `jsxFactory`, `jsxFragmentFactory` and `target` options from your `tsconfig.json`

When using Yarn, you can add an npm script:

```json
"ts": "node -r esm -r esbuild-register"
```

to shorten the command, now just run `yarn ts file.ts` instead.

## License

MIT &copy; [EGOIST (Kevin Titor)](https://egoist.sh)
