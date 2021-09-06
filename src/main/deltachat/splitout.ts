import DeltaChatController from './controller'

export default class SplitOut {
  controller: DeltaChatController

  constructor(controller: DeltaChatController) {
    this.controller = controller
  }

  get accounts() {
    return this.controller.account_manager
  }

  get selectedAccountContext() {
    return this.controller.selectedAccountContext
  }

  get selectedAccountId() {
    return this.controller.selectedAccountId
  }
}
