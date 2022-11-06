import DeltaChatController from './controller'

export default class SplitOut {
  controller: DeltaChatController

  constructor(controller: DeltaChatController) {
    this.controller = controller
  }

  get accounts() {
    return this.controller.account_manager
  }
}
