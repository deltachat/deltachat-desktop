import { build } from 'esbuild'

const isProduction = process.env['NODE_ENV'] === 'production'
const isMinify = process.argv.indexOf('-m') !== -1 

await build({
  bundle: true,
  sourcemap: true,
  format: 'esm',
  platform: 'node',
  outdir: 'bundle_out',
  minify: isMinify || isProduction,
  external: [
    // all dependencies not listed here can go to dev dependencies because they get bundled
    'electron',
    '@deltachat/jsonrpc-client',
    '@deltachat/stdio-rpc-server',
    'mime-db',
    'mime-types',
    'isomorphic-ws',
  ],
  entryPoints: ['src/index.ts'],
  treeShaking: true,
  inject: ['src/cjs-shim.ts']
})
