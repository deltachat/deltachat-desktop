import React from 'react'
import classNames from 'classnames'
import { getSizeClass, replaceColons } from '../conversations/emoji'
import { message2React } from './MessageMarkdown'

export default function MessageBody(props: {
  text: string
  disableJumbomoji?: boolean
  preview?: boolean
}): JSX.Element {
  const { text, disableJumbomoji, preview } = props
  // if text is only emojis and Jumbomoji is enabled
  const emojifiedText = trim(text.replace(/:[\w\d_\-+]*:/g, replaceColons))
  const sizeClass = disableJumbomoji ? '' : getSizeClass(emojifiedText)
  if (sizeClass !== '') {
    return (
      <span className={classNames('emoji-container', sizeClass)}>
        {emojifiedText}
      </span>
    )
  }
  if (preview) return <>{emojifiedText}</>
  return message2React(emojifiedText)
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

/** removes linebreaks at start and end */
function trim(str: string) {
  return str.replace(trimRegex, '')
}
