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
  /**
   * This is used as an "event bus". When we need to update the scroll position
   * of the messages list (e.g. `scrollToMessage`), or, instead, keep the
   * scroll position in the same place as we append newly loaded messages,
   * to prevent content jumps (`scrollToLastKnownPosition`,
   * manual scroll anchoring), then we set `viewState.scrollTo`
   * to the desired state.
   * After that, the MessageList component looks at the new state,
   * sets the scroll position accordingly, and resets the state to null.
   */
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
  }) as MessageListState

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
      onDCEvent(
        accountId,
        'ReactionsChanged',
        ({ chatId: eventChatId, msgId }) => {
          if (msgId === 0 && (eventChatId === 0 || eventChatId === chatId)) {
            store.effect.refresh()
          } else {
            store.effect.onEventMessagesChanged(msgId)
          }
        }
      ),
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
    appendMessagesTop: (payload: {
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
          viewState: ChatViewReducer.appendMessagesTop(state.viewState),
        }
        return modifiedState
      }, 'appendMessagesTop')
    },
    appendMessagesBottom: (payload: {
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
          viewState: ChatViewReducer.appendMessagesBottom(state.viewState),
        }
        return modifiedState
      }, 'appendMessagesBottom')
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
        const firstUnreadMsgIdP = BackendRemote.rpc.getFirstUnreadMessageOfChat(
          this.accountId,
          this.chatId
        )
        const messageListItemsP = BackendRemote.rpc.getMessageListItems(
          this.accountId,
          this.chatId,
          false,
          true
        )
        const chatP = BackendRemote.rpc.getBasicChatInfo(
          this.accountId,
          this.chatId
        )
        chatP.then(chat => {
          if (chat.id === null) {
            this.log.debug(
              'SELECT CHAT chat does not exist, id is null. chatId:',
              chat.id
            )
          }
        })

        const firstUnreadMsgId = await firstUnreadMsgIdP
        if (firstUnreadMsgId !== null) {
          setTimeout(async () => {
            const chat = await chatP
            this.effect.jumpToMessage(firstUnreadMsgId, false)
            ActionEmitter.emitAction(
              chat.archived
                ? KeybindAction.ChatList_SwitchToArchiveView
                : KeybindAction.ChatList_SwitchToNormalView
            )
          })
          // Since we haven't changed `viewState`, `MessageList` won't
          // call `unlockScroll()`, so let's unlock it now.
          // `jumpToMessage` (above) will take care
          // of the future locking / unlocking.
          return false
        }

        let oldestFetchedMessageListItemIndex = -1
        let newestFetchedMessageListItemIndex = -1
        let messageCache: MessageListState['messageCache'] = {}
        const messageListItems = await messageListItemsP
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
    /**
     * Loads and shows the message in the messages list.
     * It can handle showing the message in a chat other than `this.chatId`,
     * loading the message if it is missing from `this.state.messageCache`,
     * and reloading `messageListItems` if the message is missing from there.
     */
    jumpToMessage: this.scheduler.lockedQueuedEffect(
      'scroll',
      async (
        msgId: number | undefined,
        highlight = true,
        addMessageIdToStack?: undefined | number
      ) => {
        const startTime = performance.now()

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
            jumpToMessageId =
              this.state.jumpToMessageStack[jumpToMessageStackLength - 1]
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
        } else {
          const fromCache = this.state.messageCache[msgId]
          message =
            fromCache?.kind === 'message'
              ? fromCache
              : await BackendRemote.rpc.getMessage(accountId, msgId as number)
          chatId = message.chatId

          jumpToMessageId = msgId as number

          if (addMessageIdToStack === undefined) {
            // reset jumpToMessageStack
            jumpToMessageStack = []
          } else {
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
        }

        //@ts-ignore
        if (message === undefined) {
          throw new Error(
            'jumpToMessage: Tried to jump to non existing message with id: ' +
              msgId
          )
        }

        const isMessageInCurrentChat =
          this.accountId === accountId && this.chatId === chatId

        let messageListItems = this.state.messageListItems
        const findMessageIndex = (): number =>
          messageListItems.findIndex(
            m => m.kind === 'message' && m.msg_id === jumpToMessageId
          )

        let jumpToMessageIndex = findMessageIndex()
        const currentMessageListContainsTheMessage = jumpToMessageIndex >= 0
        // Even if the message is in the current chat, it could still
        // be missing from `this.state.messageListItems` in these cases:
        // - `this.state.messageListItems` is still unloaded,
        //   e.g. when `loadChat` interrupts itself and calls `jumpToMessage`.
        // - A new message has just been sent to the chat and we want to jump
        //   to it.
        if (!isMessageInCurrentChat || !currentMessageListContainsTheMessage) {
          messageListItems = await BackendRemote.rpc.getMessageListItems(
            accountId,
            chatId,
            false,
            true
          )
          jumpToMessageIndex = findMessageIndex()
        }

        // calculate page indexes, so that jumpToMessageId is in the middle of the page
        let oldestFetchedMessageListItemIndex = -1
        let newestFetchedMessageListItemIndex = -1
        let newMessageCache: MessageListState['messageCache'] = {}
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

          const messagesAlreadyLoaded = getView(
            messageListItems,
            oldestFetchedMessageListItemIndex,
            newestFetchedMessageListItemIndex
          ).every(item => {
            if (item.kind !== 'message') {
              return true
            }
            return this.state.messageCache[item.msg_id] != undefined
          })

          this.log.debug(
            'messagesAlreadyLoaded:',
            messagesAlreadyLoaded,
            messagesAlreadyLoaded
              ? 'Using the existing cache'
              : 'Resetting the messageCache'
          )

          if (messagesAlreadyLoaded) {
            newMessageCache = this.state.messageCache

            // Why do we need `Math.min` / `Math.max` here, instead of simply
            // keeping `this.state.oldestFetchedMessageListItemIndex`
            // and `this.state.newestFetchedMessageListItemIndex` as they are?
            // Because some other code might update the state in such a way
            // that `messageCache` and these
            // `(oldest|newest)FetchedMessageListItemIndex` are out of sync:
            // `messageCache` actually has a message, but
            // these integers say that the message is not yet fetched.
            // Namely, this can happen inside of `messageChanged` when
            // it gets invoked for a not yet fetched message, and it gets
            // added `messageCache` instead of getting updated.
            // This, in turn, can happen when you send a message.
            //
            // The result would be that we'd fail to jump to message inside of
            // `MessageList.tsx`, because the message wouldn't be rendered,
            // because we only render messages that are between
            // `oldestFetchedMessageListItemIndex` and
            // `newestFetchedMessageListItemIndex` (see `activeView`).
            //
            // TODO it would be ideal to get ensure that we don't corrupt
            // the state in the first place, but let's make
            // this workaround for now.
            oldestFetchedMessageListItemIndex = Math.min(
              this.state.oldestFetchedMessageListItemIndex,
              oldestFetchedMessageListItemIndex
            )
            newestFetchedMessageListItemIndex = Math.max(
              this.state.newestFetchedMessageListItemIndex,
              newestFetchedMessageListItemIndex
            )
          } else {
            newMessageCache =
              (await loadMessages(
                accountId,
                messageListItems,
                oldestFetchedMessageListItemIndex,
                newestFetchedMessageListItemIndex
              ).catch(err => this.log.error('loadMessages failed', err))) || {}
          }
        }

        this.log.debug('jumpToMessage took', performance.now() - startTime)
        // TODO perf: it could so happen that nothing except `viewState` (which
        // is only responsible for scrolling)
        // has changed after this function has run.
        // It woud be great to not re-render the message list in that case.
        this.reducer.selectedChat({
          messageCache: newMessageCache,
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
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
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
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListItems,
              oldestFetchedMessageListItemIndex,
              lastMessageIndexOnLastPage - 1
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagesTop({
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
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
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
                newNewestFetchedMessageIndex:
                  newNewestFetchedMessageListItemIndex,
                messageIds: state.messageListItems,
              })
            )
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListItems,
              newestFetchedMessageListItemIndex,
              newNewestFetchedMessageListItemIndex
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagesBottom({
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
          // this.log.debug(`refresh`, this)
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
      const last_item: Type.MessageListItem | undefined =
        this.state.messageListItems[this.state.messageListItems.length - 1]

      let indexStart =
        last_item === undefined
          ? -1
          : messageListItems.findIndex(item => {
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
