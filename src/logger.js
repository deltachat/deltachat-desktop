const esp = require('error-stack-parser')
const { app, remote } = require('electron')

const rc = remote ? remote.app.rc : app ? app.rc : {}

const LoggerVariants = [
  { log: console.debug, prefix: 'DEBUG' },
  { log: console.info, prefix: 'INFO' },
  { log: console.warn, prefix: 'WARNING' },
  { log: console.error, prefix: 'ERROR' },
  { log: console.error, prefix: 'CRITICAL' }
]

let handler

/** specify function that passes the message to the logger in the main process */
function setLogHandler (LogHandler) {
  handler = LogHandler
}

function log (channel, lvl, ...args) {
  var timestamp = new Date().toISOString()
  if (!handler) {
    console.log('Failed to log message - Handler not initilized yet')
    console.log(channel, ...args)
    throw Error('Failed to log message - Handler not initilized yet')
  }
  handler(timestamp, channel, lvl, ...args)
  if (rc['log-to-console']) {
    const variant = LoggerVariants[lvl]
    variant.log(variant.prefix, channel, ...args)
  }
}

function getStackTrace () {
  const stack = esp.parse(new Error('Get Stacktrace'))
  return stack.slice(2, stack.length)
}

class Logger {
  /**
     * {string} channel The part/module where the message was logged. Like 'Tanslations'
     */
  constructor (channel) {
    this.channel = channel
  }

  /**
     * Log a message on **debug** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  debug (message, payload, errorCode) {
    if (!rc['log-debug']) return
    log(this.channel, 0, message, errorCode, payload)
  }

  /**
     * Log a message on **info** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  info (message, payload, errorCode) {
    log(this.channel, 1, message, errorCode, payload)
  }

  /**
     * Log a message on **warning** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  warn (message, payload, errorCode) {
    log(this.channel, 2, message, errorCode, payload, getStackTrace())
  }

  /**
     * Log a message on **error** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  error (message, payload, errorCode) {
    // TODO add stacktrace to payload
    log(this.channel, 3, message, errorCode, payload, getStackTrace())
  }

  /**
     * Log a message on critical level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  critical (message, payload, errorCode) {
    // TODO add stacktrace to payload
    log(this.channel, 4, message, errorCode, payload, getStackTrace())
  }
}

/**
 * Creates a new Logger
 * @param {string} channel The part/module where the message was logged. Like 'Tanslations'
 * @returns {Logger}
*/
function getLogger (channel) {
  return new Logger(channel)
}

module.exports = { setLogHandler, Logger, getLogger }
