const { remote } = require('electron')

const KeyTransfer = require('./KeyTransfer')
const SetupMessage = require('./SetupMessage')
const DeadDrop = require('./DeadDrop')

module.exports = {
  confirmation,
  SetupMessage,
  DeadDrop,
  KeyTransfer
}

function confirmation (message, cb) {
  const tx = window.translate
  const opts = {
    type: 'question',
    message: message,
    buttons: [tx('dialogs.confirmation.no'), tx('dialogs.confirmation.yes')]
  }
  remote.dialog.showMessageBox(opts, response => {
    cb(response === 1) // eslint-disable-line
  })
}
