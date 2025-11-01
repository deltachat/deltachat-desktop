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
import { getLogger } from '@deltachat-desktop/shared/logger'
import { useSettingsStore } from './settings'

const log = getLogger('messagelist')

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

/*
 * A hook to read a portion of messages(a view) for a given chat. It creates a store(MessageListStore)
 * for the given chat and account and loads messages on it. It always has a maximum specified number
 * of messages as per PAGE_SIZE constant.
 */
export function useMessageList(
  accountId: number,
  chatId: number
): {
  state: MessageListState
  store: MessageListStore
  fetchMoreBottom: () => void
  fetchMoreTop: () => void
} {
  const store = useMemo(() => {
    const store = new MessageListStore(accountId, chatId)
    store.effect.loadChat()
    return store
  }, [accountId, chatId])

  // PERF: It's a shame that we have to re-render on settings changes
  // even though we only depend on `volume`,
  // but let's hope the React compiler will take care of this
  // when it's released.
  const settingsStore = useSettingsStore()[0]

  const incomingMessageAudioElement = useMemo(() => {
    const el = document.createElement('audio')
    el.src = './audio/sound_in.wav'
    return el
  }, [])
  const volume = settingsStore?.desktopSettings.inChatSoundsVolume
  if (volume != null) {
    // Note that `volume` could be 0.
    // eslint-disable-next-line react-hooks/immutability
    incomingMessageAudioElement.volume = volume
  }

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

          // Note that the element might already be playing,
          // if we received two or more messages rapidly.
          // In that case it could be nice to play multiple sounds in parallel.
          incomingMessageAudioElement.currentTime = 0
          incomingMessageAudioElement.play()
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
  }, [accountId, chatId, incomingMessageAudioElement, store])

  const [state, setState] = useState(store.getState())

  useEffect(() => {
    setState(store.getState())
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

/*
 * Simply returns a subarray of items, from start to end
 */
function getView<T>(items: T[], start: number, end: number): T[] {
  return items.slice(start, end + 1)
}

export class MessageListStore extends Store<MessageListState> {
  scheduler = new ChatStoreScheduler()

  constructor(
    private readonly accountId: number,
    private readonly chatId: number
  ) {
    super(defaultState(), 'MessageListStore')
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
      if (this.state.messageCache[messageId] == undefined) {
        // This may happen when sending a message to "Saved Messages"
        // on a new Chatmail account, where `MsgDelivered` would fire
        // almost instantly after the send, even before `jumpToMessage`
        // finishes for the new message.
        // This results in jumpToMessage thinking that the message
        // is already loaded, but in fact it would be just a husk
        // of a Message object, with only the `state` property present.
        //
        // TODO should we handle it differently? Should we
        // schedule a full message list re-fetch, or would it always
        // be loaded later by other event listeners?
        //
        // TODO refactor: this warning triggers for "edit request" messages.
        // Those are actual messages, but we don't render them
        this.log.warn(
          `setMessageState called for message ${messageId}, ` +
            `state ${messageState}, but it's not loaded. ` +
            "Ignoring, in hopes that we'll automatically load it later."
        )
        return
      }

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
    /**
     * This must be called prior to any other `effect`s,
     * because other `effect`s don't work well if the state is not properly
     * initialized.
     */
    loadChat: this.scheduler.lockedQueuedEffect(
      'scroll',
      async () => {
        const startTime = performance.now()

        // FYI there is similar code in `MessageList.tsx`.
        if (
          window.__internal_jump_to_message_asap?.accountId ===
            this.accountId &&
          window.__internal_jump_to_message_asap.chatId === this.chatId
        ) {
          const jumpArgs =
            window.__internal_jump_to_message_asap.jumpToMessageArgs
          window.__internal_jump_to_message_asap = undefined
          // Instead of calling `this.effect.jumpToMessage()`,
          // we need to call the bare version and await it
          // prior to returning from this function,
          // such that no other queued effect (e.g. `fetchMoreMessagesTop`)
          // gets executed before we're done with `loadChat`.
          //
          // Bacause those other effects rely on the state being
          // initialized, namely on
          // `this.state.oldestFetchedMessageListItemIndex`.
          //
          // The same applies to the other `this.__jumpToMessage()` below
          return await this.__jumpToMessage(...jumpArgs)
        }

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

        const firstUnreadMsgId = await firstUnreadMsgIdP
        if (firstUnreadMsgId !== null) {
          // See the comments about `this.__jumpToMessage()` above.
          const jumpToMessageP = this.__jumpToMessage({
            msgId: firstUnreadMsgId,
            // Until we have an "unread messages" separator,
            // like, say, in Telegram,
            // let's just highlight the first unread.
            highlight: true,
            focus: false,
            // 'center' so that old messages are also shown, for context.
            // See https://github.com/deltachat/deltachat-desktop/issues/4284
            scrollIntoViewArg: { block: 'center' },
          })

          // TODO why do we only do this when `firstUnreadMsgId !== null`?
          // This piece of code is here since
          // fe035bd2c124d4bdbdd2039850047c5628638262
          // (https://github.com/deltachat/deltachat-desktop/pull/2750)
          BackendRemote.rpc
            .getBasicChatInfo(this.accountId, this.chatId)
            .then(chat => {
              ActionEmitter.emitAction(
                chat.archived
                  ? KeybindAction.ChatList_SwitchToArchiveView
                  : KeybindAction.ChatList_SwitchToNormalView
              )
            })

          return await jumpToMessageP
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

        this.log.debug('loadChat took', performance.now() - startTime)

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
     * @see {@link MessageListStore.__jumpToMessage} for docs.
     */
    jumpToMessage: this.scheduler.lockedQueuedEffect(
      'scroll',
      this.__jumpToMessage.bind(this),
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
          messageId > C.DC_MSG_ID_LAST_SPECIAL &&
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
          // The draft message does not affect the return value of
          // `getMessageListItems()`.
          // The main purpose of this check is not just reduced resource usage,
          // but to fix the messages list "scrolling up"
          // when you quote a message. See
          // https://github.com/deltachat/deltachat-desktop/issues/3763#issuecomment-2602630507
          //
          // A more correct solution would perhaps be to reduce the delay
          // between `getLastKnownScrollPosition()` and the actual scroll,
          // perhaps by moving `getLastKnownScrollPosition()`
          // to the render function of `MessageList`.
          if (
            messageId > C.DC_MSG_ID_LAST_SPECIAL &&
            (await BackendRemote.rpc.getMessage(this.accountId, messageId))
              .state === C.DC_STATE_OUT_DRAFT
          ) {
            return
          }

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

  /**
   * Loads and shows the message in the messages list.
   * It can handle initializing MessageListStore
   * (loading `messageListItems` and `messageCache`, etc),
   * loading the message if it is missing
   * from `this.state.messageCache`,
   * reloading `messageListItems` if the message is missing from there,
   * and showing the message in a chat other than `this.chatId`.
   * The latter (showing the message from a different chat), however,
   * should not be used, because, as of 2025-01-19, we re-create
   * `MessageListStore` when `chatId` or `accountId` changes.
   *
   * Currently this function (wrapped in `effect`),
   * as well as the MessageListStore itself
   * is only directly used by the MessageList component.
   * To jump to a message without having a reference to the
   * `MessageListStore`, and with an option to jump to message
   * from a different chat, use `const { jumpToMessage } = useMessage()`,
   * (it will internally casue this function to be invoked).
   *
   * @param msgId - when `undefined`, pop the jump stack, or,
   * if the stack is empty, jump to last message of the `this.chatId` chat
   * if there _is_ a last message.
   * @param addMessageIdToStack the ID of the message to remember,
   * to later go back to it, using the "jump down" button.
   * The message with the specified ID must belong to the chat with ID
   * `MessageListStore.chatId`.
   * For example, this must be ensured for message quotes,
   * because they might belong to a different chat due to the
   * "Reply Privately" feature.
   */
  private async __jumpToMessage({
    msgId: jumpToMessageId,
    highlight = true,
    focus,
    addMessageIdToStack,
    scrollIntoViewArg,
  }: {
    msgId: number | undefined
    highlight?: boolean
    focus: boolean
    addMessageIdToStack?: undefined | number
    scrollIntoViewArg?: Parameters<HTMLElement['scrollIntoView']>[0]
  }) {
    const startTime = performance.now()

    this.log.debug('jumpToMessage with messageId: ', jumpToMessageId)
    const accountId = selectedAccountId()

    if (!accountId) {
      throw new Error('no account set')
    }

    // As was said in this function's docstring,
    // it should not be called for messages that are in a different chat,
    // so we know the chatId in advance.
    // However, let's keep the code that supports arbitrary chatId,
    // which can be "enabled" by setting `chatIdPreset = undefined`.
    const chatIdPreset: number | undefined = this.chatId
    let chatId: number | undefined = undefined

    let jumpToMessageStack: number[] = []
    if (jumpToMessageId === undefined) {
      // jump down
      const jumpToMessageStackLength = this.state.jumpToMessageStack.length
      if (jumpToMessageStackLength !== 0) {
        jumpToMessageStack = this.state.jumpToMessageStack.slice(
          0,
          jumpToMessageStackLength - 1
        )
        jumpToMessageId =
          this.state.jumpToMessageStack[jumpToMessageStackLength - 1]
        chatId =
          chatIdPreset ??
          (await BackendRemote.rpc.getMessage(accountId, jumpToMessageId))
            .chatId
      } else {
        // Since `jumpToMessageId` is coming from
        // `this.state.messageListItems`, it's guaranteed to belong
        // to the current chat. No need to
        // `(await rpc.getMessage(accountId, jumpToMessageId)).chatId`
        chatId = chatIdPreset ?? this.chatId
        jumpToMessageStack = []
        highlight = false
        // We will determine `jumpToMessageId` below
      }
    } else {
      const fromCache = this.state.messageCache[jumpToMessageId]
      chatId =
        chatIdPreset ??
        (fromCache?.kind === 'message'
          ? fromCache
          : await BackendRemote.rpc.getMessage(accountId, jumpToMessageId)
        ).chatId

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

    const isMessageInCurrentChat =
      this.accountId === accountId && this.chatId === chatId
    if (!isMessageInCurrentChat) {
      this.log.error(
        'Tried to show messages from a different chat.\n' +
          `this.accountId === ${this.accountId}, ` +
          `this.chatId === ${this.chatId}, ` +
          `target IDs: ${accountId}, ${chatId}. ` +
          `jumpToMessageId === ${jumpToMessageId}`
      )
    }

    let messageListItems = this.state.messageListItems
    const findMessageIndex = (): number | undefined => {
      if (jumpToMessageId == undefined) {
        return messageListItems.length > 0
          ? // The last `messageListItems` item is guaranteed to be _not_
            // a daymarker, so we can safely return it without checking
            // `m.kind === 'message'`.
            messageListItems.length - 1
          : undefined
        // Maybe it would make sense to also set `jumpToMessageId` here.
      }

      const ind = messageListItems.findIndex(
        m => m.kind === 'message' && m.msg_id === jumpToMessageId
      )
      return ind === -1 ? undefined : ind
    }

    let jumpToMessageIndex = findMessageIndex()
    const currentMessageListContainsTheMessage = jumpToMessageIndex != undefined
    // Even if the message is in the current chat, it could still
    // be missing from `this.state.messageListItems` in these cases:
    // - `this.state.messageListItems` is still unloaded,
    //   e.g. when `loadChat` interrupts itself and calls `jumpToMessage`.
    // - `this.state.messageListItems` is loaded, but there are actually
    //   no messages in the chat.
    //   FYI in this case we perhaps don't have to `getMessageListItems()`,
    //   but whatever.
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
      // Yes, `jumpToMessageIndex` could stil be `undefined` here,
      // but only if the chat actually contains no messages
      // (or if something went horribly wrong).
    }

    // calculate page indexes, so that jumpToMessageId is in the middle of the page
    let oldestFetchedMessageListItemIndex: number
    let newestFetchedMessageListItemIndex: number
    let newMessageCache: MessageListState['messageCache']
    let newViewState: ChatViewState
    if (messageListItems.length === 0) {
      if (jumpToMessageId != undefined) {
        this.log.error(
          `Tried to jumpToMessage ${jumpToMessageId}, but messageListItems ` +
            `is empty. Anyways, proceeding.`
        )
      }

      oldestFetchedMessageListItemIndex = -1
      newestFetchedMessageListItemIndex = -1
      newMessageCache = {}
      // Same as in `loadChat()`
      newViewState = ChatViewReducer.selectChat(this.state.viewState)
    } else {
      if (jumpToMessageIndex == undefined) {
        // To be fair, it's expected that we could jump to a message
        // that is now deleted, e.g. if it got deleted just recently
        // and not all state has updated, but this is super rare.
        this.log.error(
          `messageListItems is not empty, but jumpToMessageIndex ` +
            `is still undefined? Does msgId ${jumpToMessageId} ` +
            `even belong to chat ${chatId}? Or did the message get deleted?\n` +
            `Anyways, falling back to jumping to the last message.`
        )
        window.__userFeedback({
          type: 'error',
          text: `${window.static_translate('error')}: message not found`,
        })
        jumpToMessageIndex = messageListItems.length - 1
      }

      const half_page_size = Math.ceil(PAGE_SIZE / 2)

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
        if (item.kind === 'dayMarker') {
          return true
        }
        // Just for type-safety.
        const _kind: 'message' = item.kind

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

      if (jumpToMessageId == undefined) {
        const item = messageListItems[jumpToMessageIndex]
        if (item.kind !== 'message') {
          // This should never happen, but let's write it to make
          // TypeScript happy, and juuuuuust in case.
          // Maybe we could refactor things, so that types guarantee this.
          this.log.error(
            'messageListItems[jumpToMessageIndex] is not of type "message"??',
            item,
            messageListItems,
            jumpToMessageIndex
          )
          throw new Error()
        }
        jumpToMessageId = item.msg_id
      }
      newViewState = ChatViewReducer.jumpToMessage(
        this.state.viewState,
        jumpToMessageId,
        highlight,
        focus,
        scrollIntoViewArg
      )
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
      newestFetchedMessageListItemIndex,
      viewState: newViewState,
      jumpToMessageStack,
    })
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

  if (view.length > 100) {
    log.error(
      `loadMessages is loading too many (${view.length}) messages. ` +
        'This is bad for performance.'
    )
  }

  return await BackendRemote.rpc.getMessages(accountId, view)
}
