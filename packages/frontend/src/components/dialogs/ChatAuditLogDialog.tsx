import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'
import moment from 'moment'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useDialog from '../../hooks/dialog/useDialog'
import useMessage from '../../hooks/chat/useMessage'
import usePrivateReply from '../../hooks/chat/usePrivateReply'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { BackendRemote, Type } from '../../backend-com'
import { ContextMenuContext } from '../../contexts/ContextMenuContext'
import { getDirection } from '../../utils/getDirection'
import { getLogger } from '../../../../shared/logger'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { openMessageInfo, setQuoteInDraft } from '../message/messageFunctions'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from '../../ScreenController'

import type { DialogProps, OpenDialog } from '../../contexts/DialogContext'
import type { JumpToMessage } from '../../hooks/chat/useMessage'
import type { PrivateReply } from '../../hooks/chat/usePrivateReply'
import { mouseEventToPosition } from '../../utils/mouseEventToPosition'

const log = getLogger('render/ChatAuditLog')

function buildContextMenu(
  jumpToMessage: JumpToMessage,
  openDialog: OpenDialog,
  privateReply: PrivateReply,
  accountId: number,
  message: Type.Message,
  isGroup: boolean,
  closeDialogCallback: DialogProps['onClose']
) {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  return [
    // Show in Chat
    {
      label: tx('show_in_chat'),
      action: () => {
        closeDialogCallback()
        setTimeout(() =>
          jumpToMessage({
            accountId,
            msgId: message.id,
            msgChatId: message.chatId,
            highlight: true,
            focus: true,
            scrollIntoViewArg: { block: 'center' },
          })
        )
      },
    },
    // Show Webxdc in Chat
    message.systemMessageType == 'WebxdcInfoMessage' && {
      label: tx('show_app_in_chat'),
      action: () => {
        if (message.parentId) {
          closeDialogCallback()
          jumpToMessage({
            accountId,
            msgId: message.parentId,
            // Currently the info message is always in the same chat
            // as the message with `message.parentId`,
            // but let's not pass `chatId` here, for future-proofing.
            msgChatId: undefined,
            highlight: true,
            focus: true,
            scrollIntoViewArg: { block: 'center' },
          })
        }
      },
    },
    // Reply
    {
      label: tx('reply_noun'),
      action: () => {
        setQuoteInDraft(message.id)
        closeDialogCallback()
      },
    },
    // Reply privately -> only show in groups, don't show on info messages or outgoing messages
    isGroup &&
      message.fromId > C.DC_CONTACT_ID_LAST_SPECIAL && {
        label: tx('reply_privately'),
        action: () => {
          privateReply(accountId, message)
          closeDialogCallback()
        },
      },
    // Copy to clipboard
    {
      label: tx('global_menu_edit_copy_desktop'),
      action: () => {
        navigator.clipboard.writeText(message.text || '')
      },
    },
    // Message Info
    {
      label: tx('info'),
      action: openMessageInfo.bind(null, openDialog, message),
    },
  ]
}

export default function ChatAuditLogDialog(
  props: {
    selectedChat: Pick<Type.BasicChat, 'id' | 'name' | 'chatType'>
  } & DialogProps
) {
  const { selectedChat, onClose } = props
  const { openDialog } = useDialog()
  const { jumpToMessage } = useMessage()
  const accountId = selectedAccountId()
  const privateReply = usePrivateReply()

  const [loading, setLoading] = useState(true)
  const [msgEntries, setMsgEntries] = useState<Type.MessageListItem[]>([])
  const [messages, setMessages] = useState<
    Record<number, Type.MessageLoadResult>
  >([])

  const listView = useRef<HTMLDivElement>(null)

  const { openContextMenu } = useContext(ContextMenuContext)
  const showMenu = (
    message: Type.Message,
    event: React.MouseEvent<
      HTMLDivElement | HTMLAnchorElement | HTMLLIElement,
      MouseEvent
    >
  ) => {
    const items = buildContextMenu(
      jumpToMessage,
      openDialog,
      privateReply,
      accountId,
      message,
      selectedChat.chatType === C.DC_CHAT_TYPE_GROUP,
      onClose
    )

    openContextMenu({
      ...mouseEventToPosition(event),
      items,
    })
  }

  const refresh = useCallback(
    async function () {
      setLoading(true)
      const account_id = selectedAccountId()

      const msgEntries = await BackendRemote.rpc.getMessageListItems(
        account_id,
        selectedChat.id,
        true,
        true
      )
      /** only ids of real messages, without daymarkers */
      const onlyMsgIds = msgEntries
        .map(entry => (entry.kind === 'message' ? entry.msg_id : undefined))
        .filter(entry => typeof entry !== 'undefined') as number[]
      const messages = await BackendRemote.rpc.getMessages(
        account_id,
        onlyMsgIds
      )

      setMsgEntries(msgEntries)
      setMessages(messages)
      setLoading(false)

      setTimeout(() => {
        if (listView.current)
          listView.current.scrollTop = listView.current.scrollHeight
      }, 0)
    },
    [selectedChat.id]
  )

  useEffect(() => {
    refresh()
  }, [selectedChat.id, refresh])

  const tx = useTranslationFunction()

  return (
    <Dialog className={'audit-log-dialog'} fixed onClose={onClose}>
      <DialogHeader
        onClose={onClose}
        title={tx('chat_audit_log_title', selectedChat.name)}
      />
      <DialogBody>
        <DialogContent>
          <h5>{tx('chat_audit_log_description')}</h5>
          {loading ? (
            <div>{tx('loading')}</div>
          ) : (
            <div style={{ overflowY: 'scroll' }} ref={listView}>
              {msgEntries.length === 0 && (
                <div className='no-content' key='no-content-msg'>
                  <div>{tx('chat_audit_log_empty_message')}</div>
                </div>
              )}
              <ol key='info-message-list'>
                {msgEntries.map(entry => {
                  if (entry.kind === 'dayMarker') {
                    const key = 'magic' + entry.timestamp
                    return (
                      <li key={key} className='time'>
                        <div>
                          {moment.unix(entry.timestamp).calendar(null, {
                            sameDay: `[${tx('today')}]`,
                            lastDay: `[${tx('yesterday')}]`,
                            lastWeek: 'LL',
                            sameElse: 'LL',
                          })}
                        </div>
                      </li>
                    )
                  }
                  const id = entry.msg_id
                  const message = messages[id]
                  if (!message || message == null) {
                    log.debug(`Missing message with id ${id}`)
                    return
                  }
                  if (message.kind !== 'message') {
                    log.debug(`Loading of message with id ${id} failed`)
                    return (
                      <li key={id} className='info'>
                        <p>{`${id}: ${message.error}`}</p>
                      </li>
                    )
                  }

                  const { text, timestamp, systemMessageType, parentId } =
                    message
                  const direction = getDirection(message)
                  const status = mapCoreMsgStatus2String(message.state)
                  const accountId = selectedAccountId()
                  return (
                    <li
                      key={id}
                      className='info'
                      onClick={ev => showMenu(message, ev)}
                      onContextMenu={ev => showMenu(message, ev)}
                    >
                      <p>
                        <div className='timestamp'>
                          {moment.unix(timestamp).format('LT')}
                        </div>
                        {systemMessageType == 'WebxdcInfoMessage' &&
                          parentId && (
                            <img
                              src={runtime.getWebxdcIconURL(
                                accountId,
                                parentId
                              )}
                            />
                          )}
                        {text}
                        {direction === 'outgoing' &&
                          (status === 'sending' || status === 'error') && (
                            <div
                              className={`status-icon ${status}`}
                              aria-label={tx(`a11y_delivery_status_${status}`)}
                            />
                          )}
                      </p>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
