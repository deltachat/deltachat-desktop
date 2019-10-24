const React = require('react')
const { useRef, useState } = require('react')
const classNames = require('classnames')

const MessageBody = require('./MessageBody')
const MessageMetaData = require('./MessageMetaData')

const ContactName = require('../conversations/ContactName')
const { ContextMenu, ContextMenuTrigger, MenuItem } = require('react-contextmenu')
const Attachment = require('./Attachment')

const MessageText = (props, onShowDetail) => {
  const { text, direction, status } = props

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
      <MessageBody text={text || ''} />
      {longMessage && <button onClick={onShowDetail}>...</button>}
    </div>
  )
}

const Avatar = ({ contact }) => {
  const {
    profileImage,
    color,
    name,
    address
  } = contact

  const alt = `${name || address}`

  if (profileImage) {
    return (
      <div className='module-message__author-avatar'>
        <img alt={alt} src={profileImage} />
      </div>
    )
  } else {
    return (
      <div className='module-message__author-default-avatar'
        alt={alt}
      >
        <div
          style={{ backgroundColor: color }}
          className='module-message__author-default-avatar__label'>
          {(name && name.trim()[0]) || '#'}
        </div>
      </div>
    )
  }
}

const Author = ({ contact }) => {
  const {
    color,
    name,
    address
  } = contact

  return (
    <div className='module-message__author'>
      <ContactName
        email={address}
        name={name}
        module='module-message__author'
        color={color}
      />
    </div>
  )
}

const InlineMenu = (MenuRef, showMenu, triggerId, props) => {
  const {
    attachment,
    direction,
    onDownload,
    onReply,
    viewType
  } = props
  const tx = window.translate

  const downloadButton = attachment && viewType !== 23 ? (
    <div
      onClick={onDownload}
      role='button'
      className={classNames(
        'module-message__buttons__download'
      )}
      aria-label={tx('save')}
    />
  ) : null

  const replyButton = (
    <div
      onClick={onReply}
      role='button'
      className={classNames(
        'module-message__buttons__reply'
      )}
    />
  )

  const menuButton = (
    <ContextMenuTrigger id={triggerId} ref={MenuRef}>
      <div
        role='button'
        onClick={showMenu}
        className={classNames(
          'module-message__buttons__menu'
        )}
        aria-label={tx('a11y_message_context_menu_btn_label')}
      />
    </ContextMenuTrigger>
  )

  const first = direction === 'incoming' ? downloadButton : menuButton
  const last = direction === 'incoming' ? menuButton : downloadButton

  return [(
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
  )]
}

const renderContextMenu = (props, textSelected, triggerId) => {
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
  } = props
  const tx = window.translate

  const showRetry = status === 'error' && direction === 'outgoing'

  return (
    <ContextMenu id={triggerId}>
      <MenuItem
        attributes={{
          hidden: !textSelected
        }}
        onClick={_ => {
          navigator.clipboard.writeText(window.getSelection().toString())
        }}
      >
        {tx('menu_copy_to_clipboard')}
      </MenuItem>
      {attachment ? (
        <MenuItem
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
          {tx('retry_send')}
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

const Message = (props) => {
  const {
    authorAddress,
    direction,
    id,
    timestamp,
    viewType,
    collapseMetadata,
    conversationType,
    message,
    text,
    disableMenu
  } = props

  // This id is what connects our triple-dot click with our associated pop-up menu.
  //   It needs to be unique.
  const triggerId = String(id || `${authorAddress}-${timestamp}`)

  const onShowDetail = props.onShowDetail

  const MenuRef = useRef(null)
  const [textSelected, setTextSelected] = useState(false)

  const showMenu = (event) => {
    if (MenuRef.current) {
      setTextSelected(window.getSelection().toString() !== '')
      MenuRef.current.handleContextClick(event)
    }
  }

  const menu = !disableMenu && InlineMenu(MenuRef, showMenu, triggerId, props)

  return (
    <div
      onContextMenu={showMenu}
      className={classNames(
        'module-message',
        `module-message--${direction}`,
        { 'module-message--sticker': viewType === 23 }
      )}
    >
      {!collapseMetadata && conversationType === 'group' && direction === 'incoming' && Avatar(message)}
      {direction === 'outgoing' && menu}
      <div
        onContextMenu={showMenu}
        className={classNames(
          'module-message__container',
          `module-message__container--${direction}`
        )}
      >
        {direction === 'incoming' && conversationType === 'group' && Author(message)}
        {Attachment.render(props)}

        {text && MessageText(props, onShowDetail)}
        <MessageMetaData {...props} />
      </div>
      {direction === 'incoming' && menu}
      <div onClick={ev => { ev.stopPropagation() }}>
        {renderContextMenu(props, textSelected, triggerId)}
      </div>
    </div>
  )
}

module.exports = Message
