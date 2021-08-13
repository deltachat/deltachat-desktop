import SplitOut from './splitout'

export default class DCContext extends SplitOut {
  maybeNetwork() {
    this.selectedAccountContext.maybeNetwork()
  }
}
