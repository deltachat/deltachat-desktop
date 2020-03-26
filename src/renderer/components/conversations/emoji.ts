// @ts-ignore
const EmojiConvertor = require('emoji-js-clean')
// We only really need the regExes and the emoji data of this module

const instance = new EmojiConvertor()
instance.init_unified()
instance.init_colons()

export function getRegex() {
  return instance.rx_unified
}

export function replaceColons(str: string) {
  return str.replace(instance.rx_colons, m => {
    const name = m.substr(1, m.length - 2)
    const code = instance.map.colons[name]
    if (code) {
      return instance.data[code][0][0]
    }

    return m
  })
}

export function getSizeClass(str: string) {
  const conv = str.replace(/-/g, '').replace(instance.rx_unified, '-')
  if (conv.replace(/-/g, '').trim().length > 0) {
    // has normal characters?
    return ''
  }
  const emojiCount = conv.match(/-/g)?.length

  if (emojiCount > 8) {
    return ''
  } else if (emojiCount > 6) {
    return 'small'
  } else if (emojiCount > 4) {
    return 'medium'
  } else if (emojiCount > 2) {
    return 'large'
  } else {
    return 'jumbo'
  }
}
