//@ts-check

/// This script writes all normal dependencies (neither dev nor optional deps)
/// and their dependencies to a node_modules directory
/// This workaround is needed for electron builder but breaks the tests
/// so don't forget to reset afterwards with `pnpm -w run reset:node_modules`

import { readFile, mkdir, copyFile, readdir, stat, realpath } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, isAbsolute, join } from 'path'
import { parseAllDocuments } from 'yaml'

async function copyRecursive(source, destination) {
  if ((await stat(source)).isDirectory()) {
    await mkdir(destination, { recursive: true })
    const files = await readdir(source)
    for (const file of files) {
      if (file === 'node_modules') {
        // console.log('prevented following node_modules folder')
        continue
      }
      await copyRecursive(join(source, file), join(destination, file))
    }
  } else {
    await copyFile(source, destination)
  }
}

const colorize = (light, code) => str =>
  '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
const yellow = colorize(1, 33)

//@ts-expect-error
const __dirname = dirname(fileURLToPath(import.meta.url))

const workspacePackage = process.argv[2]
const rawdestination = process.argv[3]
const destination = isAbsolute(rawdestination)
  ? rawdestination
  : join(process.cwd(), rawdestination)
const pnpmLockfile = join(__dirname, '../../pnpm-lock.yaml')
const pnpmStore = join(__dirname, '../../node_modules/.pnpm')

const workspacePackageJsonPath = join(
  __dirname,
  '../..',
  workspacePackage,
  'package.json'
)
if (!workspacePackage || !existsSync(workspacePackageJsonPath)) {
  console.log(
    'path to workspacePackage is not set as argument or file does not exist:',
    workspacePackageJsonPath
  )
  process.exit(1)
}

if (!destination) {
  console.log('no destination set')
  process.exit(1)
}

;(async () => {
  const docs = parseAllDocuments(await readFile(pnpmLockfile, 'utf8'))
  const Lockfile = docs[docs.length - 1].toJS()
  const expectedLockfileVersion = '9.0'
  if (Lockfile.lockfileVersion !== expectedLockfileVersion) {
    console.log(
      `lockfile version might be incompatible expected ${expectedLockfileVersion}, found:`,
      Lockfile.lockfileVersion
    )
    process.exit(1)
  }

  const importer = Lockfile.importers[workspacePackage]

  if (!importer) {
    console.log('workspace package not found in lockfile:', workspacePackage)
    process.exit(1)
  }
  //   console.log(importer);

  // Follow pnpm's own links instead of computing the folder names in
  // node_modules/.pnpm: pnpm shortens long names (virtualStoreDirMaxLength),
  // so they can't be derived from the lockfile. Like node's resolution, a
  // package's dependencies are linked next to it in .pnpm/<folder>/node_modules
  const copied = new Set()
  const skippedOptional = new Set()
  const missing = new Set()
  const linkedDependencies = []

  const copyDependencies = async (nodeModulesDir, dependencies, optional) => {
    for (const dep in dependencies) {
      const version = dependencies[dep].version || dependencies[dep]
      if (version.startsWith('link:')) {
        linkedDependencies.push(`${dep}@${version}`)
        continue
      }
      const link = join(nodeModulesDir, dep)
      if (!existsSync(link)) {
        // pnpm doesn't install optional dependencies for platforms that are
        // not in supportedArchitectures (e.g. android, linux-arm)
        if (optional) {
          skippedOptional.add(dep)
          continue
        }
        // only warn: external package builds may remove dependencies on purpose
        console.warn(
          `${yellow('WARN:')} dependency ${dep}@${version} is not installed, skipped: ${link}`
        )
        missing.add(`${dep}@${version}`)
        continue
      }
      const source = await realpath(link)
      if (copied.has(source)) {
        continue
      }
      copied.add(source)

      const dest = join(destination, dep)
      // direct dependencies may already be linked there by pnpm
      if (!existsSync(dest) || (await realpath(dest)) !== source) {
        await mkdir(dest, { recursive: true })
        await copyRecursive(source, dest)
      }

      const snapshot = Lockfile.snapshots[`${dep}@${version}`]
      // .pnpm/<folder>/node_modules/[@scope/]name -> .pnpm/<folder>/node_modules
      const siblings = join(source, ...dep.split('/').map(() => '..'))
      await copyDependencies(siblings, snapshot?.dependencies, false)
      await copyDependencies(siblings, snapshot?.optionalDependencies, true)
    }
  }

  await mkdir(destination, { recursive: true })
  await copyDependencies(
    join(dirname(workspacePackageJsonPath), 'node_modules'),
    importer.dependencies,
    false
  )

  if (linkedDependencies.length !== 0) {
    console.warn(
      `${yellow('WARN:')} Linked dependencies are not supported yet by our flatten workaround script:`,
      { linkedDependencies }
    )
  }
  if (missing.size !== 0) {
    console.warn(
      `${yellow('WARN:')} ${missing.size} dependencies are missing, the app may not start:`,
      [...missing].join(', ')
    )
  }
  if (skippedOptional.size !== 0) {
    console.log(
      'optional dependencies not installed for the supported architectures:',
      [...skippedOptional].join(', ')
    )
  }
})()
