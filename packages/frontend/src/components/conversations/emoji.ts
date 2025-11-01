// @ts-ignore
// We only really need the emoji data of this module
import EmojiConvertor from 'emoji-js-clean'
import { getLogger } from '../../../../shared/logger'
import { countEmojisIfOnlyContainsEmoji } from '../message/MessageParser'

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

const MAX_BIG_EMOJI_COUNT = 6
const MAX_BYTE_SIZE_OF_EMOJI = 10 /* 10 is maybe already too generous? */
const MAX_STRING_LENGTH_FOR_BIG_EMOJI =
  MAX_BIG_EMOJI_COUNT * MAX_BYTE_SIZE_OF_EMOJI

/**
 * if a message contains only emojis and is not too long,
 * we display the emojis bigger as usual inline emojis
 */
export function getSizeClass(str: string) {
  // if string is small enough and only contains emojis
  if (str.length > MAX_STRING_LENGTH_FOR_BIG_EMOJI) {
    return undefined
  } else {
    const emojiCount = countEmojisIfOnlyContainsEmoji(str)

    if (emojiCount == null || emojiCount > 8) {
      return undefined
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
