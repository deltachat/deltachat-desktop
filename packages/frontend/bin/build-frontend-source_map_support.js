import { copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const browserSourceMapSupportPath = join(
  __dirname,
  '..',
  'node_modules',
  'source-map-support',
  'browser-source-map-support.js'
)

const outDir = join(__dirname, '..', 'html-dist')
try {
  mkdirSync(outDir)
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw err
  }
}
copyFileSync(
  browserSourceMapSupportPath,
  join(outDir, 'browser-source-map-support.js')
)
