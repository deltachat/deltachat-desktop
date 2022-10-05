import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'
import '../notifications'
import SplitOut from './splitout'
import { DeltaChatAccount } from '../../shared/shared-types'
import { DesktopSettings } from '../desktop_settings'
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

    log.info('Ready, starting io...')
    this.controller.selectedAccountContext.startIO()
    log.debug('Started IO')

    this.controller.emit('ready')
    DesktopSettings.update({ lastAccount: accountId })

    log.info('dc_get_info', this.selectedAccountContext.getInfo())

    this.controller.ready = true
    return true
  }

  logout() {
    DesktopSettings.update({ lastAccount: undefined })

    if (!DesktopSettings.state.syncAllAccounts) {
      this.selectedAccountContext.stopIO()
    }
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

  async _accountInfo(accountId: number): Promise<DeltaChatAccount> {
    const accountContext = this.accounts.accountContext(accountId)

    if (accountContext.isConfigured()) {
      const selfContact = accountContext.getContact(C.DC_CONTACT_ID_SELF)
      if (!selfContact) {
        log.error('selfContact is undefined')
      }
      const [display_name, addr, profile_image, color] = [
        accountContext.getConfig('displayname'),
        accountContext.getConfig('addr'),
        selfContact?.getProfileImage() || '',
        selfContact?.color || 'red',
      ]
      accountContext.unref()
      return {
        type: 'configured',
        id: accountId,
        display_name,
        addr,
        profile_image,
        color,
      }
    } else {
      accountContext.unref()
      return {
        type: 'unconfigured',
        id: accountId,
      }
    }
  }
}
