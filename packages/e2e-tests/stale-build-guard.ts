/**
 * Refuse to run e2e tests against a build that is older than its sources,
 * e.g. when running Playwright directly instead of via `pnpm -w e2e`.
 *
 * Compares modification times
 */
import type { FullConfig } from '@playwright/test'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const PACKAGES = join(import.meta.dirname, '..')
const ROOT = join(PACKAGES, '..')

type Output = {
  /** relative to `packages/` */
  file: string
  /** files or directories, relative to `packages/` */
  sources: string[]
}

/** Bundled dependencies, ignored where they stay external. */
const LOCKFILE = '../pnpm-lock.yaml'

const frontendOutputs = (dist: string): Output[] => [
  {
    file: `${dist}/bundle.js`,
    sources: ['frontend/src', 'shared', 'runtime', LOCKFILE],
  },
  { file: `${dist}/main.css`, sources: ['frontend/scss'] },
]

/**
 * Mirrors the inputs of the `build:*` scripts in the `package.json` of
 * frontend, target-electron and target-browser. Keep it in sync when a
 * build script is added or a bundle starts importing from another directory,
 * otherwise a stale output goes unnoticed.
 */
const TARGETS = {
  electron: {
    buildCommand: 'pnpm -w build:electron',
    outputs: [
      ...frontendOutputs('target-electron/html-dist'),
      {
        file: 'target-electron/html-dist/runtime.js',
        sources: [
          'target-electron/runtime-electron',
          'runtime',
          'shared',
          LOCKFILE,
        ],
      },
      {
        file: 'target-electron/html-dist/preload.js',
        sources: ['target-electron/runtime-electron', LOCKFILE],
      },
      {
        // webxdc and calls preloads are copied from here
        file: 'target-electron/html-dist/webxdc-preload.js',
        sources: ['target-electron/static'],
      },
      {
        file: 'target-electron/bundle_out/index.js',
        sources: ['target-electron/src', 'shared', LOCKFILE],
      },
    ],
  },
  browser: {
    buildCommand: 'pnpm -w build:browser',
    outputs: [
      ...frontendOutputs('target-browser/dist'),
      {
        file: 'target-browser/dist/runtime.js',
        sources: [
          'target-browser/runtime-browser',
          'runtime',
          'shared',
          LOCKFILE,
        ],
      },
      {
        file: 'target-browser/dist/server.js',
        sources: ['target-browser/src', 'shared'],
      },
    ],
  },
} satisfies Record<string, { buildCommand: string; outputs: Output[] }>

/** Not part of any build output, changing them must not require a rebuild. */
const IGNORED_DIRS = new Set(['node_modules', 'tests', 'ts-compiled-for-tests'])

/** Newest modification time below `path`, together with that file. */
function newest(path: string): { mtime: number; file: string } {
  const stat = statSync(path)
  if (!stat.isDirectory()) {
    return { mtime: stat.mtimeMs, file: path }
  }
  let result = { mtime: 0, file: path }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) {
      continue
    }
    const candidate = newest(join(path, entry.name))
    if (candidate.mtime > result.mtime) {
      result = candidate
    }
  }
  return result
}

export function assertFreshBuild(target: keyof typeof TARGETS) {
  const { buildCommand, outputs } = TARGETS[target]
  const problems: string[] = []
  for (const output of outputs) {
    let outputMtime: number
    try {
      outputMtime = statSync(join(PACKAGES, output.file)).mtimeMs
    } catch {
      problems.push(`packages/${output.file} is missing (not built yet?)`)
      continue
    }
    for (const source of output.sources) {
      // throws if a source path is missing, so that this list
      // can't silently go out of date
      const { mtime, file } = newest(join(PACKAGES, source))
      if (mtime > outputMtime) {
        problems.push(
          `${relative(ROOT, file)} is newer than packages/${output.file}`
        )
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(
      `The ${target} build is stale, run \`${buildCommand}\` first.\n  ` +
        problems.join('\n  ')
    )
  }
}

export default function globalSetup(config: FullConfig) {
  const target = config.metadata.buildTarget
  if (!Object.hasOwn(TARGETS, target)) {
    throw new Error(
      `metadata.buildTarget must be one of ${Object.keys(TARGETS).join(', ')}, got ${JSON.stringify(target)}`
    )
  }
  assertFreshBuild(target)
}
