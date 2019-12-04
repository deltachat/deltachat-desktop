require('colors')

function formattedOutput (location, lines) {
  console.log(
    `${'Console log function'.red} in ${location.yellow}

${lines}

Consider using our logger (log.debug) or add this line ${'/* ignore-console-log */'.green} above to add an exception
${'------------------------------------------------'.blue}`
  )
}

const walk = require('walk')
const fs = require('fs')
const path = require('path')
const walker = walk.walk('./src')
let found = 0

walker.on('file', function (root, fileStats, next) {
  if (!fileStats.name.includes('.js')) next()
  const filename = path.join(root, fileStats.name)
  fs.readFile(filename, 'utf-8', function (err, data) {
    if (err) throw err
    const lines = data.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const previousLine = i === 0 ? '' : lines[i - 1]

      const lineContainsConsoleLog = line.indexOf('console.') !== -1 &&
          /console.(debug|log|info|error)\(/.test(line) === true

      if (!lineContainsConsoleLog) continue

      const ignoreConsoleLog = previousLine.includes('/* ignore-console-log */') ||
        /^\s*\/\//.test(line)

      if (ignoreConsoleLog) continue

      formattedOutput(
        `${filename}:${i + 1}`,
        lines.slice(i - 1, i + 2).join('\n').replace(
          line,
          string => string.replace(/^([^]*)(console.(?:debug|log|info|error))([^]*)$/, (_s, s1, s2, s3) => `${s1.cyan}${s2.red}${s3.cyan}`)
        )
      )
      found++
    }
    next()
  })
})

walker.on('errors', function (root, nodeStatsArray, next) {
  next()
})

walker.on('end', function () {
  console.log(`found ${found.toString()[found > 0 ? 'bgRed' : 'bgGreen']} misplaced console.log statements ( ${'// comment'.grey} lines were ignored)`)
  process.exit(
    found > 0 ? 1 : 0
  )
})
