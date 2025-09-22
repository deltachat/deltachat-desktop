import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'
import moment from 'moment'

import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import useDialog from '../../../hooks/dialog/useDialog'
import useMessage from '../../../hooks/chat/useMessage'
import usePrivateReply from '../../../hooks/chat/usePrivateReply'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote, Type } from '../../../backend-com'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import { getDirection } from '../../../utils/getDirection'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { mapCoreMsgStatus2String } from '../../helpers/MapMsgStatus'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from '../../../ScreenController'

import type { DialogProps } from '../../../contexts/DialogContext'
import { mouseEventToPosition } from '../../../utils/mouseEventToPosition'
import { buildContextMenu } from './contextMenu'

const log = getLogger('render/ChatAuditLog')

import styles from './styles.module.scss'
import classNames from 'classnames'

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
      <DialogBody className={classNames(styles.DialogBodyWithoutBottomMargin, styles.DialogBody)}>
        <DialogContent>
          <h5>{tx('chat_audit_log_description')}</h5>
        </DialogContent>
        {loading ? (
          <div>{tx('loading')}</div>
        ) : (
          <div className={styles.List} style={{ overflowY: 'scroll' }} ref={listView}>
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

                const { text, timestamp, systemMessageType, parentId } = message
                const direction = getDirection(message)
                const status = mapCoreMsgStatus2String(message.state)
                const accountId = selectedAccountId()
                return (
                  <li
                    key={id}
                    className='info'
                    // TODO make this element focusable.
                    onClick={ev => showMenu(message, ev)}
                    onContextMenu={ev => showMenu(message, ev)}
                    aria-haspopup='menu'
                  >
                    <div>
                      <div className='timestamp'>
                        {moment.unix(timestamp).format('LT')}
                      </div>
                      {systemMessageType == 'WebxdcInfoMessage' && parentId && (
                        <img
                          src={runtime.getWebxdcIconURL(accountId, parentId)}
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
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </DialogBody>
    </Dialog>
  )
}
