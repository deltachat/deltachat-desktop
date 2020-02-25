// @ts-ignore
const EmojiConvertor = require('emoji-js-clean')
// We only really need the regExes and the emoji data of this module

const instance = new EmojiConvertor()
instance.init_unified()
instance.init_colons()

exports.getRegex = function() {
  return instance.rx_unified
}

exports.replaceColons = function(str) {
  return str.replace(instance.rx_colons, m => {
    const name = m.substr(1, m.length - 2)
    const code = instance.map.colons[name]
    if (code) {
      return instance.data[code][0][0]
    }

    return m
  })
}

function getCountOfAllMatches(str, regex) {
  let match = regex.exec(str)
  let count = 0

  if (!regex.global) {
    return match ? 1 : 0
  }

  while (match) {
    count += 1
    match = regex.exec(str)
  }

  return count
}

function hasNormalCharacters(str) {
  const noEmoji = str.replace(instance.rx_unified, '').trim()
  return noEmoji.length > 0
}

exports.getSizeClass = function(str) {
  if (hasNormalCharacters(str)) {
    return ''
  }

  const emojiCount = getCountOfAllMatches(str, instance.rx_unified)
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
