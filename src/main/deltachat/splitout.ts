import DeltaChatController from './controller'

export default class SplitOut {
  controller: DeltaChatController

  constructor(controller: DeltaChatController) {
    this.controller = controller
  }

  get dc() {
    return this.controller.dc
  }

  get selectedAccountContext() {
    return this.controller.selectedAccountContext
  }

  get selectedAccountId() {
    return this.controller.selectedAccountId
  }
}
