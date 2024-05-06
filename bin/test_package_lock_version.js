import { readFile } from 'fs/promises';
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const colorize = (light, code) => str =>
  '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
const red = colorize(1, 31)
const grey = colorize(1, 37)

;(async () => {
  const packageObject = JSON.parse(
    await readFile(join(__dirname, '../package.json'), 'utf8')
  )
  const packageLock = JSON.parse(
    await readFile(join(__dirname, '../package-lock.json'), 'utf8')
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
