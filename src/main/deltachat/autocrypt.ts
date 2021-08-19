import SplitOut from './splitout'
// import { getLogger } from '../../shared/logger'
// const log = getLogger('main/deltachat/autocrypt')

export default class DCAutocrypt extends SplitOut {
  initiateKeyTransfer(): Promise<string> {
    return this.selectedAccountContext.initiateKeyTransfer()
  }

  continueKeyTransfer(messageId: number, setupCode: string): Promise<unknown> {
    return this.selectedAccountContext.continueKeyTransfer(messageId, setupCode)
  }
}
