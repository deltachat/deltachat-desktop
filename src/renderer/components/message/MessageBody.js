import React from 'react'
import classNames from 'classnames'
import { getSizeClass, getRegex, replaceColons } from '../conversations/emoji'
import { previewRules, rules } from './MessageMarkdown'
import SimpleMarkdown from 'simple-markdown'

import logger from '../../../logger'
const log = logger.getLogger('renderer/messageMarkdown')

const emojiRegex = getRegex()
const previewParser = SimpleMarkdown.parserFor(previewRules, { inline: true })
const previewAst2react = SimpleMarkdown.outputFor(previewRules, 'react')
const parser = SimpleMarkdown.parserFor(rules)
const ast2react = SimpleMarkdown.outputFor(rules, 'react')

export default function MessageBody (props) {
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
  try {
    const ast = (preview ? previewParser : parser)(emojifiedText)
    const res = (preview ? previewAst2react : ast2react)(ast)
    return res
  } catch (error) {
    log.error('An Error Appeared, falling back to dumping the raw text', error)
    return <span>{emojifiedText}</span>
  }
}
const trimRegex = /^[\s\uFEFF\xA0\n\t]+|[\s\uFEFF\xA0\n\t]+$/g

/** removes linebreaks at start and end */
function trim (str) {
  return str.replace(trimRegex, '')
}
