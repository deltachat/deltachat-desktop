import { getLogger } from '../../shared/logger'
import '../notifications'
import SplitOut from './splitout'
const log = getLogger('main/deltachat/login')

export default class DCLoginController extends SplitOut {
  async selectAccount(accountId: number) {
    log.debug('selectAccount', accountId)
    return true
  }

  logout() {
    log.info('Logged out')
  }
}
