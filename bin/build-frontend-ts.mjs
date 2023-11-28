import { copyFile, readFile } from 'fs/promises'
import path from 'path'

import esbuild from 'esbuild'
import { ESLint } from 'eslint'
import { compile } from 'sass'

function config(options) {
  const { isProduction, isMinify } = options

  return {
    entryPoints: ['src/renderer/main.tsx'],
    bundle: true,
    minify: isMinify,
    sourcemap: true,
    outfile: 'html-dist/bundle.js',
    define: {
      'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
    },
    plugins: [eslintPlugin, wasmPlugin, sassPlugin, reporterPlugin],
  }
}

const eslintPlugin = {
  name: 'eslint',
  setup(build) {
    const eslint = new ESLint()
    const filesToLint = []

    build.onLoad({ filter: /\.(?:jsx?|tsx?)$/ }, (args) => {
      if (!args.path.includes('node_modules')) {
        filesToLint.push(args.path)
      }

      return null
    })

    build.onEnd(async () => {
      const results = await eslint.lintFiles(filesToLint)
      const formatter = await eslint.loadFormatter('stylish')
      const output = await formatter.format(results)

      const warnings = results.reduce(
        (count, result) => count + result.warningCount,
        0,
      )
      const errors = results.reduce(
        (count, result) => count + result.errorCount,
        0,
      )

      if (output.length > 0) {
        console.log(output)
      }

      return {
        ...(warnings > 0 && {
          warnings: [{ text: `${warnings} warnings were found by eslint!` }],
        }),
        ...(errors > 0 && {
          errors: [{ text: `${errors} errors were found by eslint!` }],
        }),
      }
    })
  },
}

const sassPlugin = {
  name: 'sass',
  setup(build) {
    build.onLoad({ filter: /\.module\.scss$/ }, (args) => {
      const { css } = compile(args.path)
      return { contents: css, loader: 'local-css' }
    })
  },
}

const wasmPlugin = {
  name: 'wasm',
  setup(build) {
    // Resolve ".wasm" files to a path with a namespace
    build.onResolve({ filter: /\.wasm$/ }, (args) => {
      if (args.resolveDir === '') {
        return // Ignore unresolvable paths
      }
      return {
        path: path.isAbsolute(args.path)
          ? args.path
          : path.join(args.resolveDir, args.path),
        namespace: 'wasm-binary',
      }
    })

    // Virtual modules in the "wasm-binary" namespace contain the actual bytes
    // of the WebAssembly file. This uses esbuild's built-in "binary" loader
    // instead of manually embedding the binary data inside JavaScript code
    // ourselves.
    build.onLoad({ filter: /.*/, namespace: 'wasm-binary' }, async (args) => ({
      contents: await readFile(args.path),
      loader: 'binary',
    }))
  },
}

const reporterPlugin = {
  name: 'reporter',
  setup(build) {
    build.onStart(() => {
      console.log('- Start eslint build ...')
    })

    build.onEnd(async (args) => {
      const errors = args.errors.length
      const warnings = args.warnings.length
      console.log(
        `- Finished eslint build with ${warnings} warnings and ${errors} errors`,
      )
    })
  },
}

async function bundle(options) {
  await esbuild.build(options)

  await copyFile(
    'node_modules/@deltachat/message_parser_wasm/message_parser_wasm_bg.wasm',
    'html-dist/message_parser_wasm_bg.wasm',
  )
}

async function watch(options) {
  const context = await esbuild.context(options)
  await context.watch()
}

async function main(isWatch = false, isProduction = false, isMinify = false) {
  const options = config({
    isProduction: !isWatch && isProduction,
    isMinify: (!isWatch && isMinify) || isProduction,
  })

  isWatch && console.log('- Start watching for changes ...')
  !isWatch && console.log('- Bundle once ...')

  if (isWatch) {
    await watch(options)
  } else {
    await bundle(options)
    console.log('- Build completed')
  }
}

const isWatch = process.argv.indexOf('-w') !== -1
const isMinify = process.argv.indexOf('-m') !== -1
const isProduction = process.env['NODE_ENV'] === 'production'

main(isWatch, isProduction, isMinify).catch((err) => {
  console.error(err)
  process.exitCode = 1
})
