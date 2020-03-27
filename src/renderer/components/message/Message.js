import { onDownload } from './messageFunctions'
import React, { useRef, useState } from 'react'

import classNames from 'classnames'
import MessageBody from './MessageBody'
import MessageMetaData from './MessageMetaData'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import Attachment from '../attachment/messageAttachment'

const Avatar = (contact, onContactClick) => {
  const { profileImage, color, name, address } = contact

  const alt = `${name || address}`
  const onClick = () => onContactClick(contact)

  if (profileImage) {
    return (
      <div className='author-avatar' onClick={onClick}>
        <img alt={alt} src={profileImage} />
      </div>
    )
  } else {
    const codepoint = name && name.codePointAt(0)
    const initial = codepoint
      ? String.fromCodePoint(codepoint).toUpperCase()
      : '#'
    return (
      <div className='author-avatar default' alt={alt} onClick={onClick}>
        <div style={{ backgroundColor: color }} className='label'>
          {initial}
        </div>
      </div>
    )
  }
}

const ContactName = props => {
  const { email, name, profileName, module, color, onClick } = props
  const prefix = module || 'module-contact-name'

  const title = name || email
  const shouldShowProfile = Boolean(profileName && !name)
  const profileElement = shouldShowProfile ? (
    <span className={`${prefix}__profile-name`} style={{ color: color }}>
      ~{profileName || ''}
    </span>
  ) : null

  return (
    <span className={prefix} style={{ color: color }} onClick={onClick}>
      {title}
      {shouldShowProfile ? ' ' : null}
      {profileElement}
    </span>
  )
}

const Author = (contact, onContactClick) => {
  const { color, name, address } = contact

  return (
    <ContactName
      email={address}
      name={name}
      module='author'
      color={color}
      onClick={() => onContactClick(contact)}
    />
  )
}

const InlineMenu = (MenuRef, showMenu, triggerId, props) => {
  const { attachment, message, onReply, viewType } = props
  const tx = window.translate

  return (
    <div className='message-buttons'>
      {attachment && viewType !== 23 && (
        <div
          onClick={onDownload.bind(null, message.msg)}
          role='button'
          className='msg-button download hide-on-small'
          aria-label={tx('save')}
        />
      )}
      <div
        onClick={onReply}
        role='button'
        className='msg-button reply hide-on-small'
      />
      <ContextMenuTrigger id={triggerId} ref={MenuRef}>
        <div
          role='button'
          onClick={showMenu}
          className='msg-button menu'
          aria-label={tx('a11y_message_context_menu_btn_label')}
        />
      </ContextMenuTrigger>
    </div>
  )
}

const contextMenu = (props, textSelected, link, triggerId) => {
  const {
    attachment,
    direction,
    status,
    onDelete,
    message,
    text,
    // onReply,
    onForward,
    onRetrySend,
    onShowDetail,
  } = props
  const tx = window.translate

  let showRetry = status === 'error' && direction === 'outgoing'
  showRetry = false // TODO: retry send is not yet implemented

  return (
    <ContextMenu id={triggerId}>
      {link !== '' && (
        <MenuItem onClick={_ => navigator.clipboard.writeText(link)}>
          {tx('menu_copy_link_to_clipboard')}
        </MenuItem>
      )}
      {textSelected ? (
        <MenuItem
          onClick={_ => {
            navigator.clipboard.writeText(window.getSelection().toString())
          }}
        >
          {tx('menu_copy_selection_to_clipboard')}
        </MenuItem>
      ) : (
        <MenuItem
          onClick={_ => {
            navigator.clipboard.writeText(text)
          }}
        >
          {tx('menu_copy_to_clipboard')}
        </MenuItem>
      )}
      {attachment ? (
        <MenuItem onClick={onDownload.bind(null, message.msg)}>
          {tx('download_attachment_desktop')}
        </MenuItem>
      ) : null}
      {/*
      <MenuItem onClick={onReply}>
        {tx('reply_to_message_desktop')}
      </MenuItem>
       */}
      <MenuItem onClick={onForward}>{tx('menu_forward')}</MenuItem>
      <MenuItem onClick={onShowDetail}>{tx('more_info_desktop')}</MenuItem>
      {showRetry ? (
        <MenuItem onClick={onRetrySend}>{tx('retry_send')}</MenuItem>
      ) : null}
      <MenuItem onClick={onDelete}>{tx('delete_message_desktop')}</MenuItem>
    </ContextMenu>
  )
}

const Message = props => {
  const {
    direction,
    id,
    timestamp,
    viewType,
    conversationType,
    message,
    text,
    disableMenu,
    status,
    attachment,
    onContactClick,
    onClickMessageBody,
  } = props
  const tx = window.translate

  const authorAddress = message.contact.address

  // This id is what connects our triple-dot click with our associated pop-up menu.
  //   It needs to be unique.
  const triggerId = String(id || `${authorAddress}-${timestamp}`)

  const onShowDetail = props.onShowDetail

  const MenuRef = useRef(null)
  const [textSelected, setTextSelected] = useState(false)
  const [link, setLink] = useState('')

  const showMenu = event => {
    if (MenuRef.current) {
      setTextSelected(window.getSelection().toString() !== '')
      setLink(event.target.href || '')
      MenuRef.current.handleContextClick(event)
    }
  }

  const menu = !disableMenu && InlineMenu(MenuRef, showMenu, triggerId, props)

  // TODO another check - don't check it only over string
  const longMessage = /\[.{3}\]$/.test(text)

  return (
    <div
      onContextMenu={showMenu}
      className={classNames(
        'message',
        direction,
        { 'type-sticker': viewType === 23 },
        { error: status === 'error' },
        { forwarded: message.msg.isForwarded }
      )}
    >
      {conversationType === 'group' &&
        direction === 'incoming' &&
        Avatar(message.contact, onContactClick)}
      {menu}
      <div onContextMenu={showMenu} className='msg-container'>
        {message.msg.isForwarded && (
          <div className='forwarded-indicator'>{tx('forwarded_message')}</div>
        )}
        {direction === 'incoming' &&
          conversationType === 'group' &&
          Author(message.contact, onContactClick)}
        <div
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
          })}
          onClick={props.onClickMessageBody}
        >
          <Attachment
            {...{
              attachment,
              text,
              conversationType,
              direction,
              message,
            }}
          />

          <div dir='auto' className='text'>
            {message.msg.isSetupmessage ? (
              tx('autocrypt_asm_click_body')
            ) : (
              <MessageBody text={text || ''} />
            )}
          </div>
          {longMessage && <button onClick={onShowDetail}>...</button>}
          <MessageMetaData {...props} />
        </div>
      </div>
      <div
        onClick={ev => {
          ev.stopPropagation()
        }}
      >
        {contextMenu(props, textSelected, link, triggerId)}
      </div>
    </div>
  )
}

export default Message
