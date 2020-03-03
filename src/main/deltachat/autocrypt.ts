import SplitOut from './splitout'


export default class DCAutocrypt extends SplitOut {
  initiateKeyTransfer(cb: any) {
    return this._dc.initiateKeyTransfer(cb)
  }

  continueKeyTransfer(messageId: number, setupCode:any, cb: any) {
    return this._dc.continueKeyTransfer(messageId, setupCode, cb)
  }
}
