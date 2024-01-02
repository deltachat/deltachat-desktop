import React from 'react'
import classNames from 'classnames'
import { getSizeClass, replaceColons } from '../conversations/emoji'
import { message2React } from './MessageMarkdown'

export default function MessageBody({ text }: { text: string }): JSX.Element {
  // if text is only emojis and Jumbomoji is enabled
  const emojifiedText = trim(text.replace(/:[\w\d_\-+]*:/g, replaceColons))
  const sizeClass = getSizeClass(emojifiedText)
  if (sizeClass !== '') {
    return (
      <span className={classNames('emoji-container', sizeClass)}>
        {emojifiedText}
      </span>
    )
  }
  return message2React(emojifiedText, false)
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

/** removes linebreaks at start and end */
function trim(str: string) {
  return str.replace(trimRegex, '')
}
