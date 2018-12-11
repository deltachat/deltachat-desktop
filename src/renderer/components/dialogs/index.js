const { remote } = require('electron')

const SetupMessage = require('./SetupMessage')
const MessageDetail = require('./MessageDetail')
const RenderMedia = require('./RenderMedia')
const ContactDetail = require('./ContactDetail')
const DeadDrop = require('./DeadDrop')
const KeyTransfer = require('./KeyTransfer')
const QrCode = require('./QrCode')
const ImexProgress = require('./ImexProgress')
const About = require('./About')

module.exports = {
  confirmation,
  SetupMessage,
  ContactDetail,
  DeadDrop,
  RenderMedia,
  MessageDetail,
  KeyTransfer,
  QrCode,
  ImexProgress,
  About
}

function confirmation (message, opts, cb) {
  if (!cb) cb = opts
  if (!opts) opts = {}
  const tx = window.translate
  var defaultOpts = {
    type: 'question',
    message: message,
    buttons: [tx('dialogs.confirmation.no'), tx('dialogs.confirmation.yes')]
  }
  remote.dialog.showMessageBox(Object.assign(defaultOpts, opts), response => {
    cb(response === 1) // eslint-disable-line
  })
}
