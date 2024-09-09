//@ts-check

/// This script writes all normal dependencies (neither dev nor optional deps)
/// and their dependencies to a node_modules directory
/// This workaround is needed for electron builder but breaks the tests
/// so don't forget to reset afterwards with `pnpm -w run reset:node_modules`

import { readFile, mkdir, copyFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, isAbsolute, join } from 'path'
import { parse } from 'yaml'

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
const pnpmLockfile = join(__dirname, '../pnpm-lock.yaml')
const pnpmStore = join(__dirname, '../node_modules/.pnpm')

const workspacePackageJsonPath = join(
  __dirname,
  '..',
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
  const Lockfile = parse(await readFile(pnpmLockfile, 'utf8'))
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

  const flatDependencyList = []
  const getDeps = dependencies => {
    for (const dep in dependencies) {
      const version = dependencies[dep].version || dependencies[dep]
      const depCode = `${dep}@${version}`
      const dependency = Lockfile.snapshots[depCode]
      flatDependencyList.push(depCode)
      //   console.log(
      //     depCode,
      //     dependency?.dependencies,
      //     dependency?.optionalDependencies
      //   )
      if (dependency?.dependencies) {
        getDeps(dependency.dependencies)
      }
      if (dependency?.optionalDependencies) {
        getDeps(dependency.optionalDependencies)
      }
    }
  }
  getDeps(importer.dependencies)

  const uniqueflatDependencyList = [...new Set(flatDependencyList)]
  //   console.log({ uniqueflatDependencyList })

  const linkedDependencies = uniqueflatDependencyList.filter(name =>
    name.includes('@link:')
  )
  if (linkedDependencies.length !== 0) {
    console.warn(
      'WARN: Linked dependencies are not supported yet by our flatten workaround script:',
      {
        linkedDependencies,
      }
    )
  }

  await mkdir(destination, { recursive: true })

  for (const pkg of uniqueflatDependencyList) {
    const name = pkg.match(/(^@?.*?)@/)[1]
    const folderInStoreName = pkg
      .replace(/\//g, '+')
      .replace(/\(|\)/g, '_')
      .replace(/_$/, '')
    const source = join(
      pnpmStore,
      folderInStoreName,
      'node_modules',
      name
    )
    const dest = join(destination, name)
    await mkdir(dest, { recursive: true })
    // console.log(source, dest)

    if (!existsSync(source)) {
      console.warn(
        `${yellow(
          'WARN:'
        )} ${folderInStoreName} not found in pnpm store, skipped`, {name}
      )
      continue
    }
    // console.log({ pkg, name, dest })

    await copyRecursive(source, dest)
  }
})()
