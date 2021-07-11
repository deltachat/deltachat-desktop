import SplitOut from './splitout'

export default class DCContext extends SplitOut {
  maybeNetwork() {
    this._dc.maybeNetwork()
  }

  requestQuotaReport() {
    this._dc.requestQuotaReport()
  }
}
