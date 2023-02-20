import DeltaChatController from './controller'

export default class SplitOut {
  private controller: DeltaChatController

  constructor(controller: DeltaChatController) {
    this.controller = controller
  }

  get rpc() {
    return this.controller.jsonrpcRemote.rpc
  }
}
