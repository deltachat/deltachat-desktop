import { Store } from './store'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from '@deltachat/jsonrpc-client'
import { BackendRemote, onDCEvent, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { T } from '@deltachat/jsonrpc-client'
import {
  ChatViewState,
  ChatViewReducer,
  defaultChatViewState,
} from './chat/chat_view_reducer'
import { ChatStoreScheduler } from './chat/chat_scheduler'
import { useEffect, useMemo, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { debounce } from 'debounce'

const PAGE_SIZE = 11

interface MessageListState {
  // chat: Type.FullChat | null
  messageListItems: T.MessageListItem[]
  messageCache: { [msgId: number]: T.MessageLoadResult | undefined }
  newestFetchedMessageListItemIndex: number
  oldestFetchedMessageListItemIndex: number
  viewState: ChatViewState
  jumpToMessageStack: number[]
  loaded: boolean
}

const defaultState = () =>
  ({
    messageListItems: [],
    messageCache: {},
    newestFetchedMessageListItemIndex: -1,
    oldestFetchedMessageListItemIndex: -1,
    viewState: defaultChatViewState(),
    jumpToMessageStack: [],
    loaded: false,
  } as MessageListState)

export function useMessageList(accountId: number, chatId: number) {
  const store = useMemo(() => {
    const store = new MessageListStore(accountId, chatId)
    store.effect.loadChat()
    return store
  }, [accountId, chatId])

  useEffect(() => {
    const cleanup = [
      onDCEvent(accountId, 'MsgDelivered', ({ chatId: eventChatId, msgId }) => {
        if (chatId === eventChatId) {
          store.reducer.setMessageState(msgId, C.DC_STATE_OUT_DELIVERED)
        }
      }),
      onDCEvent(accountId, 'IncomingMsg', ({ chatId: eventChatId }) => {
        if (chatId === eventChatId) {
          store.effect.onEventIncomingMessage()
        } else {
          store.log.debug(
            `chatId of IncomingMsg event (${chatId}) doesn't match id of selected chat (${eventChatId}). Skipping.`
          )
        }
      }),
      onDCEvent(accountId, 'MsgRead', ({ chatId: eventChatId, msgId }) => {
        if (chatId === eventChatId) {
          store.reducer.setMessageState(msgId, C.DC_STATE_OUT_MDN_RCVD)
        }
      }),
      onDCEvent(accountId, 'MsgsChanged', ({ chatId: eventChatId, msgId }) => {
        if (msgId === 0 && (eventChatId === 0 || eventChatId === chatId)) {
          store.effect.refresh()
        } else {
          store.effect.onEventMessagesChanged(msgId)
        }
      }),
      onDCEvent(accountId, 'MsgFailed', ({ chatId: eventChatId, msgId }) => {
        if (chatId === eventChatId) {
          store.effect.onEventMessagesChanged(msgId)
        }
      }),
    ]
    return () => cleanup.forEach(off => off())
  }, [accountId, chatId, store])

  const [state, setState] = useState(store.getState())

  useEffect(() => {
    store.subscribe(setState)
    return () => store.unsubscribe(setState)
  }, [store])

  const [fetchMoreTop] = useDebouncedCallback(
    async () => {
      await store.effect.fetchMoreMessagesTop()
    },
    30,
    { leading: true }
  )

  const [fetchMoreBottom] = useDebouncedCallback(
    async () => {
      await store.effect.fetchMoreMessagesBottom()
    },
    30,
    { leading: true }
  )

  return { store, state, fetchMoreTop, fetchMoreBottom }
}

function getView<T>(items: T[], start: number, end: number) {
  return items.slice(start, end + 1)
}

class MessageListStore extends Store<MessageListState> {
  scheduler = new ChatStoreScheduler()

  emitter = BackendRemote.getContextEvents(this.accountId)

  constructor(
    private readonly accountId: number,
    private readonly chatId: number
  ) {
    super(defaultState())
  }

  get activeView() {
    const start = this.state.oldestFetchedMessageListItemIndex
    const end = this.state.newestFetchedMessageListItemIndex
    const view = getView(this.state.messageListItems, start, end)
    // this.log.debug('get activeView', { end, start, view })
    return view
  }

  reducer = {
    selectedChat: (payload: Partial<MessageListState>) => {
      this.setState(_ => {
        this.scheduler.unlock('scroll')
        const modifiedState: MessageListState = {
          ...defaultState(),
          ...payload,
          loaded: true,
        }
        return modifiedState
      }, 'selectedChat')
    },
    refresh: (
      messageListItems: T.MessageListItem[],
      messageCache: MessageListState['messageCache'],
      newestFetchedMessageListItemIndex: number,
      oldestFetchedMessageListItemIndex: number
    ) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListItems,
          messageCache,
          viewState: ChatViewReducer.refresh(state.viewState),
          newestFetchedMessageListItemIndex,
          oldestFetchedMessageListItemIndex,
          loaded: true,
        }
        return modifiedState
      }, 'refresh')
    },
    modifiedChat: (payload: { id: number } & Partial<MessageListState>) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          ...payload,
        }
        return modifiedState
      }, 'modifiedChat')
    },
    appendMessagePageTop: (payload: {
      id: number
      newMessageCacheItems: MessageListState['messageCache']
      oldestFetchedMessageListItemIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          oldestFetchedMessageListItemIndex:
            payload.oldestFetchedMessageListItemIndex,
          viewState: ChatViewReducer.appendMessagePageTop(state.viewState),
        }
        return modifiedState
      }, 'appendMessagePageTop')
    },
    appendMessagePageBottom: (payload: {
      newMessageCacheItems: MessageListState['messageCache']
      newestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          newestFetchedMessageListItemIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.appendMessagePageBottom(state.viewState),
        }
        return modifiedState
      }, 'appendMessagePageBottom')
    },
    fetchedIncomingMessages: (payload: {
      messageListItems: MessageListState['messageListItems']
      newestFetchedMessageIndex: number
      newMessageCacheItems: MessageListState['messageCache']
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListItems: payload.messageListItems,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          newestFetchedMessageListItemIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.fetchedIncomingMessages(state.viewState),
        }
        return modifiedState
      }, 'fetchedIncomingMessages')
    },
    unlockScroll: () => {
      this.log.debug('unlockScroll')
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          viewState: ChatViewReducer.unlockScroll(state.viewState),
        }
        setTimeout(() => this.scheduler.unlock('scroll'), 0)
        return modifiedState
      }, 'unlockScroll')
    },
    messageChanged: (message: Type.Message) => {
      const messageLoadResult: Type.MessageLoadResult = {
        kind: 'message',
        ...message,
      }
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageCache: {
            ...state.messageCache,
            [message.id]: messageLoadResult,
          },
        }
        return modifiedState
      }, 'messageChanged')
    },
    setMessageState: (messageId: number, messageState: number) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageCache: {
            ...state.messageCache,
            [messageId]: {
              ...state.messageCache[messageId],
              state: messageState,
            } as Type.MessageLoadResult,
          },
        }
        return modifiedState
      }, 'setMessageState')
    },
    setMessageListItems: (
      messageListItems: MessageListState['messageListItems']
    ) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListItems,
          viewState: ChatViewReducer.setMessageListItems(state.viewState),
        }
        return modifiedState
      }, 'setMessageIds')
    },
    clearJumpStack: () => {
      if (this.state.jumpToMessageStack.length !== 0) {
        this.setState(state => {
          const modifiedState: MessageListState = {
            ...state,
            jumpToMessageStack: [],
          }
          return modifiedState
        }, 'clearJumpStack')
      }
    },
  }

  effect = {
    loadChat: this.scheduler.lockedQueuedEffect(
      'scroll',
      async () => {
        const chat = await BackendRemote.rpc.getFullChatById(
          this.accountId,
          this.chatId
        )
        if (chat.id === null) {
          this.log.debug(
            'SELECT CHAT chat does not exist, id is null. chatId:',
            chat.id
          )
          return
        }
        const messageListItems = await BackendRemote.rpc.getMessageListItems(
          this.accountId,
          this.chatId,
          false,
          true
        )

        const firstUnreadMsgId = await BackendRemote.rpc.getFirstUnreadMessageOfChat(
          this.accountId,
          this.chatId
        )
        if (firstUnreadMsgId !== null) {
          setTimeout(() => {
            this.effect.jumpToMessage(firstUnreadMsgId, false)
            ActionEmitter.emitAction(
              chat.archived
                ? KeybindAction.ChatList_SwitchToArchiveView
                : KeybindAction.ChatList_SwitchToNormalView
            )
          })
          return false
        }

        let oldestFetchedMessageListItemIndex = -1
        let newestFetchedMessageListItemIndex = -1
        let messageCache: MessageListState['messageCache'] = {}
        if (messageListItems.length !== 0) {
          // mesageIds.length = 1767
          // oldestFetchedMessageListItemIndex = 1767 - 1 = 1766 - 10 = 1756
          // newestFetchedMessageIndex =                        1766
          oldestFetchedMessageListItemIndex = Math.max(
            messageListItems.length - 1 - PAGE_SIZE,
            0
          )
          newestFetchedMessageListItemIndex = messageListItems.length - 1

          messageCache =
            (await loadMessages(
              this.accountId,
              messageListItems,
              oldestFetchedMessageListItemIndex,
              newestFetchedMessageListItemIndex
            ).catch(err => this.log.error('loadMessages failed', err))) || {}
        }

        this.reducer.selectedChat({
          messageCache,
          messageListItems,
          oldestFetchedMessageListItemIndex,
          newestFetchedMessageListItemIndex,
          viewState: ChatViewReducer.selectChat(this.state.viewState),
        })
      },
      'selectChat'
    ),
    jumpToMessage: this.scheduler.lockedQueuedEffect(
      'scroll',
      async (
        msgId: number | undefined,
        highlight = true,
        addMessageIdToStack?: undefined | number
      ) => {
        this.log.debug('jumpToMessage with messageId: ', msgId)
        const accountId = selectedAccountId()
        // these methods were called in backend before
        // might be an issue if DeltaBackend.call has a significant delay

        if (!accountId) {
          throw new Error('no account set')
        }
        // this function already throws an error if message is not found

        let chatId = -1
        let jumpToMessageId = -1
        let jumpToMessageStack: number[] = []
        let message: Type.Message | undefined = undefined
        if (msgId === undefined) {
          // jump down
          const jumpToMessageStackLength = this.state.jumpToMessageStack.length
          if (jumpToMessageStackLength !== 0) {
            jumpToMessageStack = this.state.jumpToMessageStack.slice(
              0,
              jumpToMessageStackLength - 1
            )
            jumpToMessageId = this.state.jumpToMessageStack[
              jumpToMessageStackLength - 1
            ]
            message = await BackendRemote.rpc.getMessage(
              accountId,
              jumpToMessageId as number
            )
            chatId = message.chatId
          } else {
            const items = this.state.messageListItems
              .map(m =>
                m.kind === 'message' ? m.msg_id : C.DC_MSG_ID_LAST_SPECIAL
              )
              .filter(msgId => msgId !== C.DC_MSG_ID_LAST_SPECIAL)
            message = await BackendRemote.rpc.getMessage(
              accountId,
              items[items.length - 1]
            )
            chatId = message.chatId
            jumpToMessageStack = []
            jumpToMessageId = message.id
            highlight = false
          }
        } else if (addMessageIdToStack === undefined) {
          // reset jumpToMessageStack
          message = await BackendRemote.rpc.getMessage(
            accountId,
            msgId as number
          )
          chatId = message.chatId

          jumpToMessageId = msgId as number
          jumpToMessageStack = []
        } else {
          message = await BackendRemote.rpc.getMessage(
            accountId,
            msgId as number
          )
          chatId = message.chatId

          jumpToMessageId = msgId as number
          // If we are not switching chats, add current jumpToMessageId to the stack
          const currentChatId = this.chatId || -1
          if (chatId !== currentChatId) {
            jumpToMessageStack = []
          } else if (
            this.state.jumpToMessageStack.indexOf(addMessageIdToStack) !== -1
          ) {
            jumpToMessageStack = this.state.jumpToMessageStack
          } else {
            jumpToMessageStack = [
              ...this.state.jumpToMessageStack,
              addMessageIdToStack,
            ]
          }
        }

        //@ts-ignore
        if (message === undefined) {
          throw new Error(
            'jumpToMessage: Tried to jump to non existing message with id: ' +
              msgId
          )
        }

        const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
        if (chat.id === null) {
          this.log.debug(
            'SELECT CHAT chat does not exist, id is null. chatId:',
            chat.id
          )
          return
        }
        const messageListItems = await BackendRemote.rpc.getMessageListItems(
          accountId,
          chatId,
          false,
          true
        )

        const jumpToMessageIndex = messageListItems.findIndex(
          m => m.kind === 'message' && m.msg_id === jumpToMessageId
        )

        // calculate page indexes, so that jumpToMessageId is in the middle of the page
        let oldestFetchedMessageListItemIndex = -1
        let newestFetchedMessageListItemIndex = -1
        let messageCache: MessageListState['messageCache'] = {}
        const half_page_size = Math.ceil(PAGE_SIZE / 2)
        if (messageListItems.length !== 0) {
          oldestFetchedMessageListItemIndex = Math.max(
            jumpToMessageIndex - half_page_size,
            0
          )
          newestFetchedMessageListItemIndex = Math.min(
            jumpToMessageIndex + half_page_size,
            messageListItems.length - 1
          )

          const countMessagesOnNewerSide =
            newestFetchedMessageListItemIndex - jumpToMessageIndex
          const countMessagesOnOlderSide =
            jumpToMessageIndex - oldestFetchedMessageListItemIndex
          if (countMessagesOnNewerSide < half_page_size) {
            oldestFetchedMessageListItemIndex = Math.max(
              oldestFetchedMessageListItemIndex -
                (half_page_size - countMessagesOnNewerSide),
              0
            )
          } else if (countMessagesOnOlderSide < half_page_size) {
            newestFetchedMessageListItemIndex = Math.min(
              newestFetchedMessageListItemIndex +
                (half_page_size - countMessagesOnOlderSide),
              messageListItems.length - 1
            )
          }

          messageCache =
            (await loadMessages(
              accountId,
              messageListItems,
              oldestFetchedMessageListItemIndex,
              newestFetchedMessageListItemIndex
            ).catch(err => this.log.error('loadMessages failed', err))) || {}
        }

        this.reducer.selectedChat({
          messageCache,
          messageListItems,
          oldestFetchedMessageListItemIndex,
          newestFetchedMessageListItemIndex: newestFetchedMessageListItemIndex,
          viewState: ChatViewReducer.jumpToMessage(
            this.state.viewState,
            jumpToMessageId,
            highlight
          ),
          jumpToMessageStack,
        })
      },
      'jumpToMessage'
    ),
    loadMissingMessages: debounce(
      // needs debounce, because every missing message calls this
      this.scheduler.lockedQueuedEffect(
        'scroll',
        async () => {
          const { messageCache } = this.state
          const missing_message_ids: number[] = []
          for (const item of this.activeView) {
            if (item.kind === 'message' && !messageCache[item.msg_id]) {
              missing_message_ids.push(item.msg_id)
            }
          }
          if (missing_message_ids.length === 0) {
            return
          }
          this.log.warn(
            'Message store cache misses messages, trying to load them now',
            missing_message_ids
          )
          const newMessageCacheItems = await BackendRemote.rpc.getMessages(
            this.accountId,
            missing_message_ids
          )
          this.setState(state => {
            const modifiedState: MessageListState = {
              ...state,
              messageCache: {
                ...state.messageCache,
                ...newMessageCacheItems,
              },
            }
            return modifiedState
          }, 'loadMissingMessagesAppend')
        },
        'loadMissingMessages'
      ),
      400
    ),
    fetchMoreMessagesTop: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async () => {
          this.log.debug(`fetchMoreMessagesTop`)
          const state = this.state
          const id = this.chatId
          const oldestFetchedMessageListItemIndex = Math.max(
            state.oldestFetchedMessageListItemIndex - PAGE_SIZE,
            0
          )
          const lastMessageIndexOnLastPage =
            state.oldestFetchedMessageListItemIndex
          if (lastMessageIndexOnLastPage === 0) {
            this.log.debug(
              'FETCH_MORE_MESSAGES: lastMessageIndexOnLastPage is zero, returning'
            )
            return false
          }
          const fetchedMessageListItems = state.messageListItems.slice(
            oldestFetchedMessageListItemIndex,
            lastMessageIndexOnLastPage
          )
          if (fetchedMessageListItems.length === 0) {
            this.log.debug(
              'fetchMoreMessagesTop: fetchedMessageListItems.length is zero, returning'
            )
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListItems,
              oldestFetchedMessageListItemIndex,
              lastMessageIndexOnLastPage - 1
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagePageTop({
            id,
            newMessageCacheItems,
            oldestFetchedMessageListItemIndex,
          })
          return true
        },
        'fetchMoreMessagesTop'
      ),
      'fetchMoreMessagesTop'
    ),
    fetchMoreMessagesBottom: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async () => {
          const state = this.state

          const newestFetchedMessageListItemIndex =
            state.newestFetchedMessageListItemIndex + 1
          const newNewestFetchedMessageListItemIndex = Math.min(
            newestFetchedMessageListItemIndex + PAGE_SIZE,
            state.messageListItems.length - 1
          )
          if (
            newestFetchedMessageListItemIndex === state.messageListItems.length
          ) {
            //log.debug('fetchMoreMessagesBottom: no more messages, returning')
            return false
          }
          this.log.debug(`fetchMoreMessagesBottom`)

          const fetchedMessageListItems = state.messageListItems.slice(
            newestFetchedMessageListItemIndex,
            newNewestFetchedMessageListItemIndex + 1
          )
          if (fetchedMessageListItems.length === 0) {
            this.log.debug(
              'fetchMoreMessagesBottom: fetchedMessageListItems.length is zero, returning',
              JSON.stringify({
                newestFetchedMessageIndex: newestFetchedMessageListItemIndex,
                newNewestFetchedMessageIndex: newNewestFetchedMessageListItemIndex,
                messageIds: state.messageListItems,
              })
            )
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListItems,
              newestFetchedMessageListItemIndex,
              newNewestFetchedMessageListItemIndex
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagePageBottom({
            newMessageCacheItems,
            newestFetchedMessageIndex: newNewestFetchedMessageListItemIndex,
          })
          return true
        },
        'fetchMoreMessagesBottom'
      ),
      'fetchMoreMessagesBottom'
    ),
    refresh: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async () => {
          this.log.debug(`refresh`, this)
          const state = this.state
          const messageListItems = await BackendRemote.rpc.getMessageListItems(
            this.accountId,
            this.chatId,
            false,
            true
          )
          let {
            newestFetchedMessageListItemIndex,
            oldestFetchedMessageListItemIndex,
          } = state
          newestFetchedMessageListItemIndex = Math.min(
            newestFetchedMessageListItemIndex,
            messageListItems.length - 1
          )
          oldestFetchedMessageListItemIndex = Math.max(
            oldestFetchedMessageListItemIndex,
            0
          )

          const messageCache =
            (await loadMessages(
              this.accountId,
              messageListItems,
              oldestFetchedMessageListItemIndex,
              newestFetchedMessageListItemIndex
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.refresh(
            messageListItems,
            messageCache,
            newestFetchedMessageListItemIndex,
            oldestFetchedMessageListItemIndex
          )
          return true
        },
        'refresh'
      ),
      'refresh'
    ),
    onEventIncomingMessage: this.scheduler.queuedEffect(async () => {
      const messageListItems = await BackendRemote.rpc.getMessageListItems(
        this.accountId,
        this.chatId,
        false,
        true
      )
      let indexEnd = -1
      const last_item = this.state.messageListItems[
        this.state.messageListItems.length - 1
      ]

      let indexStart = messageListItems.findIndex(item => {
        if (last_item.kind !== item.kind) {
          return false
        } else {
          if (item.kind === 'message') {
            return item.msg_id === (last_item as any).msg_id
          } else {
            return item.timestamp === (last_item as any).timestamp
          }
        }
      })

      // check if there is an intersection
      if (indexStart !== -1 && messageListItems[indexStart + 1]) {
        indexStart = indexStart + 1
      }

      // if index start is not the end set, then set the end to the end
      if (indexStart !== messageListItems.length - 1) {
        indexEnd = messageListItems.length - 1
      } else {
        indexEnd = indexStart
      }

      // Only add incoming messages if we could append them directly to messagePages without having a hole
      if (
        this.state.newestFetchedMessageListItemIndex !== -1 &&
        indexStart !== this.state.newestFetchedMessageListItemIndex + 1
      ) {
        this.log.debug(
          `onEventIncomingMessage: new incoming messages cannot added to state without having a hole (indexStart: ${indexStart}, newestFetchedMessageListItemIndex ${this.state.newestFetchedMessageListItemIndex}), returning`
        )
        this.reducer.setMessageListItems(messageListItems)
        return
      }

      const newMessageCacheItems =
        (await loadMessages(
          this.accountId,
          messageListItems,
          indexStart,
          indexEnd
        ).catch(err => this.log.error('loadMessages failed', err))) || {}

      this.reducer.fetchedIncomingMessages({
        messageListItems,
        newMessageCacheItems,
        newestFetchedMessageIndex: indexEnd,
      })
    }, 'onEventIncomingMessage'),
    onEventMessagesChanged: this.scheduler.queuedEffect(
      async (messageId: number) => {
        if (
          this.state.messageListItems.findIndex(
            m => m.kind === 'message' && m.msg_id === messageId
          ) !== -1
        ) {
          this.log.debug(
            'DC_EVENT_MSGS_CHANGED',
            'changed message seems to be message we already know'
          )
          try {
            const message = await BackendRemote.rpc.getMessage(
              this.accountId,
              messageId
            )
            this.reducer.messageChanged(message)
          } catch (error) {
            this.log.warn('failed to fetch message with id', messageId, error)
            // ignore not found and other errors
            return
          }
        } else {
          this.log.debug(
            'DC_EVENT_MSGS_CHANGED',
            'changed message seems to be a new message, refetching messageIds'
          )
          const messageListItems = await BackendRemote.rpc.getMessageListItems(
            this.accountId,
            this.chatId,
            false,
            true
          )
          this.reducer.setMessageListItems(messageListItems)
        }
      },
      'onEventMessagesChanged'
    ),
  }

  stateToHumanReadable(state: MessageListState): any {
    return {
      ...state,
    }
  }
}

async function loadMessages(
  accountId: number,
  messageListItems: Type.MessageListItem[],
  oldestFetchedMessageListItemIndex: number,
  newestFetchedMessageListItemIndex: number
) {
  const view = getView(
    messageListItems,
    oldestFetchedMessageListItemIndex,
    newestFetchedMessageListItemIndex
  )
    .map(m => (m.kind === 'message' ? m.msg_id : C.DC_MSG_ID_LAST_SPECIAL))
    .filter(msgId => msgId !== C.DC_MSG_ID_LAST_SPECIAL)
  return await BackendRemote.rpc.getMessages(accountId, view)
}
