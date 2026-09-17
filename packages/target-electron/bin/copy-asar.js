//@ts-check

/// Copies the app archive out of the architecture specific electron-builder
/// output folder (`dist/linux-unpacked`, `dist/linux-arm64-unpacked`, …)
/// into `dist/asar`, so packagers have a stable path to install from.

import { cp, mkdir, readdir, rm } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')
const destinationDir = join(distDir, 'asar')

if (!existsSync(distDir)) {
  throw new Error(`${distDir} does not exist, run a packaging command first`)
}

const unpackedDirs = (await readdir(distDir, { withFileTypes: true }))
  .filter(entry => entry.isDirectory() && entry.name.endsWith('-unpacked'))
  .map(entry => join(distDir, entry.name))

if (unpackedDirs.length !== 1) {
  throw new Error(
    unpackedDirs.length === 0
      ? `found no "*-unpacked" folder in ${distDir}, run a packaging command first`
      : `found more than one "*-unpacked" folder in ${distDir}, delete the ones you don't want to use: ${unpackedDirs.join(', ')}`
  )
}

// `NO_ASAR=true` builds contain an unarchived `app` folder instead
const contents = ['app.asar', 'app.asar.unpacked', 'app']
  .map(name => join(unpackedDirs[0], 'resources', name))
  .filter(path => existsSync(path))

if (contents.length === 0) {
  throw new Error(`no app archive found in ${unpackedDirs[0]}/resources`)
}

await rm(destinationDir, { recursive: true, force: true })
await mkdir(destinationDir, { recursive: true })
for (const source of contents) {
  await cp(source, join(destinationDir, basename(source)), {
    recursive: true,
  })
}

console.log(`copied ${contents.length} item(s) to ${destinationDir}`)
