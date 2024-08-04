import { build } from 'esbuild'
import { gatherBuildInfo } from './lib/gather-version-info.js'

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
  treeShaking: false,
  inject: ['src/cjs-shim.ts'],
  define: {
    BUILD_INFO_JSON_STRING: `"${JSON.stringify(await gatherBuildInfo()).replace(
      /"/g,
      '\\"'
    )}"`,
  },
})

console.log(JSON.stringify(await gatherBuildInfo()))
