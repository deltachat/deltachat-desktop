const { createWriteStream } = require('fs')
const path = require('path')
const { getLogsPath } = require('../application-constants')

function logName () {
  const dir = getLogsPath()
  const d = new Date()
  function pad (number) {
    return number < 10 ? '0' + number : number
  }
  const fileName = [
    `${d.getFullYear()}-`,
    `${pad(d.getMonth())}-`,
    `${pad(d.getDay())}-`,
    `${pad(d.getHours())}-`,
    `${pad(d.getMinutes())}-`,
    `${pad(d.getSeconds())}`,
    '.log'
  ].join('')
  return path.join(dir, fileName)
}

module.exports = () => {
  const fileName = logName()
  const stream = createWriteStream(fileName, { flags: 'w' })
  console.log(`Logfile: ${fileName}`)
  return {
    /**
     * Internal log handler. Do not call directly!
     * @param {string} channel The part/module where the message was logged from, e.g. 'main/deltachat'
     * @param {string} level DEBUG, INFO, WARNING, ERROR or CRITICAL
     * @param {array} stacktrace Stack trace if WARNING, ERROR or CRITICAL
     * @param {string} ...args Variadic parameters. Stringified before logged to file
     */
    log: (channel, level, stacktrace, ...args) => {
      const timestamp = new Date().toISOString()
      let line = [timestamp, channel, level]
      line = line
        .concat([stacktrace, ...args])
        .map(JSON.stringify)
      stream.write(`${line.join('\t')}\n`)
    },
    end: () => stream.end(),
    logFilePath: () => fileName
  }
}
