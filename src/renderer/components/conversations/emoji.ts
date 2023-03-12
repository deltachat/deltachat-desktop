// @ts-ignore
// We only really need the emoji data of this module
import EmojiConvertor from 'emoji-js-clean'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/emoji')

const instance = new EmojiConvertor()
instance.init_colons()

// taken from (new EmojiConvertor()).rx_colons
const colonEmojiCodeRegExp = /:[a-zA-Z0-9-_+]+:(:skin-tone-[2-6]:)?/g

export function replaceColons(str: string) {
  return str.replace(colonEmojiCodeRegExp, m => {
    const name = m.split(':')[1]
    const skintoneString = m.split(':')[3] // this property is optional
    const codePoints = instance.map.colons[name]
      ?.split('-')
      .map((c: string) => parseInt(c, 16))
    if (codePoints) {
      if (skintoneString) {
        const skintoneResult = /^skin-tone-([2-6])$/.exec(skintoneString)
        if (skintoneResult) {
          const skintoneNumber = Number(skintoneResult[1])
          codePoints.push(0x1f3fb + (skintoneNumber - 2))
        }
      }

      return String.fromCodePoint(...codePoints)
    }

    return m
  })
}

export function replaceColonsSafe(message: string) {
  try {
    return replaceColons(message)
  } catch (error) {
    log.warn('replaceColons failed', error)
    return message
  }
}

// Emojis might be comprised of multiple sub emojis, search for "unicode graphemes" online to learn more
// Thanks to https://stackoverflow.com/questions/10287887/get-grapheme-character-count-in-javascript-strings for pointing to `Intl.Segmenter`
let getEmojiCount: (input: string) => number
//@ts-ignore
if (typeof Intl.Segmenter === 'function') {
  //@ts-ignore
  getEmojiCount = input => [...new Intl.Segmenter().segment(input)].length
} else {
  log.warn(
    'Intl.Segmenter api is not available, emoji counting will be less percise'
  )
  getEmojiCount = input => input.length
}

// thanks to https://medium.com/reactnative/emojis-in-javascript-f693d0eb79fb for figuring this out.
const emojiRegEx =
  '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'
const MAX_BIG_EMOJI_COUNT = 6
const MAX_BYTE_SIZE_OF_EMOJI = 10 /* 10 is maybe already to generous? */
const MAX_STRING_LENGTH_FOR_BIG_EMOJI =
  MAX_BIG_EMOJI_COUNT * MAX_BYTE_SIZE_OF_EMOJI
const emojiRegExTestLine = new RegExp(
  `^${emojiRegEx}{1,${MAX_STRING_LENGTH_FOR_BIG_EMOJI}}$`
)

export function getSizeClass(str: string) {
  // if string is small enough and only contains emojis
  if (
    str.length > MAX_STRING_LENGTH_FOR_BIG_EMOJI ||
    !emojiRegExTestLine.test(str)
  ) {
    return ''
  } else {
    const emojiCount = getEmojiCount(str)
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
}
