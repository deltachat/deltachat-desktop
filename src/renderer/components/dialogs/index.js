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
  var opts = {
    type: 'question',
    message: message,
    buttons: ['No', 'Yes']
  }
  remote.dialog.showMessageBox(opts, cb)
}
