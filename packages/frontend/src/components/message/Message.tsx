import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import reactStringReplace from 'react-string-replace'
import classNames from 'classnames'
import { C, T } from '@deltachat/jsonrpc-client'

import MessageBody from './MessageBody'
import MessageMetaData, { isMediaWithoutText } from './MessageMetaData'
import {
  onDownload,
  openAttachmentInShell,
  openForwardDialog,
  openMessageInfo,
  setQuoteInDraft,
  openMessageHTML,
  confirmDeleteMessage,
  downloadFullMessage,
  openWebxdc,
} from './messageFunctions'
import Attachment from '../attachment/messageAttachment'
import { isGenericAttachment } from '../attachment/Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { AvatarFromContact } from '../Avatar'
import { ConversationType } from './MessageList'
import { truncateText } from '@deltachat-desktop/shared/util'
import { getDirection } from '../../utils/getDirection'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { ContextMenuItem } from '../ContextMenu'
import { onDCEvent, BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import {
  ProtectionBrokenDialog,
  ProtectionEnabledDialog,
} from '../dialogs/ProtectionStatusDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import usePrivateReply from '../../hooks/chat/usePrivateReply'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useVideoChat from '../../hooks/useVideoChat'
import { useReactionsBar, showReactionsUi } from '../ReactionsBar'
import EnterAutocryptSetupMessage from '../dialogs/EnterAutocryptSetupMessage'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import Reactions from '../Reactions'
import ShortcutMenu from '../ShortcutMenu'
import InvalidUnencryptedMailDialog from '../dialogs/InvalidUnencryptedMail'
import Button from '../Button'
import VCardComponent from './VCard'

import styles from './styles.module.scss'

import type { OpenDialog } from '../../contexts/DialogContext'
import type { PrivateReply } from '../../hooks/chat/usePrivateReply'
import type { JumpToMessage } from '../../hooks/chat/useMessage'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'
import { useRovingTabindex } from '../../contexts/RovingTabindex'

const Avatar = ({
  contact,
  onContactClick,
  tabIndex,
}: {
  contact: T.Contact
  onContactClick: (contact: T.Contact) => void
  tabIndex: -1 | 0
}) => {
  const { profileImage, color, displayName } = contact

  const onClick = () => onContactClick(contact)

  if (profileImage) {
    return (
      <button className='author-avatar' onClick={onClick} tabIndex={tabIndex}>
        <img alt={displayName} src={runtime.transformBlobURL(profileImage)} />
      </button>
    )
  } else {
    const codepoint = displayName && displayName.codePointAt(0)
    const initial = codepoint
      ? String.fromCodePoint(codepoint).toUpperCase()
      : '#'
    return (
      <button
        className='author-avatar default'
        aria-label={displayName}
        onClick={onClick}
        tabIndex={tabIndex}
      >
        <div style={{ backgroundColor: color }} className='label'>
          {initial}
        </div>
      </button>
    )
  }
}

const AuthorName = ({
  contact,
  onContactClick,
  overrideSenderName,
  tabIndex,
}: {
  contact: T.Contact
  onContactClick: (contact: T.Contact) => void
  overrideSenderName: string | null
  tabIndex: -1 | 0
}) => {
  const accountId = selectedAccountId()
  const { color, id } = contact
  const [displayName, setDisplayName] = useState<string>(contact.displayName)

  useEffect(() => {
    return onDCEvent(accountId, 'ContactsChanged', async ({ contactId }) => {
      if (contactId !== id) {
        return
      }

      const updatedContact = await BackendRemote.rpc.getContact(
        accountId,
        contactId
      )
      setDisplayName(updatedContact.displayName)
    })
  }, [accountId, id])

  return (
    <button
      key='author'
      className='author'
      style={{ color }}
      onClick={() => onContactClick(contact)}
      tabIndex={tabIndex}
    >
      {getAuthorName(displayName, overrideSenderName)}
    </button>
  )
}

const ForwardedTitle = ({
  contact,
  onContactClick,
  direction,
  conversationType,
  overrideSenderName,
  tabIndex,
}: {
  contact: T.Contact
  onContactClick: (contact: T.Contact) => void
  direction: 'incoming' | 'outgoing'
  conversationType: ConversationType
  overrideSenderName: string | null
  tabIndex: -1 | 0
}) => {
  const tx = useTranslationFunction()

  const { displayName, color } = contact

  return (
    <div className='forwarded-indicator'>
      {conversationType.hasMultipleParticipants && direction !== 'outgoing' ? (
        reactStringReplace(
          tx('forwarded_by', '$$forwarder$$'),
          '$$forwarder$$',
          () => (
            <button
              className='forwarded-indicator-button'
              onClick={() => onContactClick(contact)}
              tabIndex={tabIndex}
              key='displayname'
              style={{ color: color }}
            >
              {overrideSenderName ? `~${overrideSenderName}` : displayName}
            </button>
          )
        )
      ) : (
        <button
          onClick={() => onContactClick(contact)}
          className='forwarded-indicator-button'
          tabIndex={tabIndex}
        >
          {tx('forwarded_message')}
        </button>
      )}
    </div>
  )
}

function buildContextMenu(
  {
    accountId,
    message,
    text,
    conversationType,
    openDialog,
    privateReply,
    handleReactClick,
    chat,
    jumpToMessage,
  }: {
    accountId: number
    message: T.Message | null
    text?: string
    conversationType: ConversationType
    openDialog: OpenDialog
    privateReply: PrivateReply
    handleReactClick: (event: React.MouseEvent<Element, MouseEvent>) => void
    chat: T.FullChat
    jumpToMessage: JumpToMessage
  },
  clickTarget: HTMLAnchorElement | null
): (false | ContextMenuItem)[] {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  if (!message) {
    throw new Error('cannot show context menu for undefined message')
  }

  const isWebxdcInfo = message.systemMessageType === 'WebxdcInfoMessage'
  const isLink = Boolean(
    clickTarget && !clickTarget.getAttribute('x-not-a-link')
  )
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
  const showResend = message.sender.id === C.DC_CONTACT_ID_SELF

  // Do not show "reply" in read-only chats
  const showReply = chat.canSend

  // Do not show "react" for system messages
  const showSendReaction = showReactionsUi(message, chat)

  // Only show in groups, don't show on info messages or outgoing messages
  const showReplyPrivately =
    (conversationType.chatType === C.DC_CHAT_TYPE_GROUP ||
      conversationType.chatType === C.DC_CHAT_TYPE_MAILINGLIST) &&
    message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL

  return [
    // Reply
    showReply && {
      label: tx('reply_noun'),
      action: setQuoteInDraft.bind(null, message.id),
    },
    // Reply privately
    showReplyPrivately && {
      label: tx('reply_privately'),
      action: () => {
        privateReply(accountId, message)
      },
    },
    // Forward message
    {
      label: tx('forward'),
      action: openForwardDialog.bind(null, openDialog, message),
    },
    // Send emoji reaction
    showSendReaction && {
      label: tx('react'),
      action: handleReactClick,
    },
    // copy link
    link !== '' &&
      isLink && {
        label: tx('menu_copy_link_to_clipboard'),
        action: () => runtime.writeClipboardText(link),
      },
    // copy item (selection or all text)
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
      label: tx('add_to_sticker_collection'),
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
    // Resend Message
    showResend && {
      label: tx('resend'),
      action: () => {
        BackendRemote.rpc.resendMessages(selectedAccountId(), [message.id])
      },
    },
    // Webxdc Info message: jump to app message
    Boolean(isWebxdcInfo && message.parentId) && {
      label: tx('show_app_in_chat'),
      action: () => {
        if (message.parentId) {
          jumpToMessage({
            accountId,
            msgId: message.parentId,
            // Currently the info message is always in the same chat
            // as the message with `message.parentId`,
            // but let's not pass `chatId` here, for future-proofing.
            msgChatId: undefined,
            highlight: true,
            focus: true,
            msgParentId: message.id,
            scrollIntoViewArg: { block: 'center' },
          })
        }
      },
    },
    // Message Info
    {
      label: tx('info'),
      action: openMessageInfo.bind(null, openDialog, message),
    },
    // Delete message
    {
      label: tx('delete_message_desktop'),
      action: confirmDeleteMessage.bind(null, openDialog, accountId, message),
    },
  ]
}

export default function Message(props: {
  chat: T.FullChat
  message: T.Message
  conversationType: ConversationType
}) {
  const { message, conversationType } = props
  const { id, viewType, text, hasLocation, isSetupmessage, hasHtml } = message
  const direction = getDirection(message)
  const status = mapCoreMsgStatus2String(message.state)

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const { showReactionsBar } = useReactionsBar()
  const { openDialog } = useDialog()
  const privateReply = usePrivateReply()
  const { openContextMenu } = useContext(ContextMenuContext)
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { joinVideoChat } = useVideoChat()
  const { jumpToMessage } = useMessage()

  const showContextMenu = useCallback(
    async (
      event: React.MouseEvent<
        HTMLButtonElement | HTMLAnchorElement | HTMLDivElement,
        MouseEvent
      >
    ) => {
      event.preventDefault() // prevent default runtime context menu from opening

      const chat = await BackendRemote.rpc.getFullChatById(
        accountId,
        message.chatId
      )

      const showContextMenuEventPos = mouseEventToPosition(event)

      const handleReactClick = (
        reactClickEvent: React.MouseEvent<Element, MouseEvent>
      ) => {
        // We don't want `OutsideClickHelper` to catch this event, causing
        // the reaction bar to directly hide again when switching to other
        // messages by clicking the "react" button
        reactClickEvent.stopPropagation()

        const reactClickEventPos = mouseEventToPosition(reactClickEvent)
        // `reactClickEventPos` might have a wrong ((0, 0)) position
        // if the "react" button was activated with keyboard,
        // because the element on which it was activated
        // (the menu item) gets removed from DOM immediately.
        // Let's fall back to `showContextMenuEventPos` in such a case.
        const position =
          reactClickEventPos.x > 0 && reactClickEventPos.y > 0
            ? reactClickEventPos
            : showContextMenuEventPos

        showReactionsBar({
          messageId: message.id,
          reactions: message.reactions,
          ...position,
        })
      }

      // the event.t is a workaround for labled links, as they will be able to contain markdown formatting in the label in the future.
      const target = ((event as any).t || event.target) as HTMLAnchorElement
      const items = buildContextMenu(
        {
          accountId,
          message,
          text: text || undefined,
          conversationType,
          openDialog,
          privateReply,
          handleReactClick,
          chat,
          jumpToMessage,
        },
        target
      )

      openContextMenu({
        ...showContextMenuEventPos,
        items,
      })
    },
    [
      accountId,
      conversationType,
      message,
      openContextMenu,
      openDialog,
      privateReply,
      showReactionsBar,
      text,
      jumpToMessage,
    ]
  )

  const ref = useRef<any>(null)
  const rovingTabindex = useRovingTabindex(ref)
  const rovingTabindexAttrs = {
    ref,
    tabIndex: rovingTabindex.tabIndex,
    onKeyDown: (e: React.KeyboardEvent) => {
      // Audio / video elements have controls that utilize
      // arrows. That is seeking, changing volume.
      // So we don't want to switch focus if all user wanted to do
      // is to seek the element.
      //
      // However, FYI, onKeyDown event doesn't appear to get triggered
      // when a sub-element of the <audio> element
      // (seek bar, volume slider), and not the <audio> element itself,
      // is focused. At least on Chromium.
      //
      // But, when the root (`<audio>`) element (and not on of its
      // sub-elements) is focused, it still listens for arrows
      // and performs seeking and volume changes,
      // so, still, we need to ignore such events.
      //
      // The same goes for the `useRovingTabindex` code in Gallery.
      if (
        e.target instanceof HTMLMediaElement &&
        // This is purely for future-proofing, in case
        // the media element is a direct item of the roving tabindex widget,
        // and not merely a child of such an item.
        // In such cases we muts not ignore the event, because otherwise
        // there would be no way to switch focus to another item
        // using just the keyboard.
        // Again, at the time of writing we do not have such elements.
        !e.target.classList.contains(rovingTabindex.className)
      ) {
        return
      }

      rovingTabindex.onKeydown(e)
    },
    onFocus: rovingTabindex.setAsActiveElement,
  }
  // When the message is not the active one
  // `rovingTabindex.tabIndex === -1`, we need to set `tabindex="-1"`
  // to all its interactive (otherwise "Tabbable to") elements,
  // such as links, attachments, "view reactions" button, etc.
  // Only the contents of the "active" (selected) message
  // should have tab stops.
  // See https://github.com/deltachat/deltachat-desktop/issues/2141
  // WhatsApp appears to behave similarly.
  // The implementation is similar to the "Grid" pattern:
  // https://www.w3.org/WAI/ARIA/apg/patterns/grid/#gridNav_inside
  const tabindexForInteractiveContents = rovingTabindex.tabIndex

  // Info Message
  if (message.isInfo) {
    const isWebxdcInfo = message.systemMessageType === 'WebxdcInfoMessage'
    const isProtectionBrokenMsg =
      message.systemMessageType === 'ChatProtectionDisabled'
    const isProtectionEnabledMsg =
      message.systemMessageType === 'ChatProtectionEnabled'

    // Message can't be sent because of `Invalid unencrypted mail to <>`
    // which is sent by chatmail servers.
    const isInvalidUnencryptedMail =
      message.systemMessageType === 'InvalidUnencryptedMail'

    // Some info messages can be clicked by the user to receive further information
    const isInteractive =
      (isWebxdcInfo && message.parentId) ||
      isProtectionBrokenMsg ||
      isProtectionEnabledMsg ||
      isInvalidUnencryptedMail

    let onClick
    if (isInteractive) {
      onClick = async () => {
        if (isWebxdcInfo) {
          // open or focus the webxdc app
          openWebxdc(message)
        } else if (isProtectionBrokenMsg) {
          const { name } = await BackendRemote.rpc.getBasicChatInfo(
            selectedAccountId(),
            message.chatId
          )
          openDialog(ProtectionBrokenDialog, { name })
        } else if (isProtectionEnabledMsg) {
          openDialog(ProtectionEnabledDialog)
        } else if (isInvalidUnencryptedMail) {
          openDialog(InvalidUnencryptedMailDialog)
        }
      }
    }

    const TagName = onClick ? 'button' : 'div'
    return (
      <div
        className={classNames(
          'info-message',
          isWebxdcInfo && 'webxdc-info',
          isInteractive && 'interactive'
        )}
        id={String(message.id)}
        onContextMenu={showContextMenu}
      >
        {(isProtectionBrokenMsg || isProtectionEnabledMsg) && (
          <img
            className='verified-icon-info-msg'
            src={
              isProtectionBrokenMsg
                ? './images/verified_broken.svg'
                : './images/verified.svg'
            }
          />
        )}
        <TagName
          className={'bubble ' + rovingTabindex.className}
          onClick={onClick}
          {...rovingTabindexAttrs}
        >
          {isWebxdcInfo && message.parentId && (
            <img
              src={runtime.getWebxdcIconURL(
                selectedAccountId(),
                message.parentId
              )}
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
        </TagName>
      </div>
    )
  }
  // Normal Message
  const onContactClick = async (contact: T.Contact) => {
    openViewProfileDialog(accountId, contact.id)
  }

  let onClickMessageBody
  let MessageTagName: 'div' | 'button' = 'div'
  if (isSetupmessage) {
    onClickMessageBody = () =>
      openDialog(EnterAutocryptSetupMessage, { message })
    MessageTagName = 'button'
  }

  let content
  if (message.viewType === 'VideochatInvitation') {
    return (
      <div
        className={`videochat-invitation ${rovingTabindex.className}`}
        id={message.id.toString()}
        onContextMenu={showContextMenu}
        {...rovingTabindexAttrs}
      >
        <div className='videochat-icon'>
          <span className='icon videocamera' />
        </div>
        {/* FYI the clickable element is not a semantic button.
        Here it's probably fine. So there is also no need
        to specify tabindex.*/}
        <AvatarFromContact
          contact={message.sender}
          onClick={onContactClick}
          // tabindexForInteractiveContents={tabindexForInteractiveContents}
        />
        <div className='break' />
        <div
          className='info-button'
          onClick={() => joinVideoChat(accountId, id)}
        >
          {direction === 'incoming'
            ? tx('videochat_contact_invited_hint', message.sender.displayName)
            : tx('videochat_you_invited_hint')}
          <button
            className='join-button'
            tabIndex={tabindexForInteractiveContents}
          >
            {direction === 'incoming'
              ? tx('videochat_tap_to_join')
              : tx('rejoin')}
          </button>
        </div>
        <div className='break' />
        <div className='meta-data-container'>
          <MessageMetaData
            fileMime={(!isSetupmessage && message.fileMime) || null}
            direction={direction}
            status={status}
            hasText={text !== null && text !== ''}
            hasLocation={hasLocation}
            timestamp={message.timestamp * 1000}
            padlock={message.showPadlock}
            onClickError={openMessageInfo.bind(null, openDialog, message)}
            viewType={'VideochatInvitation'}
            tabindexForInteractiveContents={tabindexForInteractiveContents}
          />
        </div>
      </div>
    )
  } else {
    content = (
      <div dir='auto' className='text'>
        {message.isSetupmessage ? (
          tx('autocrypt_asm_click_body')
        ) : text !== null ? (
          <MessageBody
            text={text}
            tabindexForInteractiveContents={tabindexForInteractiveContents}
          />
        ) : null}
      </div>
    )
  }

  const { downloadState } = message

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
          <button
            onClick={downloadFullMessage.bind(null, message.id)}
            tabIndex={tabindexForInteractiveContents}
          >
            {tx('download')}
          </button>
        )}
      </div>
    )
  }

  /** Whether to show author name and avatar */
  const showAuthor =
    conversationType.hasMultipleParticipants || message?.overrideSenderName

  const hasText = text !== null && text !== ''
  const fileMime = (!isSetupmessage && message.fileMime) || null
  const isWithoutText = isMediaWithoutText(fileMime, hasText, message.viewType)
  const showAttachment = (message: T.Message) =>
    message.file &&
    !message.isSetupmessage &&
    message.viewType !== 'Webxdc' &&
    message.viewType !== 'Vcard'

  return (
    <div
      onContextMenu={showContextMenu}
      className={classNames(
        'message',
        direction,
        styles.message,
        rovingTabindex.className,
        {
          [styles.withReactions]: message.reactions && !isSetupmessage,
          'type-sticker': viewType === 'Sticker',
          error: status === 'error',
          [`status_${status}`]: true,
          forwarded: message.isForwarded,
          'has-html': hasHtml,
        }
      )}
      id={message.id.toString()}
      {...rovingTabindexAttrs}
    >
      {showAuthor && direction === 'incoming' && (
        <Avatar
          contact={message.sender}
          onContactClick={onContactClick}
          // The avatar doesn't need to be a tab stop, because
          // the author name is a tab stop and clicking on it does the same.
          tabIndex={-1}
        />
      )}
      <div
        onContextMenu={showContextMenu}
        className='msg-container'
        style={{ borderColor: message.sender.color }}
      >
        {message.isForwarded && (
          <ForwardedTitle
            contact={message.sender}
            onContactClick={onContactClick}
            direction={direction}
            conversationType={conversationType}
            overrideSenderName={message.overrideSenderName}
            tabIndex={tabindexForInteractiveContents}
          />
        )}
        {!message.isForwarded && (
          <div
            className={classNames('author-wrapper', {
              'can-hide':
                (!message.overrideSenderName && direction === 'outgoing') ||
                !showAuthor,
            })}
          >
            <AuthorName
              contact={message.sender}
              onContactClick={onContactClick}
              overrideSenderName={message.overrideSenderName}
              tabIndex={tabindexForInteractiveContents}
            />
          </div>
        )}
        <MessageTagName
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
          })}
          onClick={onClickMessageBody}
          tabIndex={onClickMessageBody ? tabindexForInteractiveContents : -1}
        >
          {message.quote !== null && (
            <Quote
              quote={message.quote}
              msgParentId={message.id}
              // FYI the quote is not always interactive,
              // e.g. when `quote.kind === 'JustText'`.
              tabIndex={tabindexForInteractiveContents}
            />
          )}
          {showAttachment(message) && (
            <Attachment
              text={text || undefined}
              conversationType={conversationType}
              message={message}
              hasQuote={message.quote !== null}
              tabindexForInteractiveContents={tabindexForInteractiveContents}
            />
          )}
          {message.viewType === 'Webxdc' && (
            <WebxdcMessageContent
              tabindexForInteractiveContents={tabindexForInteractiveContents}
              message={message}
            ></WebxdcMessageContent>
          )}
          {message.viewType === 'Vcard' && (
            <VCardComponent
              message={message}
              tabindexForInteractiveContents={tabindexForInteractiveContents}
            ></VCardComponent>
          )}
          {content}
          {hasHtml && (
            <button
              onClick={openMessageHTML.bind(null, message.id)}
              className='show-html'
              tabIndex={tabindexForInteractiveContents}
            >
              {tx('show_full_message')}
            </button>
          )}
          <footer
            className={classNames(styles.messageFooter, {
              [styles.onlyMedia]: isWithoutText,
              [styles.withReactionsNoText]: isWithoutText && message.reactions,
            })}
          >
            <MessageMetaData
              fileMime={fileMime}
              direction={direction}
              status={status}
              hasText={hasText}
              hasLocation={hasLocation}
              timestamp={message.timestamp * 1000}
              padlock={message.showPadlock}
              onClickError={openMessageInfo.bind(null, openDialog, message)}
              viewType={message.viewType}
              tabindexForInteractiveContents={tabindexForInteractiveContents}
            />
            {message.reactions && !isSetupmessage && (
              <Reactions
                reactions={message.reactions}
                tabindexForInteractiveContents={tabindexForInteractiveContents}
              />
            )}
          </footer>
        </MessageTagName>
      </div>
      <ShortcutMenu
        chat={props.chat}
        direction={direction}
        message={message}
        showContextMenu={showContextMenu}
        tabindexForInteractiveContents={tabindexForInteractiveContents}
      />
    </div>
  )
}

export const Quote = ({
  quote,
  msgParentId,
  tabIndex,
}: {
  quote: T.MessageQuote
  msgParentId?: number
  tabIndex: -1 | 0
}) => {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { jumpToMessage } = useMessage()

  const hasMessage = quote.kind === 'WithMessage'

  const authorStyle = hasMessage ? { color: quote.authorDisplayColor } : {}
  const borderStyle =
    !hasMessage || quote.isForwarded
      ? {}
      : { borderLeftColor: quote.authorDisplayColor }

  let onClick = undefined
  if (quote.kind === 'WithMessage') {
    onClick = () => {
      jumpToMessage({
        accountId,
        msgId: quote.messageId,
        msgChatId: undefined,
        highlight: true,
        focus: true,
        msgParentId,
        // Often times the quoted message is already in view,
        // so let's not scroll at all if so.
        scrollIntoViewArg: { block: 'nearest' },
      })
    }
  }
  // TODO a11y: we probably want a separate button
  // with `aria-label="Jump to message"`.
  // Having a button with so much content is probably not good.
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag className='quote-background' onClick={onClick} tabIndex={tabIndex}>
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
          {quote.text && (
            <div className='quoted-text'>
              <MessageBody
                text={
                  quote.text.slice(0, 3000 /* limit quoted message size */) ||
                  ''
                }
                disableJumbomoji
                nonInteractiveContent
                tabindexForInteractiveContents={-1}
              />
            </div>
          )}
        </div>
        {hasMessage && quote.image && (
          <img
            className='quoted-image'
            src={runtime.transformBlobURL(quote.image)}
          />
        )}
        {hasMessage && quote.viewType == 'Webxdc' && (
          <img
            className='quoted-webxdc-icon'
            src={runtime.getWebxdcIconURL(selectedAccountId(), quote.messageId)}
          />
        )}
      </div>
    </Tag>
  )
}

export function getAuthorName(
  displayName: string,
  overrideSenderName?: string | null
) {
  return overrideSenderName ? `~${overrideSenderName}` : displayName
}

function WebxdcMessageContent({
  message,
  tabindexForInteractiveContents,
}: {
  message: T.Message
  tabindexForInteractiveContents: -1 | 0
}) {
  const tx = useTranslationFunction()
  if (message.viewType !== 'Webxdc') {
    return null
  }
  const info = message.webxdcInfo || {
    name: 'INFO MISSING!',
    document: undefined,
    summary: 'INFO MISSING!',
  }

  return (
    <div className='webxdc'>
      <img
        src={runtime.getWebxdcIconURL(selectedAccountId(), message.id)}
        alt={`icon of ${info.name}`}
        // No need to turn this element into a `<button>` for a11y,
        // because there is a button below that does the same.
        onClick={() => openWebxdc(message)}
        // Not setting `tabIndex={tabindexForInteractiveContents}` here
        // because there is a button below that does the same
      />
      <div
        className='name'
        title={`${info.document ? info.document + ' \n' : ''}${info.name}`}
      >
        {info.document && truncateText(info.document, 24) + ' - '}
        {truncateText(info.name, 42)}
      </div>
      <div>{info.summary}</div>
      <Button
        className={styles.startWebxdcButton}
        styling='primary'
        onClick={() => openWebxdc(message)}
        tabIndex={tabindexForInteractiveContents}
      >
        {tx('start_app')}
      </Button>
    </div>
  )
}
