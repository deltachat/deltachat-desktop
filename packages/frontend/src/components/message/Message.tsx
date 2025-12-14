import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import reactStringReplace from 'react-string-replace'
import classNames from 'classnames'
import { C, T } from '@deltachat/jsonrpc-client'
import { debounce } from 'debounce'

import MessageBody from './MessageBody'
import MessageMetaData, { isMediaWithoutText } from './MessageMetaData'
import {
  onDownload,
  openAttachmentInShell,
  openForwardDialog,
  openMessageInfo,
  isMessageEditable,
  setQuoteInDraft,
  openMessageHTML,
  confirmDeleteMessage,
  downloadFullMessage,
  openWebxdc,
  enterEditMessageMode,
} from './messageFunctions'
import Attachment from '../attachment/messageAttachment'
import { isGenericAttachment, isImage } from '../attachment/Attachment'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { ConversationType } from './MessageList'
import { getDirection } from '../../utils/getDirection'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { ContextMenuItem } from '../ContextMenu'
import { onDCEvent, BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { ProtectionEnabledDialog } from '../dialogs/ProtectionStatusDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'
import useOpenViewProfileDialog from '../../hooks/dialog/useOpenViewProfileDialog'
import usePrivateReply from '../../hooks/chat/usePrivateReply'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useReactionsBar, showReactionsUi } from '../ReactionsBar'
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
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('Message')

interface CssWithAvatarColor extends CSSProperties {
  '--local-avatar-color': string
}

const Avatar = ({
  contact,
  onContactClick,
  tabIndex,
}: {
  contact: T.Contact
  onContactClick: (contact: T.Contact) => void
  tabIndex: -1 | 0
}) => {
  const { profileImage, color, displayName, address } = contact

  const onClick = () => onContactClick(contact)

  if (profileImage) {
    return (
      <button
        type='button'
        className='author-avatar'
        onClick={onClick}
        tabIndex={tabIndex}
      >
        <img alt={displayName} src={runtime.transformBlobURL(profileImage)} />
      </button>
    )
  } else {
    const initial = avatarInitial(displayName, address)
    return (
      <button
        type='button'
        className='author-avatar default'
        aria-label={displayName}
        onClick={onClick}
        tabIndex={tabIndex}
      >
        <div
          style={{ '--local-avatar-color': color } as CssWithAvatarColor}
          className='label'
        >
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
      type='button'
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
              type='button'
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
          type='button'
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

  const isSavedMessage = message.savedMessageId !== null

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

  const showAttachmentOptions = !!message.file
  const showCopyImage = !!message.file && message.viewType === 'Image'
  const showResend =
    message.sender.id === C.DC_CONTACT_ID_SELF && message.viewType !== 'Call'

  // Do not show "reply" in read-only chats, and for info messages.
  // See
  // - https://github.com/deltachat/deltachat-desktop/issues/5337
  // - https://github.com/deltachat/deltachat-android/blob/52c01976821803fa2d8a177f93576fa4082ef5bd/src/main/java/org/thoughtcrime/securesms/ConversationFragment.java#L332-L332
  const showReply = chat.canSend && !message.isInfo

  // See
  // - https://github.com/deltachat/deltachat-desktop/issues/4695.
  // - https://github.com/deltachat/deltachat-desktop/issues/5365.
  // - https://github.com/deltachat/deltachat-android/blob/fd4a377752cc6778f161590fde2f9ab29c5d3011/src/main/java/org/thoughtcrime/securesms/ConversationFragment.java#L334
  const showEdit = isMessageEditable(message, chat)

  // Do not show "react" for system messages
  const showSendReaction = showReactionsUi(message, chat)

  // Only show in groups, don't show on info messages or outgoing messages
  const showReplyPrivately =
    (conversationType.chatType === 'Group' ||
      conversationType.chatType === 'InBroadcast') &&
    !message.isInfo &&
    message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL

  return [
    // Reply
    showReply && {
      label: tx('notify_reply_button'),
      action: setQuoteInDraft.bind(null, message),
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
    // Save Message
    // For reference, the conditions when it's shown:
    // https://github.com/deltachat/deltachat-android/blob/52c01976821803fa2d8a177f93576fa4082ef5bd/src/main/java/org/thoughtcrime/securesms/ConversationFragment.java#L342
    !chat.isSelfTalk &&
      !isSavedMessage &&
      !message.isInfo && {
        label: tx('save_message'),
        action: () =>
          BackendRemote.rpc.saveMsgs(selectedAccountId(), [message.id]),
      },
    // Unsave
    isSavedMessage && {
      label: tx('unsave'),
      action: () => {
        if (message.savedMessageId !== null) {
          BackendRemote.rpc.deleteMessages(selectedAccountId(), [
            message.savedMessageId,
          ])
        }
      },
    },
    // Send emoji reaction
    showSendReaction && {
      label: tx('react'),
      action: handleReactClick,
    },
    showEdit && {
      // Not `tx('edit_message')`.
      // See https://github.com/deltachat/deltachat-desktop/issues/4695#issuecomment-2688716592
      label: tx('global_menu_edit_desktop'),
      action: enterEditMessageMode.bind(null, message),
    },
    { type: 'separator' },
    // Save attachment as
    showAttachmentOptions && {
      label: tx('menu_export_attachment'),
      action: onDownload.bind(null, message),
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
    { type: 'separator' },
    // Delete message
    {
      label: tx('delete_message_desktop'),
      action: confirmDeleteMessage.bind(
        null,
        openDialog,
        accountId,
        message,
        chat
      ),
    },
  ]
}

export default function Message(props: {
  chat: T.FullChat
  message: T.Message
  conversationType: ConversationType
}) {
  const { message, conversationType, chat } = props
  const { viewType, text, hasLocation, hasHtml } = message
  const direction = getDirection(message)
  const status = mapCoreMsgStatus2String(message.state)

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const { showReactionsBar } = useReactionsBar()
  const { openDialog } = useDialog()
  const privateReply = usePrivateReply()
  const { openContextMenu } = useContext(ContextMenuContext)
  const openViewProfileDialog = useOpenViewProfileDialog()
  const { jumpToMessage } = useMessage()
  const [messageWidth, setMessageWidth] = useState(0)

  const showContextMenu = useCallback(
    (
      event: React.MouseEvent<
        HTMLButtonElement | HTMLAnchorElement | HTMLDivElement,
        MouseEvent
      >
    ) => {
      event.preventDefault() // prevent default runtime context menu from opening

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
          chat: props.chat,
          jumpToMessage,
        },
        target
      )

      openContextMenu({
        ...showContextMenuEventPos,
        items,
        ariaAttrs: {
          'aria-label': tx('a11y_message_context_menu_btn_label'),
        },
      })
    },
    [
      accountId,
      props.chat,
      conversationType,
      message,
      openContextMenu,
      openDialog,
      privateReply,
      showReactionsBar,
      text,
      jumpToMessage,
      tx,
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

  const messageContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const resizeHandler = () => {
      if (messageContainerRef.current) {
        let messageWidth = 0
        // set message width which is used by reaction component
        // to adapt the number of visible reactions
        if (
          (message.fileMime && isImage(message.fileMime)) ||
          window.innerWidth < 900
        ) {
          // image messages have a defined width
          messageWidth = messageContainerRef.current.clientWidth
        } else {
          // text messages might be smaller than min width but
          // they can be extended to at least max image width
          // so we pass that value to the reaction calculation
          messageWidth = 450
        }
        setMessageWidth(messageWidth)
      }
    }
    window.addEventListener('resize', resizeHandler)
    // call once on first render
    resizeHandler()
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [message.fileMime])

  // Info Message
  if (message.isInfo) {
    const isWebxdcInfo = message.systemMessageType === 'WebxdcInfoMessage'
    const isProtectionEnabledMsg =
      message.systemMessageType === 'ChatProtectionEnabled' ||
      message.systemMessageType === 'ChatE2ee'

    // Message can't be sent because of `Invalid unencrypted mail to <>`
    // which is sent by chatmail servers.
    const isInvalidUnencryptedMail =
      message.systemMessageType === 'InvalidUnencryptedMail'

    // Some info messages can be clicked by the user to receive further information
    const isInteractive =
      (isWebxdcInfo && message.parentId) ||
      message.infoContactId != null ||
      isProtectionEnabledMsg ||
      isInvalidUnencryptedMail

    let onClick
    if (isInteractive) {
      onClick = async () => {
        if (isWebxdcInfo) {
          // open or focus the webxdc app
          openWebxdc(message)
        } else if (
          message.infoContactId != null &&
          message.infoContactId !== C.DC_CONTACT_ID_SELF
        ) {
          openViewProfileDialog(accountId, message.infoContactId)
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
          isInteractive && 'interactive',
          isProtectionEnabledMsg && 'e2ee-info' // used in e2e-tests
        )}
        id={String(message.id)}
        onContextMenu={showContextMenu}
      >
        <TagName
          className={'bubble ' + rovingTabindex.className}
          onClick={onClick}
          {...rovingTabindexAttrs}
          // Note that the actual `onContextMenu` listener
          // is on the wrapper component.
          aria-haspopup='menu'
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

  // Check if the message is saved or has a saved message
  // in both cases we display the bookmark icon
  const isOrHasSavedMessage = message.originalMsgId
    ? true
    : !!message.savedMessageId

  let content = (
    <div dir='auto' className='text'>
      {text !== null ? (
        <MessageBody
          text={text}
          tabindexForInteractiveContents={tabindexForInteractiveContents}
        />
      ) : null}
    </div>
  )

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
            type='button'
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
    conversationType.hasMultipleParticipants ||
    message?.overrideSenderName ||
    message?.originalMsgId ||
    chat.isSelfTalk

  const hasText = text !== null && text !== ''
  const fileMime = message.fileMime || null
  const isWithoutText = isMediaWithoutText(fileMime, hasText, message.viewType)
  const showAttachment = (message: T.Message) =>
    message.file &&
    message.viewType !== 'Webxdc' &&
    message.viewType !== 'Vcard'

  return (
    <div
      onContextMenu={showContextMenu}
      aria-haspopup='menu'
      className={classNames(
        'message',
        direction,
        styles.message,
        rovingTabindex.className,
        {
          [styles.withReactions]: message.reactions,
          'type-sticker': viewType === 'Sticker',
          error: status === 'error',
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
        className='msg-container'
        style={{ borderColor: message.sender.color }}
        ref={messageContainerRef}
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
        <div
          className={classNames('msg-body', {
            'msg-body--clickable': onClickMessageBody,
            call: message.viewType === 'Call',
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
              message={message}
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
              type='button'
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
              error={message.error || null}
              downloadState={downloadState}
              isEdited={message.isEdited}
              hasText={hasText}
              hasLocation={hasLocation}
              timestamp={message.timestamp * 1000}
              encrypted={message.showPadlock}
              isSavedMessage={isOrHasSavedMessage}
              onClickError={openMessageInfo.bind(null, openDialog, message)}
              viewType={message.viewType}
              tabindexForInteractiveContents={tabindexForInteractiveContents}
            />
            <div
              // TODO the "+1" count aria-live announcment is perhaps not great
              // out of context.
              // Also the "show ReactionsDialog" button gets announced.
              aria-live='polite'
              aria-relevant='all'
            >
              {message.reactions && (
                <Reactions
                  reactions={message.reactions}
                  tabindexForInteractiveContents={
                    tabindexForInteractiveContents
                  }
                  messageWidth={messageWidth}
                />
              )}
            </div>
          </footer>
        </div>
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
  isEditMessage,
  tabIndex,
}: {
  quote: T.MessageQuote
  msgParentId?: number
  /**
   * Whether this component is passed the message that the user is editing.
   */
  isEditMessage?: boolean
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
        msgChatId: quote.chatId,
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
          {isEditMessage ? (
            <div className='quote-author' style={authorStyle}>
              {tx('edit_message')}
            </div>
          ) : (
            hasMessage && (
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
            )
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
  const [webxdcInfo, setWebxdcInfo] = useState<T.WebxdcMessageInfo | null>(null)
  const [isLoadingWebxdcInfo, setIsLoadingWebxdcInfo] = useState(true)
  const accountId = selectedAccountId()

  const fetchWebxdcInfo = useCallback(async () => {
    setIsLoadingWebxdcInfo(true)
    try {
      const info = await BackendRemote.rpc.getWebxdcInfo(accountId, message.id)
      setWebxdcInfo(info)
    } catch (error) {
      log.error('Failed to refresh webxdc info for message:', message.id, error)
    } finally {
      setIsLoadingWebxdcInfo(false)
    }
  }, [accountId, message.id])

  const debouncedFetchWebxdcInfo = useMemo(
    () => debounce(fetchWebxdcInfo, 500),
    [fetchWebxdcInfo]
  )

  useEffect(() => {
    if (message.viewType !== 'Webxdc') return

    // Initial fetch
    fetchWebxdcInfo()

    // Listen for updates
    const cleanup = onDCEvent(
      accountId,
      'WebxdcStatusUpdate',
      async ({ msgId }) => {
        if (msgId === message.id) {
          // Debounce the refresh since event might be triggered on every key stroke
          debouncedFetchWebxdcInfo()
        }
      }
    )

    return cleanup
  }, [
    accountId,
    message.id,
    message.viewType,
    fetchWebxdcInfo,
    debouncedFetchWebxdcInfo,
  ])

  if (message.viewType !== 'Webxdc') {
    return null
  }

  const info = webxdcInfo || {
    name: isLoadingWebxdcInfo ? 'Loading...' : 'INFO MISSING!',
    document: undefined,
    summary: isLoadingWebxdcInfo ? '' : 'INFO MISSING!',
  }

  return (
    <div className='webxdc'>
      <img
        src={runtime.getWebxdcIconURL(selectedAccountId(), message.id)}
        alt={`icon of ${info.name}`}
        // No need to turn this element into a `<button>` for a11y,
        // because there is a button below that does the same.
        onClick={() => openWebxdc(message, webxdcInfo ?? undefined)}
        // Not setting `tabIndex={tabindexForInteractiveContents}` here
        // because there is a button below that does the same
      />
      <div
        className='info-text'
        title={`${info.document ? info.document + ' \n' : ''}${info.name}`}
      >
        <div className='document'>{info.document}</div>
        <div className='name'>{info.name}</div>
      </div>
      <div className='summary'>{info.summary}</div>
      <Button
        className={styles.startWebxdcButton}
        styling='primary'
        onClick={() => openWebxdc(message, webxdcInfo ?? undefined)}
        tabIndex={tabindexForInteractiveContents}
      >
        {tx('start_app')}
      </Button>
    </div>
  )
}
