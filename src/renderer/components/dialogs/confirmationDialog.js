const { remote } = require('electron')

module.exports = function confirmation (message, opts, cb) {
  if (!cb) cb = opts
  if (!opts) opts = {}
  const tx = window.translate
  var defaultOpts = {
    type: 'question',
    message: message,
    buttons: [tx('no'), tx('yes')]
  }
  remote.dialog.showMessageBox(Object.assign(defaultOpts, opts), response => {
    cb(response === 1) // eslint-disable-line
  })
}
