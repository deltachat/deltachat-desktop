import { copyFileSync } from 'fs'
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
copyFileSync(
  browserSourceMapSupportPath,
  join(__dirname, '..', 'html-dist', 'browser-source-map-support.js')
)
