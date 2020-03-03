export default {
  integerToHexColor: function(integerColor: number) {
    return '#' + integerColor.toString(16)
  },
  escapeEmailForAccountFolder: function(path: string) {
    return encodeURIComponent(path).replace(/%/g, 'P')
  },
}
