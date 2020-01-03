import { DeltaChat } from 'deltachat-node'
import DeltaChatController from './controller'

export default class SplitOut {
  
  _controller: DeltaChatController
  
  constructor (controller: DeltaChatController) {
    this._controller = controller
  }

  get _dc (): DeltaChat {
    return this._controller._dc
  }
}
