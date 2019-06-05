const React = require('react')
const classNames = require('classnames')

const MessageBody = require('../MessageBody')
const MessageMetaData = require('./MessageMetaData')

const { getIncrement } = require('./ExpireTimer')
const ContactName = require('./ContactName')
const { ContextMenu, ContextMenuTrigger, MenuItem } = require('react-contextmenu')
const Attachment = require('../Attachment')

const EXPIRATION_CHECK_MINIMUM = 2000
const EXPIRED_DELAY = 600

class Message extends React.Component {
  constructor (props) {
    super(props)

    this.captureMenuTrigger = this.captureMenuTrigger.bind(this)
    this.showMenu = this.showMenu.bind(this)

    this.menuTriggerRef = null
    this.expirationCheckInterval = null
    this.expiredTimeout = null

    this.state = {
      expiring: false,
      expired: false
    }
  }

  componentDidMount () {
    const { expirationLength } = this.props
    if (!expirationLength) {
      return
    }

    const increment = getIncrement(expirationLength)
    const checkFrequency = Math.max(EXPIRATION_CHECK_MINIMUM, increment)

    this.checkExpired()

    this.expirationCheckInterval = setInterval(() => {
      this.checkExpired()
    }, checkFrequency)
  }

  componentWillUnmount () {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval)
    }
    if (this.expiredTimeout) {
      clearTimeout(this.expiredTimeout)
    }
  }

  checkExpired () {
    const now = Date.now()
    const { expirationTimestamp, expirationLength } = this.props

    if (!expirationTimestamp || !expirationLength) {
      return
    }

    if (now >= expirationTimestamp) {
      this.setState({
        expiring: true
      })

      const setExpired = () => {
        this.setState({
          expired: true
        })
      }
      this.expiredTimeout = setTimeout(setExpired, EXPIRED_DELAY)
    }
  }

  renderAvatar () {
    const {
      authorName,
      authorAddress,
      authorProfileName,
      authorAvatarPath,
      authorColor,
      collapseMetadata,
      conversationType,
      direction,
      i18n
    } = this.props

    const title = `${authorName || authorAddress}${
      !authorName && authorProfileName ? ` ~${authorProfileName}` : ''
    }`

    if (
      collapseMetadata ||
      conversationType !== 'group' ||
      direction === 'outgoing'
    ) {
      return
    }

    if (!authorAvatarPath) {
      const label = authorName ? (authorName.trim()[0] || '#') : '#'
      const color = authorColor || 'green'

      return (
        <div className={classNames(
          'module-message__author-default-avatar'
        )}
        >
          <div
            style={{ 'backgroundColor': color }}
            className='module-message__author-default-avatar__label'>
            {label}
          </div>
        </div>
      )
    }

    return (
      <div className='module-message__author-avatar'>
        <img alt={i18n('contactAvatarAlt', [title])} src={authorAvatarPath} />
      </div>
    )
  }

  renderError (isCorrectSide) {
    const { status, direction } = this.props

    if (!isCorrectSide || status !== 'error') {
      return null
    }

    return (
      <div className='module-message__error-container'>
        <div
          className={classNames(
            'module-message__error',
            `module-message__error--${direction}`
          )}
        />
      </div>
    )
  }

  renderAuthor () {
    const {
      authorName,
      authorAddress,
      authorProfileName,
      conversationType,
      direction,
      i18n,
      authorColor
    } = this.props

    const title = authorName || authorAddress

    if (direction !== 'incoming' || conversationType !== 'group' || !title) {
      return null
    }

    return (
      <div className='module-message__author'>
        <ContactName
          phoneNumber={authorAddress}
          name={authorName}
          profileName={authorProfileName}
          module='module-message__author'
          i18n={i18n}
          color={authorColor}
        />
      </div>
    )
  }

  renderText () {
    const { text, i18n, direction, status } = this.props

    const contents =
      direction === 'incoming' && status === 'error'
        ? i18n('incomingError')
        : text

    if (!contents) {
      return null
    }

    return (
      <div
        dir='auto'
        className={classNames(
          'module-message__text',
          `module-message__text--${direction}`,
          status === 'error' && direction === 'incoming'
            ? 'module-message__text--error'
            : null
        )}
      >
        <MessageBody text={contents || ''} i18n={i18n} />
      </div>
    )
  }

  renderAttachment () {
    return Attachment.render(this.props)
  }

  captureMenuTrigger (triggerRef) {
    this.menuTriggerRef = triggerRef
  }

  showMenu (event) {
    if (this.menuTriggerRef) {
      this.menuTriggerRef.handleContextClick(event)
    }
  }

  renderMenu (isCorrectSide, triggerId) {
    const {
      attachment,
      direction,
      disableMenu,
      onDownload,
      onReply
    } = this.props

    if (!isCorrectSide || disableMenu) {
      return null
    }

    const downloadButton = attachment ? (
      <div
        onClick={onDownload}
        role='button'
        className={classNames(
          'module-message__buttons__download',
          `module-message__buttons__download--${direction}`
        )}
      />
    ) : null

    const replyButton = (
      <div
        onClick={onReply}
        role='button'
        className={classNames(
          'module-message__buttons__reply',
          `module-message__buttons__download--${direction}`
        )}
      />
    )

    const menuButton = (
      <ContextMenuTrigger id={triggerId} ref={this.captureMenuTrigger}>
        <div
          role='button'
          onClick={this.showMenu}
          className={classNames(
            'module-message__buttons__menu',
            `module-message__buttons__download--${direction}`
          )}
        />
      </ContextMenuTrigger>
    )

    const first = direction === 'incoming' ? downloadButton : menuButton
    const last = direction === 'incoming' ? menuButton : downloadButton

    return (
      <div
        className={classNames(
          'module-message__buttons',
          `module-message__buttons--${direction}`
        )}
      >
        {first}
        {replyButton}
        {last}
      </div>
    )
  }

  renderContextMenu (triggerId) {
    const {
      attachment,
      direction,
      status,
      onDelete,
      onDownload,
      onReply,
      onForward,
      onRetrySend,
      onShowDetail,
      i18n
    } = this.props

    const showRetry = status === 'error' && direction === 'outgoing'

    return (
      <ContextMenu id={triggerId}>
        {attachment ? (
          <MenuItem
            attributes={{
              className: 'module-message__context__download'
            }}
            onClick={onDownload}
          >
            {i18n('download_attachment_desktop')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__reply'
          }}
          onClick={onReply}
        >
          {i18n('reply_to_message_desktop')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__forward'
          }}
          onClick={onForward}
        >
          {i18n('menu_forward')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__more-info'
          }}
          onClick={onShowDetail}
        >
          {i18n('more_info_desktop')}
        </MenuItem>
        {showRetry ? (
          <MenuItem
            attributes={{
              className: 'module-message__context__retry-send'
            }}
            onClick={onRetrySend}
          >
            {i18n('retrySend')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__delete-message'
          }}
          onClick={onDelete}
        >
          {i18n('delete_message_desktop')}
        </MenuItem>
      </ContextMenu>
    )
  }

  render () {
    const {
      authorAddress,
      authorColor,
      direction,
      id,
      timestamp
    } = this.props
    const { expired, expiring } = this.state

    // This id is what connects our triple-dot click with our associated pop-up menu.
    //   It needs to be unique.
    const triggerId = String(id || `${authorAddress}-${timestamp}`)

    if (expired) {
      return null
    }

    return (
      <div
        onContextMenu={this.showMenu}
        className={classNames(
          'module-message',
          `module-message--${direction}`,
          expiring ? 'module-message--expired' : null
        )}
      >
        {this.renderAvatar()}
        {this.renderError(direction === 'incoming')}
        {this.renderMenu(direction === 'outgoing', triggerId)}
        <div
          onContextMenu={this.showMenu}
          className={classNames(
            'module-message__container',
            `module-message__container--${direction}`,
            direction === 'incoming'
              ? `module-message__container--incoming-${authorColor}`
              : null
          )}
        >
          {this.renderAuthor()}
          {this.renderAttachment()}

          {this.renderText()}
          <MessageMetaData {...this.props} />
        </div>
        {this.renderError(direction === 'outgoing')}
        {this.renderMenu(direction === 'incoming', triggerId)}
        {this.renderContextMenu(triggerId)}
      </div>
    )
  }
}

module.exports = Message
