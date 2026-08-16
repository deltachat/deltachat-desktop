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
import { shouldShowOSNotificationForCurrentChat } from '../system-integration/notifications'

const log = getLogger('messagelist')

const PAGE_SIZE = 11

interface MessageListState {
  // chat: Type.FullChat | null
  /**
   * IDs of all the messages of the chat, oldest first.
   *
   * Day markers are not part of this list: they are derived when rendering,
   * it is much cheaper to send plain numbers over JSON-RPC than a list of tagged objects
   */
  messageListIds: number[]
  /**
   * Generally this contains a contiguous slice (no with no holes)
   * of a chat's messages, but we also have `loadMissingMessages`
   * in case it doesn't.
   */
  messageCache: { [msgId: number]: T.MessageLoadResult | undefined }
  /**
   * @see {@linkcode oldestFetchedMessageIndex}
   */
  newestFetchedMessageIndex: -1 | number
  /**
   * Index in {@linkcode messageListIds} of the oldest message
   * that we have fetched (i.e. added to {@linkcode messageCache}).
   *
   * Yes, this value can be calculated from {@linkcode messageCache}
   * and is basically a cached value (or duplicate state if you will).
   *
   * Might be `-1` when still loading {@linkcode messageCache},
   * if the chat is empty, and in some other cases.
   */
  oldestFetchedMessageIndex: -1 | number

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
    messageListIds: [],
    messageCache: {},
    newestFetchedMessageIndex: -1,
    oldestFetchedMessageIndex: -1,
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

          // Otherwise an OS notification will be shown, which is enough.
          if (!shouldShowOSNotificationForCurrentChat()) {
            // Note that the element might already be playing,
            // if we received two or more messages rapidly.
            // In that case it could be nice to play multiple sounds in parallel.
            incomingMessageAudioElement.currentTime = 0
            incomingMessageAudioElement.play()
          }
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
        if (eventChatId === 0) {
          store.effect.refresh()
          return
        }
        if (eventChatId !== chatId) {
          return
        }
        if (msgId === 0) {
          store.effect.refresh()
          return
        }

        store.effect.onEventMessagesChanged(msgId)
      }),
      onDCEvent(
        accountId,
        'ReactionsChanged',
        ({ chatId: eventChatId, msgId }) => {
          if (eventChatId === 0) {
            store.effect.refresh()
            return
          }
          if (eventChatId !== chatId) {
            return
          }
          if (msgId === 0) {
            store.effect.refresh()
            return
          }

          store.effect.onEventMessagesChanged(msgId)
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

  private activeViewCache: {
    items: number[]
    start: number
    end: number
    view: number[]
  } | null = null

  /**
   * Cache {@linkcode MessageListStore.activeView} and return the cached reference
   * if nothing changed, so that it doesn't trigger `React.memo` to rerender.
   */
  get activeView() {
    const items = this.state.messageListIds
    const start = this.state.oldestFetchedMessageIndex
    const end = this.state.newestFetchedMessageIndex

    const cache = this.activeViewCache
    if (
      cache !== null &&
      cache.items === items &&
      cache.start === start &&
      cache.end === end
    ) {
      return cache.view
    }

    const view = getView(items, start, end)
    // this.log.debug('get activeView', { end, start, view })
    this.activeViewCache = { items, start, end, view }
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
      messageListIds: number[],
      messageCache: MessageListState['messageCache'],
      newestFetchedMessageIndex: number,
      oldestFetchedMessageIndex: number
    ) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListIds,
          messageCache,
          viewState: ChatViewReducer.refresh(state.viewState),
          newestFetchedMessageIndex,
          oldestFetchedMessageIndex,
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
      oldestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
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
          newestFetchedMessageIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.appendMessagesBottom(state.viewState),
        }
        return modifiedState
      }, 'appendMessagesBottom')
    },
    fetchedIncomingMessages: (payload: {
      messageListIds: MessageListState['messageListIds']
      newestFetchedMessageIndex: number
      newMessageCacheItems: MessageListState['messageCache']
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListIds: payload.messageListIds,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          newestFetchedMessageIndex: payload.newestFetchedMessageIndex,
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
    messageChanged: (
      message: Type.Message,
      /**
       * Should be true if the change can make the message taller,
       * as it could be the case for incoming image messages
       * (when the download finishes) or for edited messages
       */
      scrollToBottomIfClose: boolean = false
    ) => {
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
          viewState: scrollToBottomIfClose
            ? ChatViewReducer.scrollToBottomIfClose(state.viewState)
            : state.viewState,
        }
        return modifiedState
      }, 'messageChanged')
    },
    setMessageState: (messageId: number, messageState: number) => {
      if (this.state.messageCache[messageId] == undefined) {
        // Normally this can happen when a message state changes
        // for a pretty old message which is not in view.
        // This also happens for "edit request" messages
        // and WebXDC sendUpdate.
        // Those are actual messages, but we don't render them
        //
        // Also this may happen when sending a message to "Saved Messages"
        // on a new Chatmail account, where `MsgDelivered` would fire
        // almost instantly after the send, even before `jumpToMessage`
        // finishes for the new message.
        this.log.info(
          `setMessageState called for message ${messageId}, ` +
            `state ${messageState}, but it's not loaded`
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
    setMessageListIds: (messageListIds: MessageListState['messageListIds']) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListIds,
          viewState: ChatViewReducer.setMessageListIds(state.viewState),
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
          // `this.state.oldestFetchedMessageIndex`.
          //
          // The same applies to the other `this.__jumpToMessage()` below
          return await this.__jumpToMessage(...jumpArgs)
        }

        const firstUnreadMsgIdP = BackendRemote.rpc.getFirstUnreadMessageOfChat(
          this.accountId,
          this.chatId
        )
        const messageListIdsP = BackendRemote.rpc.getMessageIds(
          this.accountId,
          this.chatId,
          false,
          false
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
            messageListIdsP,
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

        let oldestFetchedMessageIndex = -1
        let newestFetchedMessageIndex = -1
        let messageCache: MessageListState['messageCache'] = {}
        const messageListIds = await messageListIdsP
        if (messageListIds.length !== 0) {
          // mesageIds.length = 1767
          // oldestFetchedMessageIndex = 1767 - 1 = 1766 - 10 = 1756
          // newestFetchedMessageIndex =                        1766
          oldestFetchedMessageIndex = Math.max(
            messageListIds.length - 1 - PAGE_SIZE,
            0
          )
          newestFetchedMessageIndex = messageListIds.length - 1

          messageCache =
            (await loadMessages(
              this.accountId,
              messageListIds,
              oldestFetchedMessageIndex,
              newestFetchedMessageIndex,
              {} // pass empty cache instead of `this.state.messageCache`
            ).catch(err => this.log.error('loadMessages failed', err))) || {}
        }

        this.log.debug('loadChat took', performance.now() - startTime)

        this.reducer.selectedChat({
          messageCache,
          messageListIds,
          oldestFetchedMessageIndex,
          newestFetchedMessageIndex,
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
          for (const msgId of this.activeView) {
            if (!messageCache[msgId]) {
              missing_message_ids.push(msgId)
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
          const oldestFetchedMessageIndex = Math.max(
            state.oldestFetchedMessageIndex - PAGE_SIZE,
            0
          )
          const lastMessageIndex = state.oldestFetchedMessageIndex
          if (lastMessageIndex === 0) {
            this.log.debug(
              'FETCH_MORE_MESSAGES: lastMessageIndex is zero, returning'
            )
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }
          const fetchedMessageIds = state.messageListIds.slice(
            oldestFetchedMessageIndex,
            lastMessageIndex
          )
          if (fetchedMessageIds.length === 0) {
            this.log.debug(
              'fetchMoreMessagesTop: fetchedMessageIds.length is zero, returning'
            )
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListIds,
              oldestFetchedMessageIndex,
              lastMessageIndex - 1,
              this.state.messageCache
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagesTop({
            id,
            newMessageCacheItems,
            oldestFetchedMessageIndex,
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

          const newestFetchedMessageIndex = state.newestFetchedMessageIndex + 1
          const newNewestFetchedMessageIndex = Math.min(
            newestFetchedMessageIndex + PAGE_SIZE,
            state.messageListIds.length - 1
          )
          if (newestFetchedMessageIndex === state.messageListIds.length) {
            //log.debug('fetchMoreMessagesBottom: no more messages, returning')
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }
          this.log.debug(`fetchMoreMessagesBottom`)

          const fetchedMessageIds = state.messageListIds.slice(
            newestFetchedMessageIndex,
            newNewestFetchedMessageIndex + 1
          )
          if (fetchedMessageIds.length === 0) {
            this.log.debug(
              'fetchMoreMessagesBottom: fetchedMessageIds.length is zero, returning',
              JSON.stringify({
                newestFetchedMessageIndex: newestFetchedMessageIndex,
                newNewestFetchedMessageIndex: newNewestFetchedMessageIndex,
                messageIds: state.messageListIds,
              })
            )
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }

          const newMessageCacheItems =
            (await loadMessages(
              this.accountId,
              state.messageListIds,
              newestFetchedMessageIndex,
              newNewestFetchedMessageIndex,
              this.state.messageCache
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.appendMessagesBottom({
            newMessageCacheItems,
            newestFetchedMessageIndex: newNewestFetchedMessageIndex,
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
          const messageListIds = await BackendRemote.rpc.getMessageIds(
            this.accountId,
            this.chatId,
            false,
            false
          )
          let { newestFetchedMessageIndex, oldestFetchedMessageIndex } = state
          newestFetchedMessageIndex = Math.min(
            newestFetchedMessageIndex,
            messageListIds.length - 1
          )
          oldestFetchedMessageIndex = Math.max(oldestFetchedMessageIndex, 0)

          const messageCache =
            (await loadMessages(
              this.accountId,
              messageListIds,
              oldestFetchedMessageIndex,
              newestFetchedMessageIndex,
              {} // pass empty cache instead of `this.state.messageCache`
            ).catch(err => this.log.error('loadMessages failed', err))) || {}

          this.reducer.refresh(
            messageListIds,
            messageCache,
            newestFetchedMessageIndex,
            oldestFetchedMessageIndex
          )
          return true
        },
        'refresh'
      ),
      'refresh'
    ),
    onEventIncomingMessage: this.scheduler.queuedEffect(async () => {
      const messageListIds = await BackendRemote.rpc.getMessageIds(
        this.accountId,
        this.chatId,
        false,
        false
      )
      await this.__appendNewMessages(messageListIds)
    }, 'onEventIncomingMessage'),
    onEventMessagesChanged: this.scheduler.queuedEffect(
      async (messageId: number) => {
        if (
          messageId > C.DC_MSG_ID_LAST_SPECIAL &&
          this.state.messageListIds.includes(messageId)
        ) {
          this.log.debug(
            'DC_EVENT_MSGS_CHANGED',
            'changed message seems to be a message we already know'
          )
          try {
            const message = await BackendRemote.rpc.getMessage(
              this.accountId,
              messageId
            )
            const oldMessage = this.state.messageCache[messageId]
            // When the download of a partially-downloaded message finishes,
            // it can become much taller (when the image is rendered)
            const downloadFinished =
              oldMessage?.kind === 'message' &&
              oldMessage.downloadState !== 'Done' &&
              message.downloadState === 'Done'
            // Same for a message that just got edited (e.g. from another
            // device): it can become taller.
            // https://github.com/deltachat/deltachat-desktop/issues/4698
            const edited =
              oldMessage?.kind === 'message' &&
              message.isEdited &&
              oldMessage.text !== message.text
            // Scroll down if message height might have changed
            // (only if we're close to the bottom)
            const messageHeightMightHaveChanged = downloadFinished || edited
            this.reducer.messageChanged(message, messageHeightMightHaveChanged)
          } catch (error) {
            this.log.warn('failed to fetch message with id', messageId, error)
            // ignore not found and other errors
            return
          }
        } else {
          // The draft message does not affect the return value of
          // `getMessageIds()`.
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
          const messageListIds = await BackendRemote.rpc.getMessageIds(
            this.accountId,
            this.chatId,
            false,
            false
          )

          // Some "new" messages don't trigger `IncomingMsg` but only
          // `MsgsChanged` — e.g. info messages from the current user's actions
          // (changing the group name, disappearing messages etc.) or
          // IncomingCall messages. Treat them the same as incoming messages so
          // the list scrolls to bottom when the user is already there.
          await this.__appendNewMessages(messageListIds)
        }
      },
      'onEventMessagesChanged'
    ),
  }

  /**
   * Appends new messages to the store and updates the scroll position
   * if needed.
   *
   * @param messageListIds
   * @returns
   */
  private async __appendNewMessages(messageListIds: number[]) {
    const last_item: number | undefined =
      this.state.messageListIds[this.state.messageListIds.length - 1]

    let indexStart =
      last_item === undefined ? -1 : messageListIds.indexOf(last_item)

    // check if there is an intersection
    if (indexStart !== -1 && messageListIds[indexStart + 1]) {
      indexStart = indexStart + 1
    }

    // if index start is not the end, set the end to the last item
    const indexEnd =
      indexStart !== messageListIds.length - 1
        ? messageListIds.length - 1
        : indexStart

    // Only append if we can do so without leaving a hole
    if (
      this.state.newestFetchedMessageIndex !== -1 &&
      indexStart !== this.state.newestFetchedMessageIndex + 1
    ) {
      this.log.debug(
        `__appendNewMessages: new messages cannot be added to state without having a hole (indexStart: ${indexStart}, newestFetchedMessageIndex ${this.state.newestFetchedMessageIndex}), falling back to setMessageListIds`
      )
      this.reducer.setMessageListIds(messageListIds)
      return
    }

    const newMessageCacheItems =
      (await loadMessages(
        this.accountId,
        messageListIds,
        indexStart,
        indexEnd,
        this.state.messageCache
      ).catch(err => this.log.error('loadMessages failed', err))) || {}

    this.reducer.fetchedIncomingMessages({
      messageListIds,
      newMessageCacheItems,
      newestFetchedMessageIndex: indexEnd,
    })
  }

  /**
   * Loads and shows the message in the messages list.
   * It can handle initializing MessageListStore
   * (loading `messageListIds` and `messageCache`, etc),
   * loading the message if it is missing
   * from `this.state.messageCache`,
   * reloading `messageListIds` if the message is missing from there,
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
   * @param messageListIdsP an already started `getMessageIds()`
   * request for `MessageListStore.chatId`, to be awaited instead of
   * starting another one. In big chats that request is expensive
   * (hundreds of milliseconds and megabytes of JSON),
   * so it must not be issued twice for the same chat.
   */
  private async __jumpToMessage({
    msgId: jumpToMessageId,
    highlight = true,
    focus,
    addMessageIdToStack,
    scrollIntoViewArg,
    messageListIdsP,
  }: {
    msgId: number | undefined
    highlight?: boolean
    focus: boolean
    addMessageIdToStack?: undefined | number
    scrollIntoViewArg?: Parameters<HTMLElement['scrollIntoView']>[0]
    messageListIdsP?: Promise<number[]>
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
        // `this.state.messageListIds`, it's guaranteed to belong
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

    let messageListIds = this.state.messageListIds
    const findMessageIndex = (): number | undefined => {
      if (jumpToMessageId == undefined) {
        return messageListIds.length > 0 ? messageListIds.length - 1 : undefined
        // Maybe it would make sense to also set `jumpToMessageId` here.
      }

      const ind = messageListIds.indexOf(jumpToMessageId)
      return ind === -1 ? undefined : ind
    }

    let jumpToMessageIndex = findMessageIndex()
    const currentMessageListContainsTheMessage = jumpToMessageIndex != undefined
    // Even if the message is in the current chat, it could still
    // be missing from `this.state.messageListIds` in these cases:
    // - `this.state.messageListIds` is still unloaded,
    //   e.g. when `loadChat` interrupts itself and calls `jumpToMessage`.
    // - `this.state.messageListIds` is loaded, but there are actually
    //   no messages in the chat.
    //   FYI in this case we perhaps don't have to `getMessageIds()`,
    //   but whatever.
    // - A new message has just been sent to the chat and we want to jump
    //   to it.
    if (!isMessageInCurrentChat || !currentMessageListContainsTheMessage) {
      messageListIds =
        // `messageListIdsP` was started for `this.chatId`,
        // so it is only usable when we're not jumping to another chat.
        messageListIdsP != undefined && isMessageInCurrentChat
          ? await messageListIdsP
          : await BackendRemote.rpc.getMessageIds(
              accountId,
              chatId,
              false,
              false
            )
      jumpToMessageIndex = findMessageIndex()
      // Yes, `jumpToMessageIndex` could stil be `undefined` here,
      // but only if the chat actually contains no messages
      // (or if something went horribly wrong).
    }

    // calculate page indexes, so that jumpToMessageId is in the middle of the page
    let oldestFetchedMessageIndex: number
    let newestFetchedMessageIndex: number
    let newMessageCache: MessageListState['messageCache']
    let newViewState: ChatViewState
    if (messageListIds.length === 0) {
      if (jumpToMessageId != undefined) {
        this.log.error(
          `Tried to jumpToMessage ${jumpToMessageId}, but messageListIds ` +
            `is empty. Anyways, proceeding.`
        )
      }

      oldestFetchedMessageIndex = -1
      newestFetchedMessageIndex = -1
      newMessageCache = {}
      // Same as in `loadChat()`
      newViewState = ChatViewReducer.selectChat(this.state.viewState)
    } else {
      if (jumpToMessageIndex == undefined) {
        // To be fair, it's expected that we could jump to a message
        // that is now deleted, e.g. if it got deleted just recently
        // and not all state has updated, but this is super rare.
        this.log.error(
          `messageListIds is not empty, but jumpToMessageIndex ` +
            `is still undefined? Does msgId ${jumpToMessageId} ` +
            `even belong to chat ${chatId}? Or did the message get deleted?\n` +
            `Anyways, falling back to jumping to the last message.`
        )
        window.__userFeedback({
          type: 'error',
          text: `${window.static_translate('error')}: message not found`,
        })
        jumpToMessageIndex = messageListIds.length - 1
      }

      const half_page_size = Math.ceil(PAGE_SIZE / 2)

      oldestFetchedMessageIndex = Math.max(
        jumpToMessageIndex - half_page_size,
        0
      )
      newestFetchedMessageIndex = Math.min(
        jumpToMessageIndex + half_page_size,
        messageListIds.length - 1
      )

      const countMessagesOnNewerSide =
        newestFetchedMessageIndex - jumpToMessageIndex
      const countMessagesOnOlderSide =
        jumpToMessageIndex - oldestFetchedMessageIndex
      if (countMessagesOnNewerSide < half_page_size) {
        oldestFetchedMessageIndex = Math.max(
          oldestFetchedMessageIndex -
            (half_page_size - countMessagesOnNewerSide),
          0
        )
      } else if (countMessagesOnOlderSide < half_page_size) {
        newestFetchedMessageIndex = Math.min(
          newestFetchedMessageIndex +
            (half_page_size - countMessagesOnOlderSide),
          messageListIds.length - 1
        )
      }

      const messagesAlreadyLoaded = getView(
        messageListIds,
        oldestFetchedMessageIndex,
        newestFetchedMessageIndex
      ).every(msgId => this.state.messageCache[msgId] != undefined)

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
        // keeping `this.state.oldestFetchedMessageIndex`
        // and `this.state.newestFetchedMessageIndex` as they are?
        // Because some other code might update the state in such a way
        // that `messageCache` and these
        // `(oldest|newest)FetchedMessageIndex` are out of sync:
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
        // `oldestFetchedMessageIndex` and
        // `newestFetchedMessageIndex` (see `activeView`).
        //
        // TODO it would be ideal to get ensure that we don't corrupt
        // the state in the first place, but let's make
        // this workaround for now.
        oldestFetchedMessageIndex = Math.min(
          this.state.oldestFetchedMessageIndex,
          oldestFetchedMessageIndex
        )
        newestFetchedMessageIndex = Math.max(
          this.state.newestFetchedMessageIndex,
          newestFetchedMessageIndex
        )
      } else {
        newMessageCache =
          (await loadMessages(
            accountId,
            messageListIds,
            oldestFetchedMessageIndex,
            newestFetchedMessageIndex,
            this.state.messageCache
          ).catch(err => this.log.error('loadMessages failed', err))) || {}
      }

      if (jumpToMessageId == undefined) {
        jumpToMessageId = messageListIds[jumpToMessageIndex]
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
      messageListIds,
      oldestFetchedMessageIndex,
      newestFetchedMessageIndex,
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

/**
 * The return value will only contain messages between
 * {@linkcode oldestFetchedMessageIndex} and
 * {@linkcode newestFetchedMessageIndex} in {@linkcode messageListIds},
 * plus the one message right before that range (its timestamp is needed
 * to decide whether the oldest message of the range starts a new day),
 * even if {@linkcode existingMessages}
 * contained some messages outside of the range.
 * (See {@linkcode MessageListState} docs for reasoning).
 */
async function loadMessages(
  accountId: number,
  messageListIds: number[],
  oldestFetchedMessageIndex: number,
  newestFetchedMessageIndex: number,
  existingMessages: MessageListState['messageCache']
) {
  const view = getView(
    messageListIds,
    // One message older than the requested range: `MessageList` needs its
    // timestamp to tell whether the oldest message of the range starts a new
    // day
    Math.max(oldestFetchedMessageIndex - 1, 0),
    newestFetchedMessageIndex
  )

  const missingIds = view.filter(msgId => {
    const m = existingMessages[msgId]
    const exists =
      m != undefined &&
      // Usually if a message failed to load then it's permanent (e.g. deleted),
      // but let's reload it for good measure.
      m.kind !== 'loadingError'

    if (exists) {
      m satisfies T.Message &
        T.MessageLoadResult & {
          kind: 'message'
        }
    }

    return !exists
  })

  if (missingIds.length > 100) {
    log.error(
      `loadMessages is loading too many (${missingIds.length}) messages. ` +
        'This is bad for performance.'
    )
  }

  const missing =
    missingIds.length > 0
      ? await BackendRemote.rpc.getMessages(accountId, missingIds)
      : {}

  const ret: typeof existingMessages = {}
  for (const id of view) {
    ret[id] = missing[id] ?? existingMessages[id]
  }
  return ret
}
