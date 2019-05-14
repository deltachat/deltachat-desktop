function initiateKeyTransfer (cb) {
  return this._dc.initiateKeyTransfer(cb)
}

function continueKeyTransfer (messageId, setupCode, cb) {
  return this._dc.continueKeyTransfer(messageId, setupCode, cb)
}

module.exports = function () {
  this.initiateKeyTransfer = initiateKeyTransfer.bind(this)
  this.continueKeyTransfer = continueKeyTransfer.bind(this)
}
