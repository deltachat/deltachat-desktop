import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react'
import { DeltaDialogBase, DeltaDialogCloseButton } from './DeltaDialog'
import { DialogProps } from './DialogController'
import { FullChat, NormalMessage, MetaMessage, MetaMessageIs } from '../../../shared/shared-types'
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
import { getDirection } from '../../../shared/util'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'

const log = getLogger('render/ChatAuditLog')

function buildContextMenu(
  message: NormalMessage,
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
  const [messages, setMessages] = useState<MetaMessage[]>([])

  const listView = useRef<HTMLDivElement>(null)

  const { openContextMenu } = useContext(ScreenContext)
  const showMenu = (
    message: NormalMessage,
    event: React.MouseEvent<
      HTMLDivElement | HTMLAnchorElement | HTMLLIElement,
      MouseEvent
    >
  ) => {
    const items = buildContextMenu(message, selectedChat.isGroup, onClose)
    const [cursorX, cursorY] = [event.clientX, event.clientY]

    openContextMenu({
      cursorX,
      cursorY,
      items,
    })
  }

  const refresh = useCallback(
    async function () {
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
        if (listView.current)
          listView.current.scrollTop = listView.current.scrollHeight
      }, 0)
    },
    [selectedChat.id]
  )

  useEffect(() => {
    refresh()
  }, [selectedChat.id, refresh])

  let specialMessageIdCounter = 0

  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
      className={'audit-log-dialog'}
      style={{ width: 'calc(100vw - 50px)', maxWidth: '733px' }}
      showCloseButton={true}
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
              if (message.type === MetaMessageIs.DayMarker) {
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
              if (message.type !== MetaMessageIs.Normal) {
                log.debug(`Missing message with index ${index}`)
                return
              }
              const { text, timestamp } = message
              const direction = getDirection(message)
              const status = mapCoreMsgStatus2String(message.state)
              return (
                <li
                  key={index}
                  className='info'
                  onClick={openMessageInfo.bind(null, message)}
                  onContextMenu={ev => message && showMenu(message, ev)}
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
