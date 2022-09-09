import { join } from 'path'
import SplitOut from './splitout'

export default class DCContext extends SplitOut {
  getAccountDir() {
    return join(this.selectedAccountContext.getBlobdir(), '..')
  }

  getConnectivityHTML() {
    return this.selectedAccountContext.getConnectivityHTML()
  }
}
