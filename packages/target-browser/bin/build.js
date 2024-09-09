import { build } from 'esbuild'

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
})
