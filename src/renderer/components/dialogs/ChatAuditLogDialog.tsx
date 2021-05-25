import React, { useState, useEffect, useRef, useContext } from 'react'
import { DeltaDialogBase, DeltaDialogCloseButton } from './DeltaDialog'
import { DialogProps } from './DialogController'
import {
  FullChat,
  Message,
  MessageType,
  MessageTypeIs,
} from '../../../shared/shared-types'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { getLogger } from '../../../shared/logger'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import moment from 'moment'
import {
  openMessageInfo,
  setQuoteInDraft,
  privateReply,
} from '../message/messageFunctions'

const log = getLogger('render/ChatAuditLog')

function buildContextMenu(
  message: Message,
  isGroup: boolean,
  closeDialogCallback: DialogProps['onClose']
) {
  const tx = window.static_translate // don't use the i18n context here for now as this component is inefficient (rendered one menu for every message)
  return [
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
          privateReply(message)
          closeDialogCallback()
        },
      },
    // Copy to clipboard
    {
      label: tx('global_menu_edit_copy_desktop'),
      action: () => {
        navigator.clipboard.writeText(message.text)
      },
    },
    // Message details
    {
      label: tx('menu_message_details'),
      action: openMessageInfo.bind(null, message),
    },
  ]
}

export default function ChatAuditLogDialog(props: {
  selectedChat: FullChat
  onClose: DialogProps['onClose']
}) {
  const { selectedChat, onClose } = props
  const isOpen = !!selectedChat

  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<MessageType[]>([])

  const listView = useRef<HTMLDivElement>()

  const { openContextMenu } = useContext(ScreenContext)
  const showMenu = (
    message: Message,
    event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement, MouseEvent>
  ) => {
    const items = buildContextMenu(message, selectedChat.isGroup, onClose)
    const [cursorX, cursorY] = [event.clientX, event.clientY]

    openContextMenu({
      cursorX,
      cursorY,
      items,
    })
  }

  async function refresh() {
    setLoading(true)
    const messages = await DeltaBackend.call(
      'messageList.getMessages',
      selectedChat.id,
      0,
      -1,
      {},
      C.DC_GCM_ADDDAYMARKER | C.DC_GCM_INFO_ONLY
    )
    setMessages(messages)
    setLoading(false)

    setTimeout(() => {
      listView.current.scrollTop = listView.current?.scrollHeight
    }, 0)
  }

  useEffect(() => {
    refresh()
  }, [selectedChat.id])

  let specialMessageIdCounter = 0

  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
      className={'audit-log-dialog'}
      style={{ width: 'calc(100vw - 50px)', maxWidth: '733px' }}
      isCloseButtonShown={true}
    >
      <div className='bp3-dialog-header bp3-dialog-header-border-bottom'>
        <div className='heading'>
          <h4>{tx('chat_audit_log_title', selectedChat.name)}</h4>
          <h5>{tx('chat_audit_log_description')}</h5>
        </div>
        <DeltaDialogCloseButton onClick={onClose} />
      </div>

      {loading ? (
        <div>{tx('loading')}</div>
      ) : (
        <div style={{ overflowY: 'scroll' }} ref={listView}>
          {messages.length === 0 && (
            <div className='no-content' key='no-content-msg'>
              <div>{tx('chat_audit_log_empty_message')}</div>
            </div>
          )}
          <ul key='info-message-list'>
            {messages.map((message, index) => {
              if (message.type === MessageTypeIs.DayMarker) {
                const key = 'magic' + index + '_' + specialMessageIdCounter++
                return (
                  <li key={key} className='time'>
                    <div>
                      {moment.unix(message.timestamp).calendar(null, {
                        sameDay: `[${tx('today')}]`,
                        lastDay: `[${tx('yesterday')}]`,
                        lastWeek: 'LL',
                        sameElse: 'LL',
                      })}
                    </div>
                  </li>
                )
              }
              if (message.type !== MessageTypeIs.Message) {
                log.debug(`Missing message with index ${index}`)
                return
              }

              const { text, direction, timestamp, id } = message
              return (
                <li
                  key={index}
                  className='info'
                  onClick={() => {
                    openMessageInfo(message)
                  }}
                  onContextMenu={showMenu.bind(null, message)}
                >
                  <p>
                    <div className='timestamp'>
                      {moment.unix(timestamp).format('LT')}
                    </div>
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
          </ul>
        </div>
      )}
    </DeltaDialogBase>
  )
}
