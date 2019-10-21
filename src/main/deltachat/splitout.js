/**
 * @typedef {import('deltachat-node')} DeltaChat
 * @typedef {import('./index')} DeltaChatController
 */
module.exports = class SplitOut {
  /**
   * @param {DeltaChatController} controller
   */
  constructor (controller) {
    this._controller = controller
    /** @type {DeltaChat} */
    this._dc = controller._dc
  }
}
