import {
  onDownload,
  openAttachmentInShell,
  forwardMessage,
  openMessageInfo,
  setQuoteInDraft,
  privateReply,
  openMessageHTML,
  confirmDeleteMessage,
  downloadFullMessage,
} from './messageFunctions'
import React, { useContext } from 'react'
import reactStringReplace from 'react-string-replace'

import classNames from 'classnames'
import MessageBody from './MessageBody'
import MessageMetaData from './MessageMetaData'

import Attachment from '../attachment/messageAttachment'
import {
  MessageType,
  JsonContact,
  MessageQuote,
} from '../../../shared/shared-types'
import { isGenericAttachment } from '../attachment/Attachment'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import { joinCall, openViewProfileDialog } from '../helpers/ChatMethods'
import { C } from 'deltachat-node/dist/constants'
// import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { runtime } from '../../runtime'
import { AvatarFromContact } from '../Avatar'
import { ConversationType } from './MessageList'
// const log = getLogger('renderer/message')

import { getDirection } from '../../../shared/util'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { ContextMenuItem } from '../ContextMenu'
import { MessageDownloadState } from '../../../shared/constants'

const Avatar = (
  contact: JsonContact,
  onContactClick: (contact: JsonContact) => void
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

const AuthorName = (
  contact: JsonContact,
  onContactClick: (contact: JsonContact) => void,
  overrideSenderName?: string
) => {
  const { color, displayName } = contact

  return (
    <span
      key='author'
      className='author'
      style={{ color: color }}
      onClick={() => onContactClick(contact)}
    >
      {getAuthorName(displayName, overrideSenderName)}
    </span>
  )
}

const ForwardedTitle = (
  contact: JsonContact,
  onContactClick: (contact: JsonContact) => void,
  direction: 'incoming' | 'outgoing',
  conversationType: ConversationType,
  overrideSenderName?: string
) => {
  const tx = useTranslationFunction()

  const { displayName, color } = contact

  return (
    <div
      className='forwarded-indicator'
      onClick={() => onContactClick(contact)}
    >
      {conversationType.hasMultipleParticipants && direction !== 'outgoing'
        ? reactStringReplace(
            tx('forwarded_by', '$$forwarder$$'),
            '$$forwarder$$',
            () => (
              <span key='displayname' style={{ color: color }}>
                {overrideSenderName ? `~${overrideSenderName}` : displayName}
              </span>
            )
          )
        : tx('forwarded_message')}
    </div>
  )
}

function buildContextMenu(
  {
    message,
    text,
    conversationType,
  }: // onRetrySend,
  {
    message: MessageType | null
    text?: string
    conversationType: ConversationType
    // onRetrySend: Function
  },
  clickTarget: HTMLAnchorElement | null
): (false | ContextMenuItem)[] {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  if (!message) {
    throw new Error('connot show context menu for undefined message')
  }

  const isLink = clickTarget && !clickTarget.getAttribute('x-not-a-link')
  const email = clickTarget?.getAttribute('x-target-email')
  const link: string =
    clickTarget?.getAttribute('x-target-url') || clickTarget?.href || ''
  // grab selected text before clicking, otherwise the selection might be already gone
  const selectedText = window.getSelection()?.toString()
  const textSelected: boolean = selectedText !== null && selectedText !== ''

  /** Copy action, is one of the following, (in that order):
   *
   * - Copy [selection] to clipboard
   * - OR Copy link to clipboard
   * - OR Copy email to clipboard
   * - Fallback: OR Copy message text to copy
   */
  let copy_item: ContextMenuItem = {
    label: tx('menu_copy_text_to_clipboard'),
    action: () => {
      text && runtime.writeClipboardText(text)
    },
  }

  if (textSelected) {
    copy_item = {
      label: tx('menu_copy_selection_to_clipboard'),
      action: () => {
        runtime.writeClipboardText(selectedText as string)
      },
    }
  } else if (link !== '' && isLink) {
    copy_item = {
      label: tx('menu_copy_link_to_clipboard'),
      action: () => runtime.writeClipboardText(link),
    }
  } else if (email) {
    copy_item = {
      label: tx('menu_copy_email_to_clipboard'),
      action: () => runtime.writeClipboardText(email),
    }
  }

  const showAttachmentOptions = !!message.file && !message.isSetupmessage

  return [
    // Reply
    !conversationType.isDeviceChat && {
      label: tx('reply_noun'),
      action: setQuoteInDraft.bind(null, message.id),
    },
    // Reply privately -> only show in groups, don't show on info messages or outgoing messages
    conversationType.chatType === C.DC_CHAT_TYPE_GROUP &&
      message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL && {
        label: tx('reply_privately'),
        action: privateReply.bind(null, message),
      },
    copy_item,
    // Copy videocall link to clipboard
    message.videochatUrl !== '' && {
      label: tx('menu_copy_link_to_clipboard'),
      action: () => runtime.writeClipboardText(message.videochatUrl),
    },
    // Open Attachment
    showAttachmentOptions &&
      isGenericAttachment(message.file_mime) && {
        label: tx('open_attachment'),
        action: openAttachmentInShell.bind(null, message),
      },
    // Download attachment
    showAttachmentOptions && {
      label: tx('menu_export_attachment'),
      action: onDownload.bind(null, message),
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
      action: confirmDeleteMessage.bind(null, message),
    },
    // showRetry && {
    //   label:tx('retry_send'),
    //   action: onRetrySend
    // },
  ]
}

const Message = (props: {
  message: MessageType
  conversationType: ConversationType
  /* onRetrySend */
}) => {
  const { message, conversationType } = props
  const { id, viewType, text, hasLocation, isSetupmessage, hasHTML } = message
  const direction = getDirection(message)
  const status = mapCoreMsgStatus2String(message.state)
  const tx = useTranslationFunction()

  const screenContext = useContext(ScreenContext)
  const { openContextMenu, openDialog } = screenContext

  const showMenu: (
    event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>
  ) => void = event => {
    // the event.t is a workaround for labled links, as they will be able to contain markdown formatting in the lable in the future.
    const target = ((event as any).t || event.target) as HTMLAnchorElement
    const items = buildContextMenu(
      {
        message,
        text,
        conversationType,
      },
      target
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
  const onContactClick = async (contact: JsonContact) => {
    openViewProfileDialog(screenContext, contact.id)
  }

  let onClickMessageBody
  if (isSetupmessage) {
    onClickMessageBody = () =>
      openDialog('EnterAutocryptSetupMessage', { message })
  }

  let content
  if (message.viewType === C.DC_MSG_VIDEOCHAT_INVITATION) {
    return (
      <div className='videochat-invitation'>
        <div className='videochat-icon'>
          <span className='icon videocamera' />
        </div>
        <AvatarFromContact contact={message.sender} onClick={onContactClick} />
        <div className='break' />
        <div
          className='info-button'
          onContextMenu={showMenu}
          onClick={joinCall.bind(null, screenContext, id)}
        >
          {direction === 'incoming'
            ? tx('videochat_contact_invited_hint', message.sender.displayName)
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
        {message.isSetupmessage ? (
          tx('autocrypt_asm_click_body')
        ) : (
          <MessageBody text={text || ''} />
        )}
      </div>
    )
  }

  // we need this typeconversion, if we don't have it esbuild tries bundling deltachat-node again,
  // which fails becaus it imports stuff only availible in nodejs
  const downloadState = (message.downloadState as unknown) as MessageDownloadState

  if (downloadState !== MessageDownloadState.Done) {
    content = (
      <div className={'download'}>
        {text} {'- '}
        {downloadState == MessageDownloadState.Failure && (
          <span key='fail' className={'failed'}>
            {tx('download_failed')}
          </span>
        )}
        {downloadState == MessageDownloadState.InProgress && (
          <span key='downloading'>{tx('downloading')}</span>
        )}
        {(downloadState == MessageDownloadState.Failure ||
          downloadState === MessageDownloadState.Available) && (
          <button onClick={downloadFullMessage.bind(null, message.id)}>
            {tx('Download')}
          </button>
        )}
      </div>
    )
  }

  /** Whether to show author name and avatar */
  const showAuthor =
    conversationType.hasMultipleParticipants || message?.overrideSenderName

  return (
    <div
      onContextMenu={showMenu}
      className={classNames(
        'message',
        direction,
        { 'type-sticker': viewType === C.DC_MSG_STICKER },
        { error: status === 'error' },
        { forwarded: message.isForwarded },
        { 'has-html': hasHTML }
      )}
    >
      {showAuthor &&
        direction === 'incoming' &&
        Avatar(message.sender, onContactClick)}
      <div
        onContextMenu={showMenu}
        className='msg-container'
        style={{ borderColor: message.sender.color }}
      >
        {message.isForwarded &&
          ForwardedTitle(
            message.sender,
            onContactClick,
            direction,
            conversationType,
            message?.overrideSenderName
          )}
        {!message.isForwarded && (
          <div
            className={classNames('author-wrapper', {
              'can-hide': direction === 'outgoing' || !showAuthor,
            })}
          >
            {AuthorName(
              message.sender,
              onContactClick,
              message?.overrideSenderName
            )}
          </div>
        )}
        <div
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
          })}
          onClick={onClickMessageBody}
        >
          {message.quote !== null && <Quote quote={message.quote} />}
          {message.file && !isSetupmessage && (
            <Attachment
              {...{
                text,
                conversationType,
                direction,
                message,
                hasQuote: message.quote !== null,
              }}
            />
          )}
          {content}
          {hasHTML && (
            <div
              onClick={openMessageHTML.bind(null, message.id)}
              className='show-html'
            >
              {tx('show_full_message_in_browser')}
            </div>
          )}
          <MessageMetaData
            file_mime={(!isSetupmessage && message.file_mime) || null}
            direction={direction}
            status={status}
            text={text}
            hasLocation={hasLocation}
            timestamp={message.timestamp * 1000}
            padlock={message.showPadlock}
            onClickError={openMessageInfo.bind(null, message)}
          />
        </div>
      </div>
    </div>
  )
}

export default Message

export const Quote = ({ quote }: { quote: MessageQuote }) => {
  const screenContext = useContext(ScreenContext)
  const onContactClick = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation()
    event.preventDefault()

    if (!quote.message) return

    const message = await DeltaBackend.call(
      'messageList.getMessage',
      quote.message.messageId
    )
    if (message === null) return
    openViewProfileDialog(screenContext, message.sender.id)
  }

  return (
    <div
      className='quote-background'
      style={{ borderLeftColor: quote.message?.displayColor }}
    >
      <div
        className='quote has-message'
        style={{ borderLeftColor: quote.message?.displayColor }}
      >
        <div
          className='quote-author'
          style={{ color: quote.message?.displayColor }}
          onClick={onContactClick}
        >
          {quote.message &&
            getAuthorName(
              quote.message.displayName,
              quote.message.overrideSenderName
            )}
        </div>
        <div className='quoted-text'>
          <MessageBody text={quote.text} />
        </div>
      </div>
    </div>
  )
}

export function getAuthorName(
  displayName: string,
  overrideSenderName?: string
) {
  return overrideSenderName ? `~${overrideSenderName}` : displayName
}
