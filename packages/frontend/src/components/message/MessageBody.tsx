import React from 'react'
import classNames from 'classnames'
import { parseAndRenderMessage } from './MessageParser'
import * as linkify from 'linkifyjs'

/** limit where message parser will not parse the message, limit of core is lower, this is just a failsafe */
const UPPER_LIMIT_FOR_PARSED_MESSAGES = 20_000

const MAX_BIG_EMOJI_COUNT = 6
const MAX_BYTE_SIZE_OF_EMOJI = 10 /* 10 is maybe already too generous? */
const MAX_STRING_LENGTH_FOR_BIG_EMOJI =
  MAX_BIG_EMOJI_COUNT * MAX_BYTE_SIZE_OF_EMOJI

/**
 * if a message contains only emojis and is not too long,
 * we display the emojis bigger as usual inline emojis
 */
function getSizeClass(str: string) {
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

function countEmojisIfOnlyContainsEmoji(str: string): number | null {
  const elements = linkify.tokenize(str)
  if (elements.length !== 1) {
    return null
  }
  if (
    elements[0].t === 'text' &&
    elements[0].tk &&
    elements[0].tk.length === 1
  ) {
    const firstToken = elements[0].tk[0]
    if (firstToken.t === 'EMOJI') {
      // use Intl.Segmenter to split grapheme clusters (emoji + skin tone modifier etc)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
      const segmenter = new (Intl as any).Segmenter('en', {
        // Split the input into segments at grapheme cluster
        // (user-perceived character) boundaries
        granularity: 'grapheme',
      })
      return [...segmenter.segment(firstToken.v)].length
    }
  }
  return null
}

function MessageBody({
  text,
  disableJumbomoji,
  nonInteractiveContent = false,
  tabindexForInteractiveContents,
}: {
  text: string
  disableJumbomoji?: boolean
  /**
   * Ensure that links and other things are non-interactive,
   * display them as regular text.
   */
  nonInteractiveContent?: boolean
  /**
   * Has no effect when {@link nonInteractiveContent} === true.
   */
  tabindexForInteractiveContents?: -1 | 0
}): React.ReactElement {
  if (text.length >= UPPER_LIMIT_FOR_PARSED_MESSAGES) {
    return <>{text}</>
  }
  const textTrimmed = trim(text)
  // if text is only emojis and Jumbomoji is enabled
  if (!disableJumbomoji) {
    const sizeClass = getSizeClass(textTrimmed)
    if (sizeClass !== undefined) {
      return (
        <span className={classNames('emoji-container', sizeClass)}>
          {textTrimmed}
        </span>
      )
    }
  }
  return parseAndRenderMessage(
    textTrimmed,
    nonInteractiveContent,
    tabindexForInteractiveContents ?? 0
  )
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

// Do not run expensive message parser multiple times for the same message
export default React.memo(MessageBody)

/** removes linebreaks at start and end */
function trim(str: string) {
  return str.replace(trimRegex, '')
}
