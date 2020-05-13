import SplitOut from './splitout'
import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/autocrypt')

export default class DCAutocrypt extends SplitOut {
  initiateKeyTransfer() {
    return new Promise(resolve => {
      this._dc.initiateKeyTransfer2((key: string) => {
        resolve(key)
      })
    })
  }

  continueKeyTransfer(messageId: number, setupCode: string) {
    return new Promise(resolve => {
      this._dc.continueKeyTransfer2(messageId, setupCode, resolve)
    })
  }
}
