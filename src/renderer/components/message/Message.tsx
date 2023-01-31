import {
  onDownload,
  openAttachmentInShell,
  openForwardDialog,
  openMessageInfo,
  setQuoteInDraft,
  privateReply,
  openMessageHTML,
  confirmDeleteMessage,
  downloadFullMessage,
  openWebxdc,
} from './messageFunctions'
import React, { useContext } from 'react'
import reactStringReplace from 'react-string-replace'

import classNames from 'classnames'
import MessageBody from './MessageBody'
import MessageMetaData from './MessageMetaData'

import Attachment from '../attachment/messageAttachment'
import { isGenericAttachment } from '../attachment/Attachment'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import {
  joinCall,
  jumpToMessage,
  openViewProfileDialog,
} from '../helpers/ChatMethods'
import { C } from '@deltachat/jsonrpc-client'
// import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'
import { AvatarFromContact } from '../Avatar'
import { ConversationType } from './MessageList'
// const log = getLogger('renderer/message')

import { getDirection, truncateText } from '../../../shared/util'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { ContextMenuItem } from '../ContextMenu'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const Avatar = (
  contact: Type.Contact,
  onContactClick: (contact: Type.Contact) => void
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
  contact: Type.Contact,
  onContactClick: (contact: Type.Contact) => void,
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
  contact: Type.Contact,
  onContactClick: (contact: Type.Contact) => void,
  direction: 'incoming' | 'outgoing',
  conversationType: ConversationType,
  overrideSenderName?: string
) => {
  const tx = useTranslationFunction()

  const { displayName, color } = contact

  return (
    <div className='forwarded-indicator'>
      {conversationType.hasMultipleParticipants && direction !== 'outgoing' ? (
        reactStringReplace(
          tx('forwarded_by', '$$forwarder$$'),
          '$$forwarder$$',
          () => (
            <span
              onClick={() => onContactClick(contact)}
              key='displayname'
              style={{ color: color }}
            >
              {overrideSenderName ? `~${overrideSenderName}` : displayName}
            </span>
          )
        )
      ) : (
        <span onClick={() => onContactClick(contact)}>
          {tx('forwarded_message')}
        </span>
      )}
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
    message: Type.Message | null
    text?: string
    conversationType: ConversationType
    // onRetrySend: Function
  },
  clickTarget: HTMLAnchorElement | null
): (false | ContextMenuItem)[] {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  if (!message) {
    throw new Error('cannot show context menu for undefined message')
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
  let copy_item: ContextMenuItem | false = {
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
  if (copy_item && message.viewType === 'Sticker') {
    copy_item = false
  }

  const showAttachmentOptions = !!message.file && !message.isSetupmessage
  const showCopyImage = !!message.file && message.viewType === 'Image'

  return [
    // Reply
    !conversationType.isDeviceChat && {
      label: tx('reply_noun'),
      action: setQuoteInDraft.bind(null, message.id),
    },
    // Reply privately -> only show in groups, don't show on info messages or outgoing messages
    (conversationType.chatType === C.DC_CHAT_TYPE_GROUP ||
      conversationType.chatType === C.DC_CHAT_TYPE_MAILINGLIST) &&
      message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL && {
        label: tx('reply_privately'),
        action: privateReply.bind(null, message),
      },
    text !== '' && copy_item,
    // Copy image
    showCopyImage && {
      label: tx('menu_copy_image_to_clipboard'),
      action: () => {
        runtime.writeClipboardImage(message.file as string)
      },
    },
    // Copy videocall link to clipboard
    message.videochatUrl !== null &&
      message.videochatUrl !== '' && {
        label: tx('menu_copy_link_to_clipboard'),
        action: () =>
          runtime.writeClipboardText(message.videochatUrl as string),
      },
    // Open Attachment
    showAttachmentOptions &&
      message.viewType !== 'Webxdc' &&
      isGenericAttachment(message.fileMime) && {
        label: tx('open_attachment'),
        action: openAttachmentInShell.bind(null, message),
      },
    // Save Sticker to sticker collection
    message.viewType === 'Sticker' && {
      label: tx('save_sticker'),
      action: () =>
        BackendRemote.rpc.miscSaveSticker(
          selectedAccountId(),
          message.id,
          tx('saved')
        ),
    },
    // Download attachment
    showAttachmentOptions && {
      label: tx('save_as'),
      action: onDownload.bind(null, message),
    },
    // Forward message
    {
      label: tx('menu_forward'),
      action: openForwardDialog.bind(null, message),
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
  message: Type.Message
  conversationType: ConversationType
  /* onRetrySend */
}) => {
  const { message, conversationType } = props
  const { id, viewType, text, hasLocation, isSetupmessage, hasHtml } = message
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
        text: text || undefined,
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
  if (message.isInfo) {
    const isWebxdcInfo = message.systemMessageType === 'WebxdcInfoMessage'

    return (
      <div
        className={'info-message' + (isWebxdcInfo ? ' webxdc-info' : '')}
        id={String(message.id)}
        onContextMenu={showMenu}
        onClick={() => {
          isWebxdcInfo &&
            message.parentId &&
            jumpToMessage(message.parentId, true, message.id)
        }}
      >
        <div className='bubble'>
          {isWebxdcInfo && message.parentId && (
            <img
              src={runtime.getWebxdcIconURL(
                selectedAccountId(),
                message.parentId
              )}
              onClick={() => openWebxdc(message.id)}
            />
          )}
          {text}
          {direction === 'outgoing' &&
            (status === 'sending' || status === 'error') && (
              <div
                className={classNames('status-icon', status)}
                aria-label={tx(`a11y_delivery_status_${status}`)}
              />
            )}
        </div>
      </div>
    )
  }
  // Normal Message
  const onContactClick = async (contact: Type.Contact) => {
    openViewProfileDialog(screenContext, contact.id)
  }

  let onClickMessageBody
  if (isSetupmessage) {
    onClickMessageBody = () =>
      openDialog('EnterAutocryptSetupMessage', { message })
  }

  let content
  if (message.viewType === 'VideochatInvitation') {
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
        ) : text !== null ? (
          <MessageBody text={text} />
        ) : null}
      </div>
    )
  }

  // we need this typeconversion, if we don't have it esbuild tries bundling deltachat-node again,
  // which fails becaus it imports stuff only availible in nodejs
  const downloadState = message.downloadState

  if (downloadState !== 'Done') {
    content = (
      <div className={'download'}>
        {text} {'- '}
        {downloadState == 'Failure' && (
          <span key='fail' className={'failed'}>
            {tx('download_failed')}
          </span>
        )}
        {downloadState == 'InProgress' && (
          <span key='downloading'>{tx('downloading')}</span>
        )}
        {(downloadState == 'Failure' || downloadState === 'Available') && (
          <button onClick={downloadFullMessage.bind(null, message.id)}>
            {tx('download')}
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
        { 'type-sticker': viewType === 'Sticker' },
        { error: status === 'error' },
        { forwarded: message.isForwarded },
        { 'has-html': hasHtml }
      )}
      id={message.id.toString()}
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
            message?.overrideSenderName || undefined
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
              message?.overrideSenderName || undefined
            )}
          </div>
        )}
        <div
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
          })}
          onClick={onClickMessageBody}
        >
          {message.quote !== null && (
            <Quote quote={message.quote} msgParentId={message.id} />
          )}
          {message.file && !isSetupmessage && message.viewType !== 'Webxdc' && (
            <Attachment
              text={text || undefined}
              conversationType={conversationType}
              message={message}
              hasQuote={message.quote !== null}
            />
          )}
          {message.viewType === 'Webxdc' && (
            <WebxdcMessageContent message={message}></WebxdcMessageContent>
          )}
          {content}
          {hasHtml && (
            <div
              onClick={openMessageHTML.bind(null, message.id)}
              className='show-html'
            >
              {tx('show_full_message_in_browser')}
            </div>
          )}
          <MessageMetaData
            fileMime={(!isSetupmessage && message.fileMime) || null}
            direction={direction}
            status={status}
            hasText={text !== null && text !== ''}
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

export const Quote = ({
  quote,
  msgParentId,
}: {
  quote: Type.MessageQuote
  msgParentId?: number
}) => {
  const tx = window.static_translate

  const hasMessage = quote.kind === 'WithMessage'

  const authorStyle = hasMessage ? { color: quote.authorDisplayColor } : {}
  const borderStyle =
    !hasMessage || quote.isForwarded
      ? {}
      : { borderLeftColor: quote.authorDisplayColor }

  return (
    <div
      className='quote-background'
      onClick={() => {
        quote.kind === 'WithMessage' &&
          jumpToMessage(quote.messageId, true, msgParentId)
      }}
    >
      <div
        className={`quote ${hasMessage && 'has-message'}`}
        style={borderStyle}
      >
        <div className='quote-text'>
          {hasMessage && (
            <>
              {quote.isForwarded ? (
                <div className='quote-author'>
                  {reactStringReplace(
                    tx('forwarded_by', '$$forwarder$$'),
                    '$$forwarder$$',
                    () => (
                      <span key='displayname'>
                        {getAuthorName(
                          quote.authorDisplayName as string,
                          quote.overrideSenderName || undefined
                        )}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <div className='quote-author' style={authorStyle}>
                  {getAuthorName(
                    quote.authorDisplayName,
                    quote.overrideSenderName || undefined
                  )}
                </div>
              )}
            </>
          )}
          <div className='quoted-text'>
            <MessageBody text={quote.text || ''} />
          </div>
        </div>
        {hasMessage && quote.image && (
          <img className='quoted-image' src={quote.image} />
        )}
        {hasMessage && quote.viewType == 'Webxdc' && (
          <img
            className='quoted-webxdc-icon'
            src={runtime.getWebxdcIconURL(selectedAccountId(), quote.messageId)}
          />
        )}
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

function WebxdcMessageContent({ message }: { message: Type.Message }) {
  const tx = useTranslationFunction()
  if (message.viewType !== 'Webxdc') {
    return null
  }
  const info = message.webxdcInfo || {
    name: 'INFO MISSING!',
    document: undefined,
    summary: 'INFO MISSING!',
    internetAccess: false,
  }

  return (
    <div className='webxdc'>
      <img
        src={runtime.getWebxdcIconURL(selectedAccountId(), message.id)}
        alt={`icon of ${info.name}`}
        onClick={() => openWebxdc(message.id)}
      />
      <div
        className='name'
        title={`${info.document ? info.document + ' \n' : ''}${info.name}`}
      >
        {info.document && truncateText(info.document, 24) + ' - '}
        {truncateText(info.name, 42)}
      </div>
      <div>{info.summary}</div>
      {info.internetAccess && (
        <div className='experimental'>
          <b>EXPERIMENTAL</b> Webxdc that has full internet access, be careful!
          (only works in saved messages)
        </div>
      )}
      <button
        className={'delta-button-round'}
        onClick={() => openWebxdc(message.id)}
      >
        {tx('start_app')}
      </button>
    </div>
  )
}
