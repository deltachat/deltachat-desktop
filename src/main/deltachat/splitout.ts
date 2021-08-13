import DeltaChatController from './controller'

export default class SplitOut {
  _controller: DeltaChatController

  constructor(controller: DeltaChatController) {
    this._controller = controller
  }

  get dc() {
    return this._controller.dc
  }

  get selectedAccountContext() {
    return this._controller.selectedAccountContext
  }

  get selectedAccountId() {
    return this._controller.selectedAccountId
  }
}
