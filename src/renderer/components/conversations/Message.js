const React = require('react')
const classNames = require('classnames')

const MessageBody = require('../MessageBody')
const MessageMetaData = require('./MessageMetaData')

const ContactName = require('./ContactName')
const { ContextMenu, ContextMenuTrigger, MenuItem } = require('react-contextmenu')
const Attachment = require('../Attachment')

class Message extends React.Component {
  constructor (props) {
    super(props)

    this.captureMenuTrigger = this.captureMenuTrigger.bind(this)
    this.showMenu = this.showMenu.bind(this)

    this.menuTriggerRef = null
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
      direction
    } = this.props
    const tx = window.translate

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
        <img alt={tx('contactAvatarAlt', [title])} src={authorAvatarPath} />
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
      authorColor
    } = this.props

    const title = authorName || authorAddress

    if (direction !== 'incoming' || conversationType !== 'group' || !title) {
      return null
    }

    return (
      <div className='module-message__author'>
        <ContactName
          email={authorAddress}
          name={authorName}
          profileName={authorProfileName}
          module='module-message__author'
          color={authorColor}
        />
      </div>
    )
  }

  renderText () {
    const { text, direction, status, onShowDetail } = this.props
    const tx = window.translate

    const contents =
      direction === 'incoming' && status === 'error'
        ? tx('incomingError')
        : text

    if (!contents) {
      return null
    }

    // TODO another check - don't check it only over string
    const longMessage = /\[.{3}\]$/.test(text)

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
        <MessageBody text={contents || ''} />
        {longMessage && <button onClick={onShowDetail}>...</button>}
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
      onShowDetail
    } = this.props
    const tx = window.translate

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
            {tx('download_attachment_desktop')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__reply'
          }}
          onClick={onReply}
        >
          {tx('reply_to_message_desktop')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__forward'
          }}
          onClick={onForward}
        >
          {tx('menu_forward')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__more-info'
          }}
          onClick={onShowDetail}
        >
          {tx('more_info_desktop')}
        </MenuItem>
        {showRetry ? (
          <MenuItem
            attributes={{
              className: 'module-message__context__retry-send'
            }}
            onClick={onRetrySend}
          >
            {tx('retrySend')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__delete-message'
          }}
          onClick={onDelete}
        >
          {tx('delete_message_desktop')}
        </MenuItem>
      </ContextMenu>
    )
  }

  render () {
    const {
      authorAddress,
      direction,
      id,
      timestamp
    } = this.props

    // This id is what connects our triple-dot click with our associated pop-up menu.
    //   It needs to be unique.
    const triggerId = String(id || `${authorAddress}-${timestamp}`)

    return (
      <div
        onContextMenu={this.showMenu}
        className={classNames(
          'module-message',
          `module-message--${direction}`
        )}
      >
        {this.renderAvatar()}
        {this.renderError(direction === 'incoming')}
        {this.renderMenu(direction === 'outgoing', triggerId)}
        <div
          onContextMenu={this.showMenu}
          className={classNames(
            'module-message__container',
            `module-message__container--${direction}`
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
