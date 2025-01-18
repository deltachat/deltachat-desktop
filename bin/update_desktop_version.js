import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

const checkOnly = process.argv.includes('--check')

const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const version = rootPackageJson.version

const packagesDirectory = 'packages'
const packageDirectories = readdirSync(packagesDirectory)

let checkFailed = false

packageDirectories
  .filter(dir => dir.startsWith('target-'))
  .forEach(dir => {
    const packageJsonPath = join(packagesDirectory, dir, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      if (checkOnly) {
        if (packageJson.version !== version) {
          checkFailed = true
          console.log(
            `- ${packageJson.name} has incorrect version: (expected ${version}) (actual ${packageJson.version})`
          )
        }
      } else {
        packageJson.version = version
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      }
    }
  })

// check Cargo.toml

const cargoFilePath = "./packages/target-tauri/src-tauri/Cargo.toml"
const configFile = readFileSync(cargoFilePath, 'utf8')

const currentVersionInCargo = /^version = "(.*?)"/m.exec(configFile)[1]

if (checkOnly){
  if (currentVersionInCargo !== version) {
    checkFailed = true
    console.log(
      `- delta tauri has incorrect version: (expected ${version}) (actual ${currentVersionInCargo})`
    )
  }
} else {
  writeFileSync(cargoFilePath, configFile.replace(/^version = "(.*?)"/m, `version = "${version}"`), 'utf8')
}


// TODO

if (checkFailed) {
  console.log("\nCheck failed, make sure you have run 'update:target-versions'")
  process.exit(1)
}
