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
    this.controller.emit('ready')
    this.controller.ready = true
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

  close() {
    this.controller.webxdc._closeAll()
    if (!this.accounts) return
    this.accounts.stopIO()
    this.controller.unregisterEventHandler(this.accounts)
    this.accounts.close()
    this.controller._inner_account_manager = null
  }
}
