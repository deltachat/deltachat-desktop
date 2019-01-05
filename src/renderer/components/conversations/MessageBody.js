const React = require('react')

// TODO move all util to a single file
const { getSizeClass } = require('./emoji')
const Emojify = require('./Emojify')
const AddNewLines = require('./AddNewLines')
const Linkify = require('./Linkify')

const renderNewLines = ({ text, key }) => (
  <AddNewLines key={key} text={text} />
)

const renderLinks = ({ text, key }) => (
  <Linkify key={key} text={text} renderNonLink={renderNewLines} />
)

/**
 * This component makes it very easy to use all three of our message formatting
 * components: `Emojify`, `Linkify`, and `AddNewLines`. Because each of them is fully
 * configurable with their `renderXXX` props, this component will assemble all three of
 * them for you.
 */
class MessageBody extends React.Component {
  render () {
    const { text, disableJumbomoji, disableLinks, i18n } = this.props
    const sizeClass = disableJumbomoji ? '' : getSizeClass(text)

    return (
      <Emojify
        text={text}
        sizeClass={sizeClass}
        renderNonEmoji={disableLinks ? renderNewLines : renderLinks}
        i18n={i18n}
      />
    )
  }
}

module.exports = MessageBody
