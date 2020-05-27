import { onDownload } from './messageFunctions'
import React, { useState } from 'react'

import classNames from 'classnames'
import MessageBody from './MessageBody'
import MessageMetaData from './MessageMetaData'

import { ContextMenuTrigger } from 'react-contextmenu'
import Attachment from '../attachment/messageAttachment'
import { MessageType, DCContact } from '../../../shared/shared-types'
import { attachment } from '../attachment/Attachment'
import {
  MessageContextMenuProps,
  openContextMenuFunction,
} from './MessageContextMenu'

export type msgStatus =
  | 'error'
  | 'sending'
  | 'draft'
  | 'delivered'
  | 'read'
  | ''

const Avatar = (
  contact: DCContact,
  onContactClick: (contact: DCContact) => void
) => {
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
      <div className='author-avatar default' aria-label={alt} onClick={onClick}>
        <div style={{ backgroundColor: color }} className='label'>
          {initial}
        </div>
      </div>
    )
  }
}

const ContactName = (props: {
  email: string
  name: string
  profileName?: string
  color: string
  onClick: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
}) => {
  const { email, name, profileName, color, onClick } = props

  const title = name || email
  const shouldShowProfile = Boolean(profileName && !name)
  const profileElement = shouldShowProfile ? (
    <span style={{ color: color }}>~{profileName || ''}</span>
  ) : null

  return (
    <span className='author' style={{ color: color }} onClick={onClick}>
      {title}
      {shouldShowProfile ? ' ' : null}
      {profileElement}
    </span>
  )
}

const Author = (
  contact: DCContact,
  onContactClick: (contact: DCContact) => void
) => {
  const { color, name, address } = contact

  return (
    <ContactName
      email={address}
      name={name}
      color={color}
      onClick={() => onContactClick(contact)}
    />
  )
}

const InlineMenu = (
  showMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  props: {
    attachment: attachment
    message: MessageType | { msg: null }
    // onReply
    viewType: number
  }
) => {
  const { attachment, message, /*onReply,*/ viewType } = props
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
      {/* <div
        onClick={onReply}
        role='button'
        className='msg-button reply hide-on-small'
      /> */}
      <div
        role='button'
        onClick={showMenu}
        className='msg-button menu'
        aria-label={tx('a11y_message_context_menu_btn_label')}
      />
    </div>
  )
}

const Message = (props: {
  direction: 'incoming' | 'outgoing'
  id: number
  timestamp: number
  viewType: number
  conversationType: 'group' | 'direct'
  message: MessageType
  text?: string
  disableMenu?: boolean
  status: msgStatus
  attachment: attachment
  onContactClick: (contact: DCContact) => void
  onClickMessageBody: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void
  onShowDetail: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  padlock: boolean
  onDelete: () => void
  onForward: () => void
  /* onRetrySend */
  reMeasureHeight?: () => void
  openContextMenu?: openContextMenuFunction
}) => {
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
    onShowDetail,
    reMeasureHeight,
  } = props
  const tx = window.translate

  const [textSelected, setTextSelected] = useState(false)
  const [link, setLink] = useState('')

  const showMenu: (
    event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>
  ) => void = event => {
    setTextSelected(window.getSelection().toString() !== '')
    setLink((event.target as any).href || '')
    props.openContextMenu(event, {
      textSelected,
      link,
      props,
    })
  }

  const menu = !disableMenu && InlineMenu(showMenu, props)

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
            reMeasureHeight={reMeasureHeight}
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
    </div>
  )
}

export default Message
