//@ts-check
import { readFile } from 'fs/promises';
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse as parseYAML } from 'yaml'

console.log("test versions of packages TODO!");
process.exit(1)

const __dirname = dirname(fileURLToPath(import.meta.url))

const colorize = (light, code) => str =>
  '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
const red = colorize(1, 31)
const grey = colorize(1, 37)

// check all files

;(async () => {
  const packageObject = JSON.parse(
    await readFile(join(__dirname, '../package.json'), 'utf8')
  )
  const packageLock = parseYAML(
    await readFile(join(__dirname, '../pnpm-lock.yaml'), 'utf8')
  )

  if (packageObject['version'] !== packageLock['version']) {
    console.error(
      red(
        `package-lock.json version is not equal to package.json version! Have you forget to update the version value?\n`
      ),
      `package-version: ${grey(packageObject['version'])}\n`,
      `packageLock-version: ${red(packageLock['version'])}`
    )
    process.exit(1)
  }
})()
