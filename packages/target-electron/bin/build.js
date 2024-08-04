import { build } from 'esbuild'

await build({
  bundle: true,
  sourcemap: true,
  format: 'esm',
  platform: 'node',
  outdir: 'bundle_out',
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
