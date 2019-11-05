import React from 'react'
import classNames from 'classnames'
import { getSizeClass, getRegex, replaceColons } from '../conversations/emoji'
import { previewRules, rules } from './MessageMarkdown'
import SimpleMarkdown from 'simple-markdown'

const emojiRegex = getRegex()
const previewParser = SimpleMarkdown.parserFor(previewRules, { inline: true })
const parser = SimpleMarkdown.parserFor(rules)
const ast2react = SimpleMarkdown.outputFor(rules, 'react')

export default function MessageBody (props) {
  const { text, disableJumbomoji, preview } = props
  // if text is only emojis and Jumbomoji is enabled
  const emojifiedText = text.replace(/:[\w\d_\-+]*:/g, replaceColons)
  if (
    emojifiedText.length < 50 &&
    !disableJumbomoji &&
    emojifiedText.replace(emojiRegex, '').trim() === ''
  ) {
    const sizeClass = disableJumbomoji ? '' : getSizeClass(emojifiedText)
    return (
      <span className={classNames('emoji-container', sizeClass)}>
        {emojifiedText}
      </span>
    )
  }
  const ast = (preview ? previewParser : parser)(emojifiedText.trim())
  const res = ast2react(ast)
  return (
    <>
      {res.map((element, index) => <div key={index}>{element}</div>)}
    </>
  )
}
