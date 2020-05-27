import React, { useRef, useEffect } from 'react'
import { MessageWrapper } from './MessageWrapper'
import { ChatStoreState } from '../../stores/chat'
import { C } from 'deltachat-node/dist/constants'
import moment from 'moment'

import { getLogger } from '../../../shared/logger'
import { MessageType } from '../../../shared/shared-types'
import {
  InfiniteLoader,
  AutoSizer,
  List,
  CellMeasurerCache,
  CellMeasurer,
} from 'react-virtualized'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import { useMessageIdList, useMessageList } from './messageListHook'
const log = getLogger('render/msgList')

export default function MessageList({
  chat,
  locationStreamingEnabled,
}: {
  chat: ChatStoreState
  locationStreamingEnabled: boolean
}) {
  console.log('render')
  const heightCache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 79,
      minHeight: 25,
    })
  )

  useKeyBindingAction(KeybindAction.Event_Window_Resize, () =>
    heightCache.current.clearAll()
  )

  const messageIds = useMessageIdList(chat.id)
  const { isMessageLoaded, loadMessages, messageCache } = useMessageList(
    messageIds
  )

  const tx = window.translate

  let emptyChatMessage = tx('chat_no_messages_hint', [chat.name, chat.name])

  if (chat.isGroup) {
    emptyChatMessage = chat.isUnpromoted
      ? tx('chat_new_group_hint')
      : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  }

  const Loader = useRef<InfiniteLoader>(null)
  const Scroller = useRef<List>(null)

  useKeyBindingAction(KeybindAction.ChatView_ScrollToBottom, () => {
    Scroller.current?.scrollToRow(messageIds.length)
  })

  useEffect(() => {
    heightCache.current.clearAll()
    Loader.current.resetLoadMoreRowsCache()
  }, [chat.id])

  return (
    <div className='message-list' style={{ height: '100%' }}>
      <AutoSizer>
        {({ width, height }) => (
          <ul style={{ margin: 0, width }}>
            {messageIds.length < 1 && (
              <li key={'empty-chat-message'}>
                <div className='info-message big'>
                  <p>{emptyChatMessage}</p>
                </div>
              </li>
            )}

            <InfiniteLoader
              ref={Loader}
              isRowLoaded={isMessageLoaded}
              loadMoreRows={loadMessages}
              rowCount={messageIds.length}
              chatId={chat.id}
            >
              {({ onRowsRendered, registerChild }) => (
                <List
                  chatId={chat.id}
                  ref={ref => {
                    Scroller.current = ref
                    registerChild(ref)
                  }}
                  onRowsRendered={onRowsRendered}
                  overscanRowCount={10}
                  height={height}
                  width={width}
                  scrollToIndex={messageIds.length - 1}
                  rowCount={messageIds.length}
                  rowHeight={heightCache.current.rowHeight}
                  rowRenderer={({ key, index, parent, style }) => {
                    console.log('rowRenderer', index, messageIds[index])
                    const msgId = messageIds[index]

                    if (msgId === C.DC_MSG_ID_DAYMARKER) {
                      const nextMessage = messageCache[messageIds[index + 1]]
                      if (!nextMessage) return null
                      return (
                        <CellMeasurer
                          cache={heightCache.current}
                          columnIndex={0}
                          key={key}
                          parent={parent}
                          rowIndex={index}
                        >
                          <div style={style}>
                            <div className='info-message' key={key}>
                              <p style={{ textTransform: 'capitalize' }}>
                                {moment
                                  .unix(nextMessage.msg.timestamp)
                                  .calendar(null, {
                                    sameDay: `[${tx('today')}]`,
                                    lastDay: `[${tx('yesterday')}]`,
                                    lastWeek: 'LL',
                                    sameElse: 'LL',
                                  })}
                              </p>
                            </div>
                          </div>
                        </CellMeasurer>
                      )
                    }
                    const message = messageCache[msgId]
                    if (!message || message.msg == null) return
                    return (
                      <CellMeasurer
                        cache={heightCache.current}
                        columnIndex={0}
                        key={key}
                        parent={parent}
                        rowIndex={index}
                      >
                        <div style={style}>
                          <MessageWrapper
                            message={message as MessageType}
                            locationStreamingEnabled={locationStreamingEnabled}
                            chat={chat}
                          />
                        </div>
                      </CellMeasurer>
                    )
                  }}
                  deferredMeasurementCache={heightCache.current}
                />
              )}
            </InfiniteLoader>
          </ul>
        )}
      </AutoSizer>
    </div>
  )
}
