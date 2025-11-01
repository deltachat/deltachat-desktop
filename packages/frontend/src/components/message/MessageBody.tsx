import React from 'react'
import classNames from 'classnames'
import { getSizeClass } from '../conversations/emoji'
import { parseAndRenderMessage } from './MessageParser'

/** limit where message parser will not parse the message, limit of core is lower, this is just a failsafe */
const UPPER_LIMIT_FOR_PARSED_MESSAGES = 20_000

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
