const { createWriteStream } = require('fs')
const path = require('path')
const { getLogsPath } = require('../application-constants')

module.exports = () => {
  const dir = getLogsPath()
  const file = path.join(dir, `${(new Date()).toISOString()}.csv`)
  const stream = createWriteStream(file, { flags: 'w' })

  const handler = {
    /**
     * Internal logger - please don't call directly unless you know what your doing
     * @param {string} channel The part/module where the message was logged. Like 'Tanslations'
     * @param {Number} level The level of importance. 0 for debug, 1 for info, 2 for warning, 3 for error, 4 for critical error
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {any|string} payload (optional) JSON payload or any other object that can be converted to a JSON string
     * @param {StackFrame} stacktrace (optional) for errors -> gets converted to json
     */
    log: (channel, level, message, errorCode, payload, stacktrace) => {
      const timestamp = new Date().toISOString()
      if (payload) {
        var payloadForLogfile = JSON.stringify(payload)
        if (payloadForLogfile.charAt(0) !== '"') {
          payloadForLogfile = JSON.stringify(payloadForLogfile)
        }
      }

      const logString = `${timestamp}|=|=|"${channel}"|=|=|${level}|=|=|"${message}"|=|=|"${errorCode || ''}"|=|=|${payloadForLogfile || ''}|=|=|${JSON.stringify(stacktrace || '')}`
        .replace(/\t/g, '  ').replace(/\n|(:?\r\n)/g, '') // Cleanup
        .replace(/\|=\|=\|/g, String.fromCharCode(9))

      stream.write(`${logString}\n`)
    },
    end: () => stream.end()
  }

  handler.log(
    'logger',
    1,
    `Logfile: ${file}`,
    'log_file_init',
    file
  )
  console.log(`Logfile: ${file}`)

  return handler
}
