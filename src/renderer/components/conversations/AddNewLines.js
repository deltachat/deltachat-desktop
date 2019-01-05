const React = require('react')

class AddNewLines extends React.Component {
  render () {
    const { text, renderNonNewLine } = this.props
    const results = []
    const FIND_NEWLINES = /\n/g

    // We have to do this, because renderNonNewLine is not required in our Props object,
    //  but it is always provided via defaultProps.
    if (!renderNonNewLine) {
      return
    }

    let match = FIND_NEWLINES.exec(text)
    let last = 0
    let count = 1

    if (!match) {
      return renderNonNewLine({ text, key: 0 })
    }

    while (match) {
      if (last < match.index) {
        const textWithNoNewline = text.slice(last, match.index)
        results.push(
          renderNonNewLine({ text: textWithNoNewline, key: count++ })
        )
      }

      results.push(<br key={count++} />)

      last = FIND_NEWLINES.lastIndex
      match = FIND_NEWLINES.exec(text)
    }

    if (last < text.length) {
      results.push(renderNonNewLine({ text: text.slice(last), key: count++ }))
    }

    return results
  }
}

AddNewLines.defaultProps = {
  renderNonNewLine: ({ text }) => text
}

module.exports = AddNewLines
