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
// IDEA: Should we also log on where the log function was called?
/**
 * @param {string} channel The part/module where the message was logged. Like 'Tanslations'
 * @param {Number} level The level of importance. 0 for debug, 1 for info, 2 for warning, 3 for error, 4 for critical error
 * @param {string} message the message (human readable)
 * @param {string} errorCode (optional) machine readable error code (string in snake_case)
 * @param {any|string} payload (optional) JSON payload or any other object that can be converted to a JSON string
 */
function log (channel, level, message, errorCode, payload) {
  logDB.push({ channel, level, message, errorCode, payload })

  const writeToLog = () => wstream.write(`"${channel}",${level},"${message}","${errorCode}",${JSON.stringify(payload)}\n`)
  if (wsUpState) {
    writeToLog()
  } else {
    eventEmitter.once('ws_online', () => writeToLog())
  }

  // TODO send update ipc to debug Window somehow

  if (channel === 'logger' || channel === 'core' || channel.indexOf('main') !== -1) {
    // send also to 'normal' dev console
    if (app.ipcReady) {
      windows.main.send('log', ...arguments)
    } else {
      app.once('ipcReady', () => windows.main.send('log', ...arguments))
    }
  }
}

function setupWriteStream () {
  const logDir = `${app.getPath('userData')}/logs`
  const logFilePath = pathResolve(`${logDir}/${(new Date()).toISOString()}.csv`)
  mkdirp(logDir, function (err) {
    if (err) throw err
    log('logger', 1, `Logfile: ${logFilePath}`, 'log_file_init', logFilePath)
    console.log(`Logfile: ${logFilePath}`)
    wstream = createWriteStream(logFilePath, { flags: 'w' })
    wstream.write('channel, level, message, errorCode, payload\n')
    eventEmitter.emit('ws_online')
    wsUpState = true
  })
}

function closeWriteStream () {
  wstream.end()
  wsUpState = false
}

module.exports = { log, setupWriteStream, closeWriteStream }
