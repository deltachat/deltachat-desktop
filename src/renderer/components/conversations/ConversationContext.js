const React = require('react')
const classNames = require('classnames')

/**
 * Provides the parent elements necessary to allow the main Signal Desktop stylesheet to
 * apply (with no changes) to messages in the Style Guide.
 */
class ConversationContext extends React.Component {
  render () {
    const { theme, type, ios } = this.props

    return (
      <div
        className={classNames(theme || 'light-theme', ios ? 'ios-theme' : null)}
      >
        <div className={classNames('conversation', type || 'private')}>
          <div className='discussion-container' style={{ padding: '0 0.5em' }}>
            <ul className='message-list'>{this.props.children}</ul>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = ConversationContext
