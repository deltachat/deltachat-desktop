import {
  onDownload,
  openAttachmentInShell,
  forwardMessage,
  deleteMessage,
  openMessageInfo,
  setQuoteInDraft,
  privateReply,
  openMessageHTML,
} from './messageFunctions'
import React, { useContext, useState, useEffect } from 'react'

import classNames from 'classnames'
import MessageBody from './MessageBody'
import MessageMetaData from './MessageMetaData'

import Attachment from '../attachment/messageAttachment'
import {
  MessageType,
  DCContact,
  MessageTypeAttachment,
  msgStatus,
} from '../../../shared/shared-types'
import { isGenericAttachment } from '../attachment/Attachment'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import { joinCall, openViewProfileDialog } from '../helpers/ChatMethods'
import { C } from 'deltachat-node/dist/constants'
// import { getLogger } from '../../../shared/logger'
import { useChatStore2, ChatStoreDispatch } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { runtime } from '../../runtime'
import { AvatarFromContact } from '../Avatar'
import { openDeadDropDecisionDialog } from '../dialogs/DeadDrop'
// const log = getLogger('renderer/message')

const Avatar = (
  contact: DCContact,
  onContactClick: (contact: DCContact) => void
) => {
  const { profileImage, color, displayName } = contact

  const onClick = () => onContactClick(contact)

  if (profileImage) {
    return (
      <div className='author-avatar' onClick={onClick}>
        <img alt={displayName} src={runtime.transformBlobURL(profileImage)} />
      </div>
    )
  } else {
    const codepoint = displayName && displayName.codePointAt(0)
    const initial = codepoint
      ? String.fromCodePoint(codepoint).toUpperCase()
      : '#'
    return (
      <div
        className='author-avatar default'
        aria-label={displayName}
        onClick={onClick}
      >
        <div style={{ backgroundColor: color }} className='label'>
          {initial}
        </div>
      </div>
    )
  }
}

const ContactName = (props: {
  name: string
  profileName?: string
  color: string
  onClick: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
}) => {
  const { name, profileName, color, onClick } = props

  const title = name
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
  const { color, displayName } = contact

  return (
    <ContactName
      name={displayName}
      color={color}
      onClick={() => onContactClick(contact)}
    />
  )
}

const ForwardedTitle = (
  contact: DCContact,
  onContactClick: (contact: DCContact) => void,
  direction: string,
  conversationType: string
) => {
  const tx = useTranslationFunction()

  return (
    <div
      className='forwarded-indicator'
      onClick={() => onContactClick(contact)}
    >
      {conversationType === 'group' && direction !== 'outgoing'
        ? tx('forwared_by', contact.displayName)
        : tx('forwarded_message')}
    </div>
  )
}

function buildContextMenu(
  {
    attachment,
    direction,
    status,
    message,
    text,
    conversationType,
    isDeviceChat,
  }: // onRetrySend,
  {
    attachment: MessageTypeAttachment
    direction: 'incoming' | 'outgoing'
    status: msgStatus
    message: MessageType | { msg: null }
    text?: string
    conversationType: 'group' | 'direct'
    isDeviceChat: boolean
    // onRetrySend: Function
  },
  link: string,
  chatStoreDispatch: ChatStoreDispatch
) {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)

  // eslint-disable-next-line
  const showRetry = status === 'error' && direction === 'outgoing'
  const showAttachmentOptions = attachment && !message.msg.isSetupmessage

  const textSelected: boolean = window.getSelection().toString() !== ''
  // grab selected text before clicking, otherwise the selection might be already gone
  const selectedText = window.getSelection()?.toString()

  return [
    // Reply
    !isDeviceChat && {
      label: tx('reply_noun'),
      action: setQuoteInDraft.bind(null, message.msg.id),
    },
    // Reply privately -> only show in groups, don't show on info messages or outgoing messages
    conversationType === 'group' &&
      message.msg.fromId > C.DC_CONTACT_ID_LAST_SPECIAL && {
        label: tx('reply_privately'),
        action: privateReply.bind(null, message.msg),
      },

    // Copy [selection] to clipboard
    textSelected
      ? {
          label: tx('menu_copy_selection_to_clipboard'),
          action: () => {
            runtime.writeClipboardText(selectedText)
          },
        }
      : {
          label: tx('menu_copy_text_to_clipboard'),
          action: () => {
            runtime.writeClipboardText(text)
          },
        },
    // Copy link to clipboard
    link !== '' && {
      label: tx('menu_copy_link_to_clipboard'),
      action: () => runtime.writeClipboardText(link),
    },
    // Copy videocall link to clipboard
    message.msg.videochatUrl !== '' && {
      label: tx('menu_copy_link_to_clipboard'),
      action: () => runtime.writeClipboardText(message.msg.videochatUrl),
    },
    // Open Attachment
    showAttachmentOptions &&
      isGenericAttachment(attachment) && {
        label: tx('open_attachment'),
        action: openAttachmentInShell.bind(null, message.msg),
      },
    // Download attachment
    showAttachmentOptions && {
      label: tx('menu_export_attachment'),
      action: onDownload.bind(null, message.msg),
    },
    // Forward message
    {
      label: tx('menu_forward'),
      action: forwardMessage.bind(null, message),
    },
    // Message details
    {
      label: tx('menu_message_details'),
      action: openMessageInfo.bind(null, message),
    },
    // Delete message
    {
      label: tx('delete_message_desktop'),
      action: deleteMessage.bind(null, message.msg, chatStoreDispatch),
    },
    // showRetry && {
    //   label:tx('retry_send'),
    //   action: onRetrySend
    // },
  ]
}

const Message = (props: {
  message: MessageType
  conversationType: 'group' | 'direct'
  isDeviceChat: boolean
  /* onRetrySend */
}) => {
  const { message, conversationType, isDeviceChat } = props
  const {
    id,
    direction,
    status,
    viewType,
    text,
    hasLocation,
    attachment,
    isSetupmessage,
    hasHTML,
  } = message.msg
  const tx = useTranslationFunction()

  const screenContext = useContext(ScreenContext)
  const { openContextMenu, openDialog } = screenContext
  const { chatStoreDispatch } = useChatStore2()

  const showMenu: (
    event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>
  ) => void = event => {
    const target = event.target as HTMLAnchorElement
    const link: string =
      target?.getAttribute('x-target-url') || target?.href || ''
    const items = buildContextMenu(
      {
        attachment,
        direction,
        status,
        message,
        text,
        conversationType,
        isDeviceChat,
      },
      link,
      chatStoreDispatch
    )
    const [cursorX, cursorY] = [event.clientX, event.clientY]

    event.preventDefault() // prevent default runtime context menu from opening
    openContextMenu({
      cursorX,
      cursorY,
      items,
    })
  }

  // Info Message
  if (message.isInfo)
    return (
      <div className='info-message' onContextMenu={showMenu}>
        <p>
          {text}
          {direction === 'outgoing' &&
            (status === 'sending' || status === 'error') && (
              <div
                className={classNames('status-icon', status)}
                aria-label={tx(`a11y_delivery_status_${status}`)}
              />
            )}
        </p>
      </div>
    )

  // Normal Message
  const onContactClick = async (contact: DCContact) => {
    openViewProfileDialog(screenContext, contact.id)
  }

  let onClickMessageBody
  const isDeadDrop = message.msg.chatId === C.DC_CHAT_ID_DEADDROP
  if (isSetupmessage) {
    onClickMessageBody = () =>
      openDialog('EnterAutocryptSetupMessage', { message })
  } else if (isDeadDrop) {
    onClickMessageBody = () => {
      openDeadDropDecisionDialog(message)
    }
  }

  let content
  if (message.msg.viewType === C.DC_MSG_VIDEOCHAT_INVITATION) {
    return (
      <div className='videochat-invitation'>
        <div className='videochat-icon'>
          <span className='icon videocamera' />
        </div>
        <AvatarFromContact contact={message.contact} onClick={onContactClick} />
        <div className='break' />
        <div
          className='info-button'
          onContextMenu={showMenu}
          onClick={joinCall.bind(null, screenContext, id)}
        >
          {direction === 'incoming'
            ? tx('videochat_contact_invited_hint', message.contact.displayName)
            : tx('videochat_you_invited_hint')}
          <div className='join-button'>
            {direction === 'incoming'
              ? tx('videochat_tap_to_join')
              : tx('rejoin')}
          </div>
        </div>
      </div>
    )
  } else {
    content = (
      <div dir='auto' className='text'>
        {message.msg.isSetupmessage ? (
          tx('autocrypt_asm_click_body')
        ) : (
          <MessageBody text={text || ''} />
        )}
      </div>
    )
  }

  const hasQuote = message.msg.quotedText !== null

  const onMessageDoubleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault()
    setQuoteInDraft(message.msg.id)
    window.getSelection().empty()
  }

  return (
    <div
      onContextMenu={showMenu}
      className={classNames(
        'message',
        direction,
        { 'type-sticker': viewType === C.DC_MSG_STICKER },
        { error: status === 'error' },
        { forwarded: message.msg.isForwarded }
      )}
      onDoubleClick={onMessageDoubleClick}
    >
      {conversationType === 'group' &&
        direction === 'incoming' &&
        Avatar(message.contact, onContactClick)}
      <div
        onContextMenu={showMenu}
        className='msg-container'
        style={{ borderColor: message.contact.color }}
      >
        {message.msg.isForwarded &&
          ForwardedTitle(
            message.contact,
            onContactClick,
            direction,
            conversationType
          )}
        {!message.msg.isForwarded && (
          <div
            className={classNames('author-wrapper', {
              'can-hide':
                direction === 'outgoing' || conversationType === 'direct',
            })}
          >
            {Author(message.contact, onContactClick)}
          </div>
        )}
        <div
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
          })}
          onClick={onClickMessageBody}
        >
          {hasQuote && (
            <Quote
              quotedText={message.msg.quotedText}
              quotedMessageId={message.msg.quotedMessageId}
            />
          )}
          {attachment && !isSetupmessage && (
            <Attachment
              {...{
                attachment,
                text,
                conversationType,
                direction,
                message,
                hasQuote,
              }}
            />
          )}
          {content}
          {hasHTML && (
            <button onClick={openMessageHTML.bind(null, message.id)}>
              {tx('show_full_message_in_browser')}
            </button>
          )}
          <MessageMetaData
            attachment={!isSetupmessage && attachment}
            direction={direction}
            status={status}
            text={text}
            hasLocation={hasLocation}
            timestamp={message.msg.sentAt}
            padlock={message.msg.showPadlock}
            onClickError={openMessageInfo.bind(null, message)}
          />
        </div>
      </div>
    </div>
  )
}

export default Message

export const Quote = ({
  quotedText,
  quotedMessageId,
}: {
  quotedText: string | null
  quotedMessageId: number
}) => {
  const [message, setMessage] = useState<MessageType>(null)

  useEffect(() => {
    if (quotedMessageId) {
      DeltaBackend.call('messageList.getMessage', quotedMessageId).then(msg => {
        if (msg.msg !== null) {
          setMessage(msg as MessageType)
        }
      })
    }
  }, [quotedMessageId])

  return (
    <div
      className='quote has-message'
      style={{ borderLeftColor: message && message.contact.color }}
    >
      <div
        className='quote-author'
        style={{ color: message && message.contact.color }}
      >
        {message && message.contact.displayName}
      </div>
      <div className='quoted-text'>
        <MessageBody text={quotedText} />
      </div>
    </div>
  )
}
