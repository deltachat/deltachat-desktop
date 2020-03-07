export function integerToHexColor(integerColor: number) {
  return '#' + integerColor.toString(16)
}
export function escapeEmailForAccountFolder(path: string) {
  return encodeURIComponent(path).replace(/%/g, 'P')
}
