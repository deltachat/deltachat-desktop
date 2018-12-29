var handler
/** specify function that passes the message to the logger in the main process */
function setLogHandler (LogHandler) {
  handler = LogHandler
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
  debug (message, errorCode = undefined, payload = undefined) {
    handler.log(this.channel, 0, message, errorCode, payload)
  }
  /**
     * Log a message on **info** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  info (message, errorCode = undefined, payload = undefined) {
    handler.log(this.channel, 1, message, errorCode, payload)
  }
  /**
     * Log a message on **warning** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  warn (message, errorCode = undefined, payload = undefined) {
    handler.log(this.channel, 1, message, errorCode, payload)
  }
  /**
     * Log a message on **error** level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  error (message, errorCode = undefined, payload = undefined) {
    // TODO add stacktrace to payload
    handler.log(this.channel, 3, message, errorCode, payload)
  }
  /**
     * Log a message on critical level
     * @param {string} message the message (human readable)
     * @param {string} errorCode (optional) machine readable error code (string in snake_case)
     * @param {string} payload (optional) JSON payload
     */
  critical (message, errorCode = undefined, payload = undefined) {
    // TODO add stacktrace to payload
    handler.log(this.channel, 4, message, errorCode, payload)
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
