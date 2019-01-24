const esp = require('error-stack-parser')
const { app, remote } = require('electron')

const rc = remote ? remote.app.rc : app ? app.rc : {}

const LoggerVariants = [
  { log: console.debug, level: 'DEBUG' },
  { log: console.info, level: 'INFO' },
  { log: console.warn, level: 'WARNING' },
  { log: console.error, level: 'ERROR' },
  { log: console.error, level: 'CRITICAL' }
]

let handler

function setLogHandler (LogHandler) {
  handler = LogHandler
}

function log (channel, level, ...args) {
  const variant = LoggerVariants[level]
  if (!handler) {
    console.log('Failed to log message - Handler not initilized yet')
    throw Error('Failed to log message - Handler not initilized yet')
  }
  handler(channel, variant.level, ...args)
  if (rc['log-to-console']) {
    variant.log(channel, variant.level, ...args)
  }
}

function getStackTrace () {
  const stack = esp.parse(new Error('Get Stacktrace'))
  return stack.slice(2, stack.length)
}

class Logger {
  constructor (channel) {
    this.channel = channel
  }

  debug (...args) {
    if (!rc['log-debug']) return
    log(this.channel, 0, [], ...args)
  }

  info (...args) {
    log(this.channel, 1, [], ...args)
  }

  warn (...args) {
    log(this.channel, 2, getStackTrace(), ...args)
  }

  error (...args) {
    log(this.channel, 3, getStackTrace(), ...args)
  }

  critical (...args) {
    log(this.channel, 4, getStackTrace(), ...args)
  }
}

function getLogger (channel) {
  return new Logger(channel)
}

module.exports = { setLogHandler, Logger, getLogger }
