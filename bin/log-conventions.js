//@ts-check
const colorize = (light, code) => str =>
  '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
const blue = colorize(1, 34)
const red = colorize(1, 31)
const yellow = colorize(1, 33)
const grey = colorize(0, 37)
const green = colorize(1, 37)
const cyan = colorize(1, 36)
const bgGreen = colorize(42, 1)
const bgRed = colorize(41, 1)

function formattedOutput(location, lines) {
  console.log(
    `${red('Console log function')} in ${yellow(location)}

${lines}

Consider using our logger (log.debug) or add this line ${green(
      '/* ignore-console-log */'
    )} above to add an exception (or add your file to '.log.convention.ignore')
${blue('------------------------------------------------')}`
  )
}

import { readFile } from 'fs/promises'
import walk from 'ignore-walk'
import { basename, relative } from 'path'
//@ts-ignore
const files = await walk({
  ignoreFiles: ['.log.convention.ignore', '.gitignore'],
})
let found = 0

for (const file of files) {
  if (
    !file.endsWith('.ts') &&
    !file.endsWith('.js') &&
    !file.endsWith('.mjs') &&
    !file.endsWith('.mts') &&
    !file.endsWith('.tsx') &&
    !file.endsWith('.jsx')
  ) {
    continue
  }

  //@ts-ignore
  const data = await readFile(file, 'utf-8')

  const lines = data.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const previousLine = i === 0 ? '' : lines[i - 1]

    const lineContainsConsoleLog =
      line.indexOf('console.') !== -1 &&
      /console.(debug|log|info|error)\(/.test(line) === true

    if (!lineContainsConsoleLog) continue

    const ignoreConsoleLog =
      previousLine.includes('/* ignore-console-log */') || /^\s*\/\//.test(line)

    if (ignoreConsoleLog) continue

    const filename = relative(process.cwd(), file)

    formattedOutput(
      `${filename}:${i + 1}`,
      lines
        .slice(i - 1, i + 2)
        .join('\n')
        .replace(line, string =>
          string.replace(
            /^([^]*)(console.(?:debug|log|info|error))([^]*)$/,
            (_s, s1, s2, s3) => `${cyan(s1)}${red(s2)}${cyan(s3)}`
          )
        )
    )
    found++
  }
}

console.log(
  `found ${[
    found > 0 ? bgRed(found.toString()) : bgGreen(found.toString()),
  ]} misplaced console.log statements ( ${grey(
    '// comment'
  )} lines were ignored)`
)
process.exit(found > 0 ? 1 : 0)
