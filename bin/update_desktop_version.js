import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const version = rootPackageJson.version

const packagesDirectory = 'packages'
const packageDirectories = readdirSync(packagesDirectory)

packageDirectories
  .filter(dir => dir.startsWith('target-'))
  .forEach(dir => {
    const packageJsonPath = join(packagesDirectory, dir, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      packageJson.version = version
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }
  })
