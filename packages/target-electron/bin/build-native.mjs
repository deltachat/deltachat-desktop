//@ts-check
/**
 * Builds the native `os-auth` addon into `native-dist/`.
 *
 * On macOS both architectures are built and merged with `lipo`, because the
 * release builds are universal binaries. On the other platforms only the host
 * architecture is built; cross compiling is possible by passing target triples
 * as arguments.
 */
import { spawnSync } from 'child_process'
import { copyFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const crateDir = join(__dirname, '..', 'native', 'os-auth')
const outDir = join(__dirname, '..', 'native-dist')

const LIBRARY_NAMES = {
  darwin: 'libos_auth.dylib',
  linux: 'libos_auth.so',
  win32: 'os_auth.dll',
}

/** rust target triple -> what the loader in src/user-presence.ts looks for */
const TARGETS = {
  'aarch64-apple-darwin': { platform: 'darwin', arch: 'arm64' },
  'x86_64-apple-darwin': { platform: 'darwin', arch: 'x64' },
  'aarch64-pc-windows-msvc': { platform: 'win32', arch: 'arm64' },
  'x86_64-pc-windows-msvc': { platform: 'win32', arch: 'x64' },
  'aarch64-unknown-linux-gnu': { platform: 'linux', arch: 'arm64' },
  'x86_64-unknown-linux-gnu': { platform: 'linux', arch: 'x64' },
}

function run(command, args) {
  console.log('>', command, args.join(' '))
  const { status, error } = spawnSync(command, args, { stdio: 'inherit' })
  if (error) {
    throw error
  }
  if (status !== 0) {
    throw new Error(`${command} exited with ${status}`)
  }
}

function build(target) {
  run('cargo', [
    'build',
    '--release',
    '--manifest-path',
    join(crateDir, 'Cargo.toml'),
    '--target',
    target,
  ])
  const { platform } = TARGETS[target]
  return join(crateDir, 'target', target, 'release', LIBRARY_NAMES[platform])
}

const hostTargets = {
  darwin: ['aarch64-apple-darwin', 'x86_64-apple-darwin'],
  win32: [process.arch === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc'],
  linux: [
    process.arch === 'arm64'
      ? 'aarch64-unknown-linux-gnu'
      : 'x86_64-unknown-linux-gnu',
  ],
}

const targets = process.argv.slice(2).filter(argument => !argument.startsWith('-'))
const selected = targets.length > 0 ? targets : hostTargets[process.platform]

if (!selected) {
  throw new Error(`unsupported build platform: ${process.platform}`)
}
for (const target of selected) {
  if (!TARGETS[target]) {
    throw new Error(`unknown target: ${target}`)
  }
}

mkdirSync(outDir, { recursive: true })

const built = selected.map(target => ({ target, library: build(target) }))

const macBuilds = built.filter(({ target }) => TARGETS[target].platform === 'darwin')
const otherBuilds = built.filter(({ target }) => TARGETS[target].platform !== 'darwin')

if (macBuilds.length > 0) {
  // one binary for both architectures, so that the arm64 and x64 app bundles
  // electron-builder merges for a universal build contain identical files
  const destination = join(outDir, 'os-auth.darwin.node')
  run('lipo', [
    '-create',
    '-output',
    destination,
    ...macBuilds.map(({ library }) => library),
  ])
  console.log('wrote', destination)
}

for (const { target, library } of otherBuilds) {
  const { platform, arch } = TARGETS[target]
  const destination = join(outDir, `os-auth.${platform}-${arch}.node`)
  copyFileSync(library, destination)
  console.log('wrote', destination)
}
