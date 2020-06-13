import SplitOut from './splitout'
import { getLogger } from '../../shared/logger'
import DeltaChat from 'deltachat-node'

const log = getLogger('main/deltachat/autocrypt')

export default class DCAutocrypt extends SplitOut {
  initiateKeyTransfer(): Promise<string> {
    return this._dc.initiateKeyTransfer()
  }

  continueKeyTransfer(messageId: number, setupCode: string): Promise<unknown> {
    return this._dc.continueKeyTransfer(messageId, setupCode)
  }
}
