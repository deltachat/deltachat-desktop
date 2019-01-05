const React = require('react')
const classNames = require('classnames')
const is = require('@sindresorhus/is')

const {
  findImage,
  getRegex,
  getReplacementData,
  getTitle
} = require('./emoji')

// Some of this logic taken from emoji-js/replacement
function getImageTag ({ match, sizeClass, key }) {
  const result = getReplacementData(match[0], match[1], match[2])

  if (is.string(result)) {
    return <span key={key}>{match[0]}</span>
  }

  const img = findImage(result.value, result.variation)
  const title = getTitle(result.value)

  return (
    <img
      key={key}
      src={img.path}
      className={classNames('emoji', sizeClass)}
      data-codepoints={img.full_idx}
      title={`:${title}:`}
    />
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
