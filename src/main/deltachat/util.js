
export const integerToHexColor = (integerColor) => {
  return '#' + integerColor.toString(16)
}

export const escapeEmailForAccountFolder = (path) => {
  return encodeURIComponent(path).replace(/%/g, 'P')
}
