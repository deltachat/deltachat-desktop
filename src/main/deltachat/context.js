const SplitOut = require('./splitout')

module.exports = class DCContext extends SplitOut {
  maybeNetwork() {
    this._dc.maybeNetwork()
  }
}
