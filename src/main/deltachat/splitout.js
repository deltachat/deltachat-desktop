/**
 * @typedef {import('deltachat-node')} DeltaChat
 */
module.exports = class SplitOut {
  /**
   * @param {DeltaChat} dcNode
   */
  constructor (dcNode) {
    this._dc = dcNode
  }
}
