const React = require('react')
const classNames = require('classnames')

const {
  getRegex
} = require('./emoji')

// Some of this logic taken from emoji-js/replacement
function getImageTag ({ match, sizeClass, key }) {
  return (
    <span
      key={key}
      className={classNames('emoji-container', sizeClass)}
    >
      {match[0]}
    </span>
  )
}

class Emojify extends React.Component {
  render () {
    const { text, sizeClass, renderNonEmoji } = this.props
    const results = []
    const regex = getRegex()

    // We have to do this, because renderNonEmoji is not required in our Props object,
    //  but it is always provided via defaultProps.
    if (!renderNonEmoji) {
      return
    }

    let match = regex.exec(text)
    let last = 0
    let count = 1

    if (!match) {
      return renderNonEmoji({ text, key: 0 })
    }

    while (match) {
      if (last < match.index) {
        const textWithNoEmoji = text.slice(last, match.index)
        results.push(renderNonEmoji({ text: textWithNoEmoji, key: count++ }))
      }

      results.push(getImageTag({ match, sizeClass, key: count++ }))

      last = regex.lastIndex
      match = regex.exec(text)
    }

    if (last < text.length) {
      results.push(renderNonEmoji({ text: text.slice(last), key: count++ }))
    }

    return results
  }
}

Emojify.defaultProps = {
  renderNonEmoji: ({ text }) => text
}

module.exports = Emojify
