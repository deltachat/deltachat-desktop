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
  }

  /** @return {DeltaChat} */
  get _dc () {
    return this._controller._dc
  }
}
