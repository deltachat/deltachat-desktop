import React from 'react'
import classNames from 'classnames'
import { getSizeClass, replaceColons } from '../conversations/emoji'
import { message2React } from './MessageMarkdown'

function MessageBody({
  text,
  disableJumbomoji,
}: {
  text: string
  disableJumbomoji?: boolean
}): JSX.Element {
  // if text is only emojis and Jumbomoji is enabled
  const emojifiedText = trim(text.replace(/:[\w\d_\-+]*:/g, replaceColons))
  if (!disableJumbomoji) {
    const sizeClass = getSizeClass(emojifiedText)
    if (sizeClass !== undefined) {
      return (
        <span className={classNames('emoji-container', sizeClass)}>
          {emojifiedText}
        </span>
      )
    }
  }
  return message2React(emojifiedText, false)
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

// Do not run expensive message parser multiple times for the same message
export default React.memo(MessageBody)

/** removes linebreaks at start and end */
function trim(str: string) {
  return str.replace(trimRegex, '')
}
