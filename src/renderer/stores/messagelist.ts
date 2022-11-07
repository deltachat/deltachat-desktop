import { Store } from './store'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from '@deltachat/jsonrpc-client'
import { OrderedMap } from 'immutable'
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

const PAGE_SIZE = 11

export interface MessagePage {
  pageKey: string
  messages: OrderedMap<
    number | string,
    Type.Message | { id: string; ts: number }
  >
}

interface MessageListState {
  // chat: Type.FullChat | null
  messageListItems: T.MessageListItem[]
  messagePages: MessagePage[]
  newestFetchedMessageListItemIndex: number
  oldestFetchedMessageListItemIndex: number
  viewState: ChatViewState
  jumpToMessageStack: number[]
  countFetchedMessages: number
}

const defaultState = () =>
  ({
    messageListItems: [],
    messagePages: [],
    newestFetchedMessageListItemIndex: -1,
    oldestFetchedMessageListItemIndex: -1,
    viewState: defaultChatViewState(),
    jumpToMessageStack: [],
    countFetchedMessages: 0,
  } as MessageListState)

async function messagePageFromMessageIndexes(
  accountId: number,
  chatId: number,
  indexStart: number,
  indexEnd: number
): Promise<MessagePage> {
  const rawMessages = await getMessagesFromIndex(
    accountId,
    chatId,
    indexStart,
    indexEnd
  )

  if (rawMessages.length === 0) {
    throw new Error(
      'messagePageFromMessageIndexes: _messages.length equals zero. This should not happen'
    )
  }

  // log.debug('messagePageFromMessageIndexes', rawMessages, indexEnd, indexStart)

  if (rawMessages.length !== indexEnd - indexStart + 1) {
    throw new Error(
      "messagePageFromMessageIndexes: _messages.length doesn't equal indexEnd - indexStart + 1. This should not happen"
    )
  }

  const messages = OrderedMap<
    number | string,
    Type.Message | { id: string; ts: number }
  >().withMutations(messagePages => {
    for (let i = 0; i < rawMessages.length; i++) {
      const [messageId, message] = rawMessages[i]
      messagePages.set(messageId, message)
    }
  })

  // log.debug('messagePageFromMessageIndexes', messages)

  const messagePage = {
    pageKey: calculatePageKey(messages, indexStart, indexEnd),
    messages,
  }

  return messagePage
}

async function messagePagesFromMessageIndexes(
  accountId: number,
  chatId: number,
  indexStart: number,
  indexEnd: number
): Promise<MessagePage[]> {
  const rawMessages = await getMessagesFromIndex(
    accountId,
    chatId,
    indexStart,
    indexEnd
  )

  const messagePages = []
  while (rawMessages.length > 0) {
    const pageMessages = rawMessages.splice(0, PAGE_SIZE)

    const messages = OrderedMap<
      number | string,
      Type.Message | { id: string; ts: number }
    >().withMutations(messagePages => {
      for (let i = 0; i < pageMessages.length; i++) {
        const [messageId, message] = pageMessages[i]
        messagePages.set(messageId, message)
      }
    })

    messagePages.push({
      pageKey: calculatePageKey(messages, indexStart, indexEnd),
      messages,
    })
  }

  return messagePages
}

// select chat
// and unselect chat
// and mute need to be done outside of this
// and sendMessage
// and onEventChatModified

export function useMessageList(accountId: number, chatId: number) {
  let store = useMemo(() => {
    const store = new MessageListStore(accountId, chatId)
    store.effect.loadChat()
    return store
  }, [accountId, chatId])

  useEffect(() => {
    let cleanup = [
      onDCEvent(accountId, 'MsgDelivered', ({ chatId: eventChatId, msgId }) => {
        if (chatId === eventChatId) {
          store.reducer.setMessageState({
            messageId: msgId,
            messageState: C.DC_STATE_OUT_DELIVERED,
          })
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
          store.reducer.setMessageState({
            messageId: msgId,
            messageState: C.DC_STATE_OUT_MDN_RCVD,
          })
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
  }, [accountId, chatId])

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

class MessageListStore extends Store<MessageListState> {
  scheduler = new ChatStoreScheduler()

  emitter = BackendRemote.getContextEvents(this.accountId)

  constructor(
    private readonly accountId: number,
    private readonly chatId: number
  ) {
    super(defaultState())
  }

  guardReducerTriesToAddDuplicatePageKey(pageKeyToAdd: string) {
    const isDuplicatePageKey =
      this.state.messagePages.findIndex(
        messagePage => messagePage.pageKey === pageKeyToAdd
      ) !== -1
    if (isDuplicatePageKey) {
      this.log.error('Duplicate page key')
    }
    return isDuplicatePageKey
  }
  reducer = {
    selectedChat: (payload: Partial<MessageListState>) => {
      this.setState(_ => {
        this.scheduler.unlock('scroll')
        const modifiedState: MessageListState = {
          ...defaultState(),
          ...payload,
        }
        return modifiedState
      }, 'selectedChat')
    },
    refresh: (
      messageListItems: T.MessageListItem[],
      messagePages: MessagePage[],
      newestFetchedMessageListItemIndex: number,
      oldestFetchedMessageListItemIndex: number
    ) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListItems,
          messagePages,
          viewState: ChatViewReducer.refresh(state.viewState),
          countFetchedMessages: messageListItems.length,
          newestFetchedMessageListItemIndex,
          oldestFetchedMessageListItemIndex,
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
      messagePage: MessagePage
      countFetchedMessages: number
      oldestFetchedMessageListItemIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messagePages: [payload.messagePage, ...state.messagePages],
          oldestFetchedMessageListItemIndex:
            payload.oldestFetchedMessageListItemIndex,
          viewState: ChatViewReducer.appendMessagePageTop(state.viewState),
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (
          this.guardReducerTriesToAddDuplicatePageKey(
            payload.messagePage.pageKey
          )
        ) {
          return
        }
        return modifiedState
      }, 'appendMessagePageTop')
    },
    appendMessagePageBottom: (payload: {
      messagePage: MessagePage
      countFetchedMessages: number
      newestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messagePages: [...state.messagePages, payload.messagePage],
          newestFetchedMessageListItemIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.appendMessagePageBottom(state.viewState),
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (
          this.guardReducerTriesToAddDuplicatePageKey(
            payload.messagePage.pageKey
          )
        )
          return
        return modifiedState
      }, 'appendMessagePageBottom')
    },
    fetchedIncomingMessages: (payload: {
      messageListItems: MessageListState['messageListItems']
      newestFetchedMessageIndex: number
      messagePage: MessagePage
    }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messageListItems: payload.messageListItems,
          messagePages: [...state.messagePages, payload.messagePage],
          // newestFetchedMessageIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.fetchedIncomingMessages(state.viewState),
        }

        if (
          this.guardReducerTriesToAddDuplicatePageKey(
            payload.messagePage.pageKey
          )
        ) {
          throw new Error(
            'We almost added the same page twice! We should prevent this in code duplicate pageKey: ' +
              payload.messagePage.pageKey
          )
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
    messageChanged: (payload: { messagesChanged: Type.Message[] }) => {
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messagePages: state.messagePages.map(messagePage => {
            let changed = false
            const messages = messagePage.messages.withMutations(messages => {
              for (const changedMessage of payload.messagesChanged) {
                if (!messages.has(changedMessage.id)) continue
                changed = true
                messages.set(changedMessage.id, changedMessage)
              }
            })
            if (changed === false) return messagePage
            return {
              ...messagePage,
              messages,
            }
          }),
        }
        return modifiedState
      }, 'messageChanged')
    },
    setMessageState: (payload: { messageId: number; messageState: number }) => {
      const { messageId, messageState } = payload
      this.setState(state => {
        const modifiedState: MessageListState = {
          ...state,
          messagePages: state.messagePages.map(messagePage => {
            if (messagePage.messages.has(messageId)) {
              const message = messagePage.messages.get(messageId)
              if (message !== null && message !== undefined) {
                const updatedMessages = messagePage.messages.set(messageId, {
                  ...message,
                  state: messageState,
                })

                return {
                  ...messagePage,
                  messages: updatedMessages,
                }
              }
            }

            return messagePage
          }),
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
            'SELECT CHAT chat does not exsits, id is null. chatId:',
            chat.id
          )
          return
        }
        const messageListItems = await BackendRemote.rpc.getMessageListItems(
          this.accountId,
          this.chatId,
          C.DC_GCM_ADDDAYMARKER
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
        let messagePage: MessagePage | null = null
        if (messageListItems.length !== 0) {
          // mesageIds.length = 1767
          // oldestFetchedMessageListItemIndex = 1767 - 1 = 1766 - 10 = 1756
          // newestFetchedMessageIndex =                        1766
          oldestFetchedMessageListItemIndex = Math.max(
            messageListItems.length - 1 - PAGE_SIZE,
            0
          )
          newestFetchedMessageListItemIndex = messageListItems.length - 1

          messagePage = await messagePageFromMessageIndexes(
            this.accountId,
            this.chatId,
            oldestFetchedMessageListItemIndex,
            newestFetchedMessageListItemIndex
          )
        }

        this.reducer.selectedChat({
          messagePages: messagePage === null ? [] : [messagePage],
          messageListItems,
          oldestFetchedMessageListItemIndex,
          newestFetchedMessageListItemIndex,
          viewState: ChatViewReducer.selectChat(this.state.viewState),
        })
        ActionEmitter.emitAction(
          chat.archived
            ? KeybindAction.ChatList_SwitchToArchiveView
            : KeybindAction.ChatList_SwitchToNormalView
        )
      },
      'selectChat'
    ),
    // TODO: Probably this should be lockedQueuedEffect too?
    jumpToMessage: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async (
          msgId: number | undefined,
          highlight?: boolean,
          addMessageIdToStack?: undefined | number
        ) => {
          this.log.debug('jumpToMessage with messageId: ', msgId)
          const accountId = selectedAccountId()
          highlight = highlight === false ? false : true
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
            const jumpToMessageStackLength = this.state.jumpToMessageStack
              .length
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
              this.effect.loadChat()
              return
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

          const chat = await BackendRemote.rpc.getFullChatById(
            accountId,
            chatId
          )
          if (chat.id === null) {
            this.log.debug(
              'SELECT CHAT chat does not exsits, id is null. chatId:',
              chat.id
            )
            return
          }
          const messageListItems = await BackendRemote.rpc.getMessageListItems(
            accountId,
            chatId,
            C.DC_GCM_ADDDAYMARKER
          )

          const jumpToMessageIndex = messageListItems.findIndex(
            m => m.kind === 'message' && m.msg_id === jumpToMessageId
          )

          // calculate page indexes, so that jumpToMessageId is in the middle of the page
          let oldestFetchedMessageListItemIndex = -1
          let newestFetchedMessageListItemIndex = -1
          let messagePage: MessagePage | null = null
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

            messagePage = await messagePageFromMessageIndexes(
              accountId,
              chatId,
              oldestFetchedMessageListItemIndex,
              newestFetchedMessageListItemIndex
            )
          }

          if (messagePage === null) {
            throw new Error(
              'jumpToMessage: messagePage is null, this should not happen'
            )
          }

          this.reducer.selectedChat({
            messagePages: [messagePage],
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
      'jumpToMessage'
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

          const messagePage: MessagePage = await messagePageFromMessageIndexes(
            this.accountId,
            id,
            oldestFetchedMessageListItemIndex,
            lastMessageIndexOnLastPage - 1
          )

          this.reducer.appendMessagePageTop({
            id,
            messagePage,
            oldestFetchedMessageListItemIndex,
            countFetchedMessages: fetchedMessageListItems.length,
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

          const id = this.chatId

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

          const messagePage: MessagePage = await messagePageFromMessageIndexes(
            this.accountId,
            this.chatId,
            newestFetchedMessageListItemIndex,
            newNewestFetchedMessageListItemIndex
          )

          this.reducer.appendMessagePageBottom({
            messagePage,
            newestFetchedMessageIndex: newNewestFetchedMessageListItemIndex,
            countFetchedMessages: fetchedMessageListItems.length,
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
            C.DC_GCM_ADDDAYMARKER
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

          const messagePages = await messagePagesFromMessageIndexes(
            this.accountId,
            this.chatId,
            oldestFetchedMessageListItemIndex,
            newestFetchedMessageListItemIndex
          )

          this.reducer.refresh(
            messageListItems,
            messagePages,
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
        C.DC_GCM_ADDDAYMARKER
      )
      let indexStart = -1
      let indexEnd = -1
      for (let index = 0; index < messageListItems.length; index++) {
        const msgListItem = messageListItems[index]
        if (this.state.messageListItems.includes(msgListItem)) continue
        if (indexStart === -1) {
          indexStart = index
        }
        indexEnd = index
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
      const messagePage = await messagePageFromMessageIndexes(
        this.accountId,
        this.chatId,
        indexStart,
        indexEnd
      )

      this.reducer.fetchedIncomingMessages({
        messageListItems,
        messagePage,
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
            this.reducer.messageChanged({
              messagesChanged: [message],
            })
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
            C.DC_GCM_ADDDAYMARKER
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
      messagePages: state.messagePages.map(messagePage => {
        return {
          ...messagePage,
          messages: messagePage.messages.toArray().map(([msgId, message]) => {
            return [
              msgId,
              typeof message.id !== 'string'
                ? {
                    messageId: message.id,
                    messsage: (message as Type.Message).text,
                  }
                : {
                    messageId: message.id,
                    timestamp: (message as {
                      id: string
                      ts: number
                    }).ts,
                  },
            ]
          }),
        }
      }),
    }
  }
}

function calculatePageKey(
  messages: MessagePage['messages'],
  indexStart: number,
  indexEnd: number
): string {
  const first = messages.first()?.id
  const last = messages.last()?.id
  if (!first && !last && indexStart === 0 && indexEnd === 0) {
    throw new Error('calculatePageKey: non unique page key of 0')
  } else {
    return `page-${first}-${last}-${indexStart}-${indexEnd}`
  }
}

async function getMessagesFromIndex(
  accountId: number,
  chatId: number,
  indexStart: number,
  indexEnd: number,
  flags = C.DC_GCM_ADDDAYMARKER
): Promise<[number | string, Type.Message | { id: string; ts: number }][]> {
  const allMessageListItems = (
    await BackendRemote.rpc.getMessageListItems(accountId, chatId, flags)
  ).slice(indexStart, indexEnd + 1)

  const messageIds = allMessageListItems
    .map(m => (m.kind === 'message' ? m.msg_id : C.DC_MSG_ID_LAST_SPECIAL))
    .filter(msgId => msgId !== C.DC_MSG_ID_LAST_SPECIAL)

  const messages = await BackendRemote.rpc.getMessages(accountId, messageIds)

  return allMessageListItems.map(m => [
    m.kind === 'message' ? m.msg_id : `d${m.timestamp}`,
    m.kind === 'message'
      ? messages[m.msg_id]
      : { id: `d${m.timestamp}`, ts: m.timestamp },
  ])
}
