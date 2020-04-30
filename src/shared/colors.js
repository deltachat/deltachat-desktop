export const colorize = (light, code) => str => '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
export const blue = colorize(1, 34)
export const red = colorize(1, 31)
export const yellow = colorize(1, 33)
export const grey = colorize(0, 37)
export const green = colorize(1, 37)
export const cyan = colorize(1, 36)