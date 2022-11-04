import { getLogger } from '../../shared/logger'
import '../notifications'
import SplitOut from './splitout'
const log = getLogger('main/deltachat/login')

export default class DCLoginController extends SplitOut {
  async selectAccount(accountId: number) {
    log.debug('selectAccount', accountId)
    this.controller.selectedAccountId = accountId
    if (this.controller._inner_selectedAccountContext) {
      this.controller.selectedAccountContext.unref()
    }
    this.controller._inner_selectedAccountContext = this.accounts.accountContext(
      accountId
    )
    return true
  }

  logout() {
    if (this.controller._inner_selectedAccountContext) {
      this.controller.selectedAccountContext.unref()
    }
    this.controller.selectedAccountId = null
    this.controller._inner_selectedAccountContext = null

    log.info('Logged out')
  }
}
