const { createWriteStream } = require('fs')
const path = require('path')
const { getLogsPath } = require('../application-constants')

module.exports = () => {
  const dir = getLogsPath()
  const fileName = path.join(dir, `${(new Date()).toISOString()}.log`)
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
      let line = [ timestamp, channel, level ]
      line = line
        .concat([ stacktrace, ...args ])
        .map(JSON.stringify)
      stream.write(`${line.join('\t')}\n`)
    },
    end: () => stream.end(),
    logFilePath: () => fileName
  }
}
