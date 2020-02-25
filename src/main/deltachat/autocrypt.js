const SplitOut = require('./splitout')
module.exports = class DCAutocrypt extends SplitOut {
  initiateKeyTransfer(cb) {
    return this._dc.initiateKeyTransfer(cb)
  }

  continueKeyTransfer(messageId, setupCode, cb) {
    return this._dc.continueKeyTransfer(messageId, setupCode, cb)
  }
}
