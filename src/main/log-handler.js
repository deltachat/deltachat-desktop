const { createWriteStream } = require('fs')
const path = require('path')
const { getLogsPath } = require('../application-constants')

module.exports = () => {
  const dir = getLogsPath()
  const file = path.join(dir, `${(new Date()).toISOString()}.log`)
  const stream = createWriteStream(file, { flags: 'w' })

  const handler = {
    /**
     * Internal log handler. Do not call directly!
     */
    log: (channel, level, ...args) => {
      const timestamp = new Date().toISOString()
      const out = [
        timestamp,
        channel,
        level
      ].concat(args.map(arg => JSON.stringify(arg)))
      stream.write(`${out.join(' ')}\n`)
    },
    end: () => stream.end()
  }

  console.log(`Logfile: ${file}`)

  return handler
}
