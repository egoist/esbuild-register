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

## License

MIT &copy; [EGOIST (Kevin Titor)](https://egoist.sh)
