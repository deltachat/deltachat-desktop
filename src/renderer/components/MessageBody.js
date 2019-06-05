const React = require('react')
const classNames = require('classnames')

const { getSizeClass, getRegex, replaceColons } = require('./conversations/emoji')

const { previewRules, rules } = require('./MessageMarkdown')

const emojiRegex = getRegex()
const SimpleMarkdown = require('simple-markdown')

const previewParser = SimpleMarkdown.parserFor(previewRules, { inline: true })
const parser = SimpleMarkdown.parserFor(rules, { inline: true })
const ast2react = SimpleMarkdown.outputFor(rules, 'react')

class MessageBody extends React.Component {
  render () {
    const { text, disableJumbomoji, preview } = this.props
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
    const ast = (preview ? previewParser : parser)(emojifiedText)
    const res = ast2react(ast)
    return res
  }
}

module.exports = MessageBody
