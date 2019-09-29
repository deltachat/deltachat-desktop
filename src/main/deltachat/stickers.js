function getStickers() {
  return {
    test: ['/tmp/01.png', '/tmp/02.png']
  }
}


module.exports = function () {
  this.getStickers = getStickers.bind(this)
}
