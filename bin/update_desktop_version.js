import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

const checkOnly = process.argv.includes('--check')

// Get version from argument or from root package.json
const args = process.argv.slice(2)
const versionArg = args.find(arg => !arg.startsWith('--'))
const rootPackageJson = JSON.parse(readFileSync('package.json', 'utf8'))

let version
if (versionArg) {
  if (checkOnly) {
    console.error('❌ Error: Cannot use --check with a version argument')
    console.error('Usage: node bin/update_desktop_version.js [version]')
    console.error('   or: node bin/update_desktop_version.js --check')
    process.exit(1)
  }

  // remove 'v' prefix if present
  version = versionArg.replace(/^v/, '')

  // Update root package.json
  rootPackageJson.version = version
  writeFileSync(
    'package.json',
    JSON.stringify(rootPackageJson, null, 2) + '\n',
    'utf8'
  )
  console.log(`✅ Updated root package.json to ${version}`)
} else {
  // No argument - use version from root package.json
  version = rootPackageJson.version
}

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
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + '\n'
        )
        console.log(`✅ Updated ${packageJson.name} to ${version}`)
      }
    }
  })

// check Cargo.toml

const cargoFilePath = './packages/target-tauri/src-tauri/Cargo.toml'
const configFile = readFileSync(cargoFilePath, 'utf8')

const currentVersionInCargo = /^version = "(.*?)"/m.exec(configFile)[1]

if (checkOnly) {
  if (currentVersionInCargo !== version) {
    checkFailed = true
    console.log(
      `- delta tauri has incorrect version: (expected ${version}) (actual ${currentVersionInCargo})`
    )
  }
} else {
  writeFileSync(
    cargoFilePath,
    configFile.replace(/^version = "(.*?)"/m, `version = "${version}"`),
    'utf8'
  )
  console.log(`✅ Updated Cargo.toml to ${version}`)
}

if (checkOnly) {
  if (checkFailed) {
    console.log(
      "\n❌ Check failed, make sure you have run 'pnpm update:target-versions'"
    )
    process.exit(1)
  } else {
    console.log('\n✅ All versions are in sync!')
  }
} else {
  console.log(`\n✅ All versions updated to ${version}!`)
}
