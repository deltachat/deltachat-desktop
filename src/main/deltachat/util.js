
module.exports = {
  integerToHexColor: function (integerColor) {
    return '#' + integerColor.toString(16)
  },
  escapeEmailForAccountFolder: function (path) {
    return encodeURIComponent(path).replace(/%/g, 'P')
  }
}
