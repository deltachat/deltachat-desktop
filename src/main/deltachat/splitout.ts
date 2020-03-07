export default class SplitOut {
  _controller: import('./controller')

  constructor(controller: import('./controller')) {
    this._controller = controller
  }

  get _dc() {
    return this._controller._dc
  }
}
