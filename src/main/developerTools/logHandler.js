const { createWriteStream } = require('fs')
const mkdirp = require('mkdirp')
const { resolve: pathResolve } = require('path')
const { app } = require('electron')
const windows = require('../windows')
var events = require('events')
var eventEmitter = new events.EventEmitter()
var logDB = []
var wstream
var wsUpState = false
var fullLogFilePath
/**
 * Internal logger - please don't call directly unless you know what your doing
 * @param {string} timestamp timestamp
 * @param {string} channel The part/module where the message was logged. Like 'Tanslations'
 * @param {Number} level The level of importance. 0 for debug, 1 for info, 2 for warning, 3 for error, 4 for critical error
 * @param {string} message the message (human readable)
 * @param {string} errorCode (optional) machine readable error code (string in snake_case)
 * @param {any|string} payload (optional) JSON payload or any other object that can be converted to a JSON string
 * @param {StackFrame} stacktrace (optional) for errors -> gets converted to json
 */
function log (timestamp, channel, level, message, errorCode, payload, stacktrace) {
  logDB.push({ channel, level, message, errorCode, payload, stacktrace, timestamp })

  if (payload) {
    var payloadForLogfile = JSON.stringify(payload)
    if (payloadForLogfile.charAt(0) !== '"') {
      payloadForLogfile = JSON.stringify(payloadForLogfile)
    }
  }

  const logString = `${timestamp}|=|=|"${channel}"|=|=|${level}|=|=|"${message}"|=|=|"${errorCode || ''}"|=|=|${payloadForLogfile || ''}|=|=|${JSON.stringify(stacktrace || '')}`
    .replace(/\t/g, '  ').replace(/\n|(:?\r\n)/g, '') // Cleanup
    .replace(/\|=\|=\|/g, String.fromCharCode(9))

  const writeToLog = () => wstream.write(`${logString}\n`)
  if (wsUpState) {
    writeToLog()
  } else {
    eventEmitter.once('ws_online', () => writeToLog())
  }

  // TODO send update ipc to debug Window somehow

  if (channel === 'logger' || channel === 'core' || channel.indexOf('main') !== -1) {
    // send also to 'normal' dev console
    if (app.ipcReady) {
      windows.main.send('log', channel, level, message, errorCode, payload, stacktrace)
    } else {
      app.once('ipcReady', () => windows.main.send('log', channel, level, message, errorCode, payload, stacktrace))
    }
  }
}

function setupWriteStream () {
  const logDir = `${app.getPath('userData')}/logs`
  const logFilePath = pathResolve(`${logDir}/${(new Date()).toISOString()}.csv`)
  mkdirp(logDir, function (err) {
    if (err) throw err
    log((new Date()).toISOString(), 'logger', 1, `Logfile: ${logFilePath}`, 'log_file_init', logFilePath)
    console.log(`Logfile: ${logFilePath}`)
    fullLogFilePath = logFilePath
    wstream = createWriteStream(logFilePath, { flags: 'w' })
    wstream.once('ready', () => {
      wstream.write('timestamp|=|=|channel|=|=|level|=|=|message|=|=|errorCode|=|=|payload|=|=|stacktrace\n'.replace(/\|=\|=\|/g, String.fromCharCode(9)))
      eventEmitter.emit('ws_online')
      wsUpState = true
    })
  })
}

function closeWriteStream () {
  wstream.end()
  wsUpState = false
}

module.exports = { log, setupWriteStream, closeWriteStream, getFullLogFilePath: () => fullLogFilePath }
