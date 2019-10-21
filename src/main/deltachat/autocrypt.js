/**
 * @typedef {import('deltachat-node')} DeltaChat
 */
module.exports = class DCAutocrypt {
  /**
   * @param {DeltaChat} dcNode
   */
  constructor (dcNode) {
    this._dc = dcNode
  }

  initiateKeyTransfer (cb) {
    return this._dc.initiateKeyTransfer(cb)
  }

  continueKeyTransfer (messageId, setupCode, cb) {
    return this._dc.continueKeyTransfer(messageId, setupCode, cb)
  }
}
