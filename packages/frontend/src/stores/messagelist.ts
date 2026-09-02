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
import { useDesktopSettingsStore } from './settings'
import { shouldShowOSNotificationForCurrentChat } from '../system-integration/notifications'

const log = getLogger('messagelist')

/**
 * How many messages are loaded in addition to the anchor message of a
 * window, i.e. how many more messages one `fetchMoreMessagesTop` /
 * `fetchMoreMessagesBottom` loads.
 */
const PAGE_SIZE = 11

interface MessageListState {
  // chat: Type.FullChat | null
  /**
   * IDs of the messages of the loaded window of the chat, oldest first.
   *
   * This is a contiguous part of the chat, not the whole chat:
   * {@linkcode MessageListState.hasOlder} and
   * {@linkcode MessageListState.hasNewer} tell whether the chat continues
   * beyond it. Day markers are not part of this list, they are derived when
   * rendering from {@linkcode MessageListState.loadedTimestamps}.
   */
  loadedMessageIds: number[]
  /**
   * The `timestamp` of each message in {@linkcode loadedMessageIds},
   * as returned together with the ids.
   *
   * This is the value the message list is ordered by, and not the same as
   * `Message.sortTimestamp`, which falls back to the sent time for messages
   * with `timestamp === 0` (info messages at the start of a chat).
   * Day markers are derived from these, so they can be rendered before the
   * messages themselves are loaded.
   */
  loadedTimestamps: { [msgId: number]: number }
  /**
   * The `timestamp` of the message right before {@linkcode loadedMessageIds},
   * if there is one. It decides whether the topmost loaded message starts
   * a new day. That message is neither loaded nor rendered.
   */
  prevTimestamp: number | undefined
  /**
   * Generally this contains a contiguous slice (no with no holes)
   * of a chat's messages, but we also have `loadMissingMessages`
   * in case it doesn't.
   */
  messageCache: { [msgId: number]: T.MessageLoadResult | undefined }
  /** Whether the chat has messages older than {@linkcode loadedMessageIds}. */
  hasOlder: boolean
  /** Whether the chat has messages newer than {@linkcode loadedMessageIds}. */
  hasNewer: boolean

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
    loadedMessageIds: [],
    loadedTimestamps: {},
    prevTimestamp: undefined,
    messageCache: {},
    hasOlder: false,
    hasNewer: false,
    viewState: defaultChatViewState(),
    jumpToMessageStack: [],
    loaded: false,
  }) as MessageListState

/**
 * The part of {@linkcode MessageListState} that one message window
 * response describes.
 */
type LoadedWindow = Pick<
  MessageListState,
  | 'loadedMessageIds'
  | 'loadedTimestamps'
  | 'prevTimestamp'
  | 'hasOlder'
  | 'hasNewer'
>

/**
 * Requests a window of the chat's messages from the core.
 *
 * @param anchorMsgId the message the window is centered on, or `null` for
 * the newest messages of the chat. The anchor message is part of the window;
 * `before` and `after` count the messages loaded in addition to it.
 * @throws if the anchor message is not (or no longer) a message of the chat.
 */
async function fetchMessageWindow(
  accountId: number,
  chatId: number,
  anchorMsgId: number | null,
  before: number,
  after: number
): Promise<LoadedWindow> {
  const messageWindow = await BackendRemote.rpc.getMessageWindow(
    accountId,
    chatId,
    anchorMsgId,
    before,
    after
  )

  const loadedMessageIds: number[] = []
  const loadedTimestamps: MessageListState['loadedTimestamps'] = {}
  for (const item of messageWindow.items) {
    loadedMessageIds.push(item.msgId)
    loadedTimestamps[item.msgId] = item.timestamp
  }

  return {
    loadedMessageIds,
    loadedTimestamps,
    prevTimestamp: messageWindow.prevTimestamp ?? undefined,
    hasOlder: messageWindow.hasOlder,
    hasNewer: messageWindow.hasNewer,
  }
}

/** The window part of a store state, without the rest of it. */
function loadedWindowOf(state: MessageListState): LoadedWindow {
  const {
    loadedMessageIds,
    loadedTimestamps,
    prevTimestamp,
    hasOlder,
    hasNewer,
  } = state
  return {
    loadedMessageIds,
    loadedTimestamps,
    prevTimestamp,
    hasOlder,
    hasNewer,
  }
}

/*
 * A hook to read a window of messages for a given chat. It creates a
 * store (MessageListStore) for the given chat and account and loads a window
 * of messages on it, `PAGE_SIZE` more of them per `fetchMoreTop` /
 * `fetchMoreBottom`. The rest of the chat is never loaded, so the cost of
 * opening a chat does not depend on how many messages it has.
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
  const desktopSettingsStore = useDesktopSettingsStore()[0]

  const incomingMessageAudioElement = useMemo(() => {
    const el = document.createElement('audio')
    el.src = './audio/sound_in.wav'
    return el
  }, [])
  const volume = desktopSettingsStore?.inChatSoundsVolume
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

export class MessageListStore extends Store<MessageListState> {
  scheduler = new ChatStoreScheduler()

  constructor(
    private readonly accountId: number,
    private readonly chatId: number
  ) {
    super(defaultState(), 'MessageListStore')
  }

  /**
   * Loads the messages of `msgIds` that are missing from `existingMessages`.
   * Returns the cache entries for `msgIds`, or an empty cache on failure.
   */
  private async loadMessageBodies(
    msgIds: number[],
    existingMessages: MessageListState['messageCache'],
    accountId: number = this.accountId
  ): Promise<MessageListState['messageCache']> {
    return (
      (await loadMessages(accountId, msgIds, existingMessages).catch(err =>
        this.log.error('loadMessages failed', err)
      )) || {}
    )
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
    /**
     * Replaces the loaded window, e.g. when it has to be re-anchored
     * after a change to the chat.
     */
    setWindow: (
      messageWindow: LoadedWindow,
      messageCache: MessageListState['messageCache'],
      viewState: ChatViewState
    ) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          ...messageWindow,
          messageCache,
          viewState,
          loaded: true,
        }
        return modifiedState
      }, 'setWindow')
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
      olderMessageIds: number[]
      olderTimestamps: MessageListState['loadedTimestamps']
      prevTimestamp: number | undefined
      hasOlder: boolean
      newMessageCacheItems: MessageListState['messageCache']
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          loadedMessageIds: [
            ...payload.olderMessageIds,
            ...state.loadedMessageIds,
          ],
          loadedTimestamps: {
            ...state.loadedTimestamps,
            ...payload.olderTimestamps,
          },
          prevTimestamp: payload.prevTimestamp,
          hasOlder: payload.hasOlder,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          viewState: ChatViewReducer.appendMessagesTop(state.viewState),
        }
        return modifiedState
      }, 'appendMessagesTop')
    },
    appendMessagesBottom: (payload: {
      newerMessageIds: number[]
      newerTimestamps: MessageListState['loadedTimestamps']
      hasNewer: boolean
      newMessageCacheItems: MessageListState['messageCache']
      /**
       * Whether the messages are new to the chat (as opposed to older
       * messages that the user scrolled to), which scrolls the list down
       * if it is already close to the bottom.
       */
      areIncoming?: boolean
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          loadedMessageIds: [
            ...state.loadedMessageIds,
            ...payload.newerMessageIds,
          ],
          loadedTimestamps: {
            ...state.loadedTimestamps,
            ...payload.newerTimestamps,
          },
          hasNewer: payload.hasNewer,
          messageCache: {
            ...state.messageCache,
            ...payload.newMessageCacheItems,
          },
          viewState: payload.areIncoming
            ? ChatViewReducer.fetchedIncomingMessages(state.viewState)
            : ChatViewReducer.appendMessagesBottom(state.viewState),
        }
        return modifiedState
      }, 'appendMessagesBottom')
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
          // `this.state.loadedMessageIds`.
          //
          // The same applies to the other `this.__jumpToMessage()` below
          return await this.__jumpToMessage(...jumpArgs)
        }

        const firstUnreadMsgId =
          await BackendRemote.rpc.getFirstUnreadMessageOfChat(
            this.accountId,
            this.chatId
          )
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

        // The newest messages of the chat.
        const messageWindow = await fetchMessageWindow(
          this.accountId,
          this.chatId,
          null,
          PAGE_SIZE,
          0
        )
        const messageCache = await this.loadMessageBodies(
          messageWindow.loadedMessageIds,
          {} // pass empty cache instead of `this.state.messageCache`
        )

        this.log.debug('loadChat took', performance.now() - startTime)

        this.reducer.selectedChat({
          ...messageWindow,
          messageCache,
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
          for (const msgId of this.state.loadedMessageIds) {
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
          const anchorMsgId = state.loadedMessageIds[0]
          if (!state.hasOlder || anchorMsgId == undefined) {
            this.log.debug('fetchMoreMessagesTop: no older messages, returning')
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }

          let messageWindow: LoadedWindow
          try {
            messageWindow = await fetchMessageWindow(
              this.accountId,
              this.chatId,
              anchorMsgId,
              PAGE_SIZE,
              0
            )
          } catch (err) {
            // E.g. the anchor message got deleted in the meantime.
            // A `MsgsChanged` event will have been emitted for that,
            // so `refresh` is going to fix the window.
            this.log.warn('fetchMoreMessagesTop failed', err)
            return false
          }

          // The anchor message is part of the window, but we already have it.
          const olderMessageIds = messageWindow.loadedMessageIds.filter(
            msgId => msgId !== anchorMsgId
          )
          if (olderMessageIds.length === 0) {
            this.log.debug(
              'fetchMoreMessagesTop: no messages were loaded, returning'
            )
            return false
          }

          const newMessageCacheItems = await this.loadMessageBodies(
            olderMessageIds,
            this.state.messageCache
          )

          this.reducer.appendMessagesTop({
            olderMessageIds,
            olderTimestamps: messageWindow.loadedTimestamps,
            prevTimestamp: messageWindow.prevTimestamp,
            hasOlder: messageWindow.hasOlder,
            newMessageCacheItems,
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
          const anchorMsgId =
            state.loadedMessageIds[state.loadedMessageIds.length - 1]
          if (!state.hasNewer || anchorMsgId == undefined) {
            //log.debug('fetchMoreMessagesBottom: no more messages, returning')
            // Since we haven't changed `viewState`, `MessageList` won't
            // call `unlockScroll()`, so let's unlock it now.
            return false
          }
          this.log.debug(`fetchMoreMessagesBottom`)

          const newerMessageIds = await this.__appendNewerMessages(
            anchorMsgId,
            false
          )
          return newerMessageIds != undefined
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

          // Keep the window where it is by re-anchoring it in its middle.
          // Messages may have been deleted, which is what this effect is
          // called for, so pick an anchor that still exists.
          const existingIds =
            state.loadedMessageIds.length > 0
              ? await BackendRemote.rpc.getExistingMsgIds(
                  this.accountId,
                  state.loadedMessageIds
                )
              : []
          const anchorIndex = Math.floor(existingIds.length / 2)
          const anchorMsgId = existingIds[anchorIndex] ?? null

          const messageWindow = await this.__fetchWindowAround(
            anchorMsgId,
            anchorIndex,
            existingIds.length - 1 - anchorIndex
          )
          const messageCache = await this.loadMessageBodies(
            messageWindow.loadedMessageIds,
            {} // pass empty cache instead of `this.state.messageCache`
          )

          this.reducer.setWindow(
            messageWindow,
            messageCache,
            ChatViewReducer.refresh(this.state.viewState)
          )
          return true
        },
        'refresh'
      ),
      'refresh'
    ),
    onEventIncomingMessage: this.scheduler.queuedEffect(async () => {
      await this.__appendNewMessages()
    }, 'onEventIncomingMessage'),
    onEventMessagesChanged: this.scheduler.queuedEffect(
      async (messageId: number) => {
        if (
          messageId > C.DC_MSG_ID_LAST_SPECIAL &&
          this.state.loadedMessageIds.includes(messageId)
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
          // The draft message is not part of the message window.
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
            'changed message seems to be a new message, loading newer messages'
          )

          // Some "new" messages don't trigger `IncomingMsg` but only
          // `MsgsChanged` — e.g. info messages from the current user's actions
          // (changing the group name, disappearing messages etc.) or
          // IncomingCall messages. Treat them the same as incoming messages so
          // the list scrolls to bottom when the user is already there.
          await this.__appendNewMessages()
        }
      },
      'onEventMessagesChanged'
    ),
  }

  /**
   * Loads a window around `anchorMsgId`, falling back to the newest messages
   * of the chat if that message is not (or no longer) part of the chat.
   */
  private async __fetchWindowAround(
    anchorMsgId: number | null,
    before: number,
    after: number,
    accountId: number = this.accountId,
    chatId: number = this.chatId
  ): Promise<LoadedWindow> {
    if (anchorMsgId != null) {
      try {
        return await fetchMessageWindow(
          accountId,
          chatId,
          anchorMsgId,
          before,
          after
        )
      } catch (err) {
        this.log.warn(
          `Could not load a window around message ${anchorMsgId}, ` +
            'falling back to the newest messages of the chat',
          err
        )
      }
    }
    return await fetchMessageWindow(accountId, chatId, null, PAGE_SIZE, 0)
  }

  /**
   * Loads the messages that come after `anchorMsgId` and appends them
   * to the window.
   *
   * @param areIncoming whether the messages are new to the chat,
   * which scrolls the list down if it is already close to the bottom.
   * @returns the appended message ids, or `undefined` if nothing was appended.
   */
  private async __appendNewerMessages(
    anchorMsgId: number,
    areIncoming: boolean
  ): Promise<number[] | undefined> {
    let messageWindow: LoadedWindow
    try {
      messageWindow = await fetchMessageWindow(
        this.accountId,
        this.chatId,
        anchorMsgId,
        0,
        PAGE_SIZE
      )
    } catch (err) {
      // E.g. the anchor message got deleted in the meantime.
      // A `MsgsChanged` event will have been emitted for that,
      // so `refresh` is going to fix the window.
      this.log.warn('could not load newer messages', err)
      return undefined
    }

    // The anchor message is part of the window, but we already have it.
    const newerMessageIds = messageWindow.loadedMessageIds.filter(
      msgId => msgId !== anchorMsgId
    )
    if (newerMessageIds.length === 0) {
      return undefined
    }

    const newMessageCacheItems = await this.loadMessageBodies(
      newerMessageIds,
      this.state.messageCache
    )

    this.reducer.appendMessagesBottom({
      newerMessageIds,
      newerTimestamps: messageWindow.loadedTimestamps,
      hasNewer: messageWindow.hasNewer,
      newMessageCacheItems,
      areIncoming,
    })
    return newerMessageIds
  }

  /**
   * Appends messages that are new to the chat to the store and updates
   * the scroll position if needed.
   */
  private async __appendNewMessages() {
    const state = this.state
    if (state.hasNewer) {
      // The user has scrolled up far enough for the newest messages to be
      // outside of the window. There is nothing to append to: the new
      // messages are simply more of what the "jump down" button leads to.
      this.log.debug(
        '__appendNewMessages: not scrolled to the bottom, nothing to do'
      )
      return
    }

    const anchorMsgId =
      state.loadedMessageIds[state.loadedMessageIds.length - 1]
    if (anchorMsgId == undefined) {
      // The chat was empty when the window was loaded.
      const messageWindow = await fetchMessageWindow(
        this.accountId,
        this.chatId,
        null,
        PAGE_SIZE,
        0
      )
      const messageCache = await this.loadMessageBodies(
        messageWindow.loadedMessageIds,
        this.state.messageCache
      )
      this.reducer.setWindow(
        messageWindow,
        messageCache,
        ChatViewReducer.fetchedIncomingMessages(this.state.viewState)
      )
      return
    }

    await this.__appendNewerMessages(anchorMsgId, true)
  }

  /**
   * Loads and shows the message in the messages list.
   * It can handle initializing MessageListStore
   * (loading the message window and `messageCache`, etc),
   * loading a new window if the message is outside of the loaded one,
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
        // `this.state.loadedMessageIds`, it's guaranteed to belong
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

    if (
      jumpToMessageId == undefined &&
      isMessageInCurrentChat &&
      !this.state.hasNewer
    ) {
      // Jumping down to the newest message of the chat, which is already
      // part of the loaded window. Take it from there, so that we neither
      // load nor scroll more than we have to.
      jumpToMessageId =
        this.state.loadedMessageIds[this.state.loadedMessageIds.length - 1]
    }

    // How many messages to load on either side of the message we jump to,
    // so that it is shown with some context around it.
    const halfPageSize = Math.ceil(PAGE_SIZE / 2)

    let newWindow: LoadedWindow
    let newMessageCache: MessageListState['messageCache']

    const isInLoadedWindow =
      isMessageInCurrentChat &&
      jumpToMessageId != undefined &&
      this.state.loadedMessageIds.includes(jumpToMessageId)
    if (isInLoadedWindow) {
      // The message is already rendered, we only have to scroll to it.
      // Keeping the window also keeps the messages around it that the user
      // has already loaded by scrolling.
      this.log.debug('jumpToMessage: the message is in the loaded window')
      newWindow = loadedWindowOf(this.state)
      newMessageCache = this.state.messageCache
    } else {
      newWindow = await this.__fetchWindowAround(
        jumpToMessageId ?? null,
        halfPageSize,
        halfPageSize,
        accountId,
        chatId
      )
      if (
        jumpToMessageId != undefined &&
        !newWindow.loadedMessageIds.includes(jumpToMessageId)
      ) {
        // `__fetchWindowAround` fell back to the newest messages of the chat.
        // To be fair, it's expected that we could jump to a message
        // that is now deleted, e.g. if it got deleted just recently
        // and not all state has updated, but this is super rare.
        this.log.error(
          `Could not jump to message ${jumpToMessageId}: does it even ` +
            `belong to chat ${chatId}? Or did the message get deleted?\n` +
            `Anyways, falling back to jumping to the last message.`
        )
        jumpToMessageId = undefined
      }

      newMessageCache = await this.loadMessageBodies(
        newWindow.loadedMessageIds,
        // Reuse the messages we already have, but only keep the ones of the
        // new window: this is where the cache gets bounded again after the
        // user has scrolled through a lot of the chat.
        this.state.messageCache,
        accountId
      )
    }

    let newViewState: ChatViewState
    const newestLoadedMessageId =
      newWindow.loadedMessageIds[newWindow.loadedMessageIds.length - 1]
    if (jumpToMessageId == undefined) {
      // Jump to the last message of the chat, if there is one.
      jumpToMessageId = newestLoadedMessageId
    }
    if (jumpToMessageId == undefined) {
      // The chat has no messages at all. Same as in `loadChat()`.
      newViewState = ChatViewReducer.selectChat(this.state.viewState)
    } else {
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
      ...newWindow,
      messageCache: newMessageCache,
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
 * Returns the cache entries for `msgIds`, loading the ones that are missing
 * from {@linkcode existingMessages}.
 *
 * Messages of {@linkcode existingMessages} that are not in `msgIds` are not
 * part of the return value, so that the cache does not keep growing while
 * the user scrolls through a chat.
 */
async function loadMessages(
  accountId: number,
  msgIds: number[],
  existingMessages: MessageListState['messageCache']
) {
  const missingIds = msgIds.filter(msgId => {
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
  for (const id of msgIds) {
    ret[id] = missing[id] ?? existingMessages[id]
  }
  return ret
}
