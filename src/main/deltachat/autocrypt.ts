import SplitOut from './splitout'
import { DeltaChat } from 'deltachat-node'


export default class DCAutocrypt extends SplitOut {
  initiateKeyTransfer(...args: Parameters<typeof DeltaChat.prototype.initiateKeyTransfer>) {
    return this._dc.initiateKeyTransfer(...args)
  }

  continueKeyTransfer(...args: Parameters<typeof DeltaChat.prototype.continueKeyTransfer>) {
    return this._dc.continueKeyTransfer(...args)
  }
}
