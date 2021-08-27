import { join } from 'path'
import SplitOut from './splitout'

export default class DCContext extends SplitOut {
  maybeNetwork() {
    this.selectedAccountContext.maybeNetwork()
  }

  getAccountDir() {
    return join(this.selectedAccountContext.getBlobdir(), '..')
  }

  getConnectivity() {
    return this.selectedAccountContext.getConnectivity()
  }

  getConnectivityHTML() {
    return this.selectedAccountContext.getConnectivityHTML()
  }
}
