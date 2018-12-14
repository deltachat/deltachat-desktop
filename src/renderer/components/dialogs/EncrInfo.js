const { remote, ipcRenderer } = require('electron')

module.exports = function (contactId, cb) {
  if (!cb) cb = () => {}
  var encrInfo = ipcRenderer.sendSync('dispatchSync', 'getEncrInfo', contactId)
  var opts = {
    type: 'info',
    message: encrInfo,
    buttons: ['ok']
  }
  remote.dialog.showMessageBox(opts, cb)
}
