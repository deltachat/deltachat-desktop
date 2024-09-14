import { build } from 'esbuild'
import { gatherBuildInfo } from '../../../bin/lib/gather-version-info.js'

const BuildInfoString = JSON.stringify(await gatherBuildInfo())

await build({
  bundle: true,
  sourcemap: true,
  format: 'esm',
  platform: 'node',
  outfile: 'dist/server.js',
  entryPoints: ['src/index.ts'],
  treeShaking: false,
  plugins: [
    {
      name: 'bundle shared',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          if (
            args.kind === 'import-statement' &&
            !args.path.startsWith('.') &&
            !args.path.startsWith('@deltachat-desktop/shared')
          ) {
            return { external: true }
          }
        })
      },
    },
  ],
  define: {
    BUILD_INFO_JSON_STRING: `"${BuildInfoString.replace(/"/g, '\\"')}"`,
  },
})

console.log(BuildInfoString)
