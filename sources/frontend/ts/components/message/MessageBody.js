import React from 'react'
import classNames from 'classnames'
import { getSizeClass, getRegex, replaceColons } from '../conversations/emoji'
const emojiRegex = getRegex()

export default function MessageBody(props) {
  const { text, disableJumbomoji, preview } = props
  // if text is only emojis and Jumbomoji is enabled
  const emojifiedText = trim(text.replace(/:[\w\d_\-+]*:/g, replaceColons))
  if (
    emojifiedText.length < 50 &&
    !disableJumbomoji &&
    emojifiedText.replace(emojiRegex, '') === ''
  ) {
    const sizeClass = disableJumbomoji ? '' : getSizeClass(emojifiedText)
    return (
      <span className={classNames('emoji-container', sizeClass)}>
        {emojifiedText}
      </span>
    )
  }
  return emojifiedText
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

/** removes linebreaks at start and end */
function trim(str) {
  return str.replace(trimRegex, '')
}
