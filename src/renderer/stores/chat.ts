import { Store, useStore } from './store'
import { sendMessageParams } from '../delta-remote'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/node/dist/constants'
import { OrderedMap } from 'immutable'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { debouncedUpdateBadgeCounter } from '../system-integration/badge-counter'
import { clearNotificationsForChat } from '../system-integration/notifications'
import { T } from '@deltachat/jsonrpc-client'
import {
  ChatViewState,
  ChatViewReducer,
  defaultChatViewState,
} from './chat/chat_view_reducer'
import { ChatStoreScheduler } from './chat/chat_scheduler'
import { saveLastChatId } from './chat/chat_sideeffects'
import { onReady } from '../onready'

export const PAGE_SIZE = 11

export interface MessagePage {
  pageKey: string
  messages: OrderedMap<
    number | string,
    Type.Message | { id: string; ts: number }
  >
}

export enum ChatView {
  MessageList,
  Media,
  Map,
}
export interface ChatStoreState {
  activeView: ChatView
  chat: Type.FullChat | null
  accountId?: number
  messageListItems: T.MessageListItem[]
  messagePages: MessagePage[]
  newestFetchedMessageListItemIndex: number
  oldestFetchedMessageIndex: number
  viewState: ChatViewState
  jumpToMessageStack: number[]
  countFetchedMessages: number
}

const defaultState: () => ChatStoreState = () => ({
  activeView: ChatView.MessageList,
  chat: null,
  accountId: undefined,
  messageListItems: [],
  messagePages: [],
  newestFetchedMessageListItemIndex: -1,
  oldestFetchedMessageIndex: -1,
  viewState: defaultChatViewState(),
  jumpToMessageStack: [],
  countFetchedMessages: 0,
})

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

  log.debug('messagePageFromMessageIndexes', messages)

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

class ChatStore extends Store<ChatStoreState> {
  scheduler = new ChatStoreScheduler()

  guardReducerTriesToAddDuplicatePageKey(pageKeyToAdd: string) {
    const isDuplicatePageKey =
      this.state.messagePages.findIndex(
        messagePage => messagePage.pageKey === pageKeyToAdd
      ) !== -1
    if (isDuplicatePageKey) {
      log.error('Duplicate page key')
    }
    return isDuplicatePageKey
  }
  guardReducerIfChatIdIsDifferent(payload: { id: number }) {
    if (
      typeof payload.id !== 'undefined' &&
      payload.id !== this.state.chat?.id
    ) {
      log.debug(
        'REDUCER',
        'seems like an old action because the chatId changed in between'
      )
      return true
    }
    return false
  }
  reducer = {
    setView: (view: ChatView) => {
      this.setState(prev => {
        const modifiedState: ChatStoreState = {
          ...prev,
          activeView: view,
        }
        return modifiedState
      }, 'setChatView')
    },
    selectedChat: (payload: Partial<ChatStoreState>) => {
      this.setState(_ => {
        this.scheduler.unlock('scroll')
        const modifiedState: ChatStoreState = {
          ...defaultState(),
          ...payload,
        }
        return modifiedState
      }, 'selectedChat')
    },
    refresh: (
      messageListItems: T.MessageListItem[],
      messagePages: MessagePage[],
      newestFetchedMessageIndex: number,
      oldestFetchedMessageIndex: number
    ) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          messageListItems,
          messagePages,
          viewState: ChatViewReducer.refresh(state.viewState),
          countFetchedMessages: messageListItems.length,
          newestFetchedMessageListItemIndex: newestFetchedMessageIndex,
          oldestFetchedMessageIndex,
        }
        return modifiedState
      }, 'refresh')
    },
    unselectChat: () => {
      this.setState(_ => {
        this.scheduler.unlock('scroll')
        const modifiedState: ChatStoreState = { ...defaultState() }
        return modifiedState
      }, 'unselectChat')
    },
    modifiedChat: (payload: { id: number } & Partial<ChatStoreState>) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          ...payload,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'modifiedChat')
    },
    appendMessagePageTop: (payload: {
      id: number
      messagePage: MessagePage
      countFetchedMessages: number
      oldestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          messagePages: [payload.messagePage, ...state.messagePages],
          oldestFetchedMessageIndex: payload.oldestFetchedMessageIndex,
          viewState: ChatViewReducer.appendMessagePageTop(state.viewState),
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
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
      id: number
      messagePage: MessagePage
      countFetchedMessages: number
      newestFetchedMessageIndex: number
    }) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          messagePages: [...state.messagePages, payload.messagePage],
          newestFetchedMessageListItemIndex: payload.newestFetchedMessageIndex,
          viewState: ChatViewReducer.appendMessagePageBottom(state.viewState),
          countFetchedMessages: payload.countFetchedMessages,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
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
      id: number
      messageListItems: ChatStoreState['messageListItems']
      newestFetchedMessageIndex: number
      messagePage: MessagePage
    }) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
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

        if (this.guardReducerIfChatIdIsDifferent(payload)) return

        return modifiedState
      }, 'fetchedIncomingMessages')
    },
    unlockScroll: (payload: { id: number }) => {
      log.debug('unlockScroll')
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          viewState: ChatViewReducer.unlockScroll(state.viewState),
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        setTimeout(() => this.scheduler.unlock('scroll'), 0)
        return modifiedState
      }, 'unlockScroll')
    },
    uiDeleteMessage: (payload: { id: number; msgId: number }) => {
      this.setState(state => {
        const { msgId } = payload
        const messageIndex = state.messageListItems.findIndex(
          m => m.kind === 'message' && m.msg_id == msgId
        )
        let {
          oldestFetchedMessageIndex,
          newestFetchedMessageListItemIndex,
        } = state
        if (messageIndex === oldestFetchedMessageIndex) {
          oldestFetchedMessageIndex += 1
        } else if (messageIndex === newestFetchedMessageListItemIndex) {
          newestFetchedMessageListItemIndex -= 1
        }
        const messageListItems = state.messageListItems.filter(
          m => m.kind !== 'message' || m.msg_id !== msgId
        )
        const modifiedState: ChatStoreState = {
          ...state,
          messageListItems,
          messagePages: state.messagePages.map(messagePage => {
            if (messagePage.messages.has(msgId)) {
              return {
                ...messagePage,
                messages: messagePage.messages.delete(msgId),
              }
            }
            return messagePage
          }),
          oldestFetchedMessageIndex,
          newestFetchedMessageListItemIndex,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'uiDeleteMessage')
    },
    messageChanged: (payload: {
      id: number
      messagesChanged: Type.Message[]
    }) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
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
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'messageChanged')
    },
    setMessageState: (payload: {
      id: number
      messageId: number
      messageState: number
    }) => {
      const { messageId, messageState } = payload
      this.setState(state => {
        const modifiedState: ChatStoreState = {
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
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'setMessageState')
    },
    setMessageListItems: (payload: {
      id: number
      messageListItems: ChatStoreState['messageListItems']
    }) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          messageListItems: payload.messageListItems,
          viewState: ChatViewReducer.setMessageListItems(state.viewState),
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'setMessageIds')
    },

    setFreshMessageCounter: (payload: {
      id: number
      freshMessageCounter: number
    }) => {
      const { freshMessageCounter } = payload
      this.setState(state => {
        if (!state.chat) return
        const modifiedState: ChatStoreState = {
          ...state,
          chat: {
            ...state.chat,
            freshMessageCounter,
          },
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'setMessageIds')
    },
  }

  effect = {
    selectChat: this.scheduler.lockedQueuedEffect(
      'scroll',
      async (chatId: number) => {
        const accountId = selectedAccountId()
        const chat = await BackendRemote.rpc.chatlistGetFullChatById(
          accountId,
          chatId
        )
        if (chat.id === null) {
          log.debug(
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

        BackendRemote.rpc.marknoticedChat(accountId, chatId)
        debouncedUpdateBadgeCounter()
        clearNotificationsForChat(accountId, chatId)

        const firstUnreadMsgId = await BackendRemote.rpc.getFirstUnreadMessageOfChat(
          accountId,
          chatId
        )
        if (firstUnreadMsgId !== null) {
          setTimeout(() => {
            this.effect.jumpToMessage(firstUnreadMsgId, false)
            ActionEmitter.emitAction(
              chat.archived
                ? KeybindAction.ChatList_SwitchToArchiveView
                : KeybindAction.ChatList_SwitchToNormalView
            )
            saveLastChatId(chatId)
          })
          return false
        }

        let oldestFetchedMessageIndex = -1
        let newestFetchedMessageIndex = -1
        let messagePage: MessagePage | null = null
        if (messageListItems.length !== 0) {
          // mesageIds.length = 1767
          // oldestFetchedMessageIndex = 1767 - 1 = 1766 - 10 = 1756
          // newestFetchedMessageIndex =                        1766
          oldestFetchedMessageIndex = Math.max(
            messageListItems.length - 1 - PAGE_SIZE,
            0
          )
          newestFetchedMessageIndex = messageListItems.length - 1

          messagePage = await messagePageFromMessageIndexes(
            accountId,
            chatId,
            oldestFetchedMessageIndex,
            newestFetchedMessageIndex
          )
        }

        this.reducer.selectedChat({
          chat,
          accountId,
          messagePages: messagePage === null ? [] : [messagePage],
          messageListItems,
          oldestFetchedMessageIndex,
          newestFetchedMessageListItemIndex: newestFetchedMessageIndex,
          viewState: ChatViewReducer.selectChat(this.state.viewState),
        })
        ActionEmitter.emitAction(
          chat.archived
            ? KeybindAction.ChatList_SwitchToArchiveView
            : KeybindAction.ChatList_SwitchToNormalView
        )
        saveLastChatId(chatId)
      },
      'selectChat'
    ),
    setView: (view: ChatView) => {
      this.reducer.setView(view)
    },
    // TODO: Probably this should be lockedQueuedEffect too?
    jumpToMessage: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async (
          msgId: number | undefined,
          highlight?: boolean,
          addMessageIdToStack?: undefined | number
        ) => {
          log.debug('jumpToMessage with messageId: ', msgId)
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
              message = await BackendRemote.rpc.messageGetMessage(
                accountId,
                jumpToMessageId as number
              )
              chatId = message.chatId
            } else {
              if (this.state.chat) {
                this.effect.selectChat(this.state.chat.id)
              }
              return
            }
          } else if (addMessageIdToStack === undefined) {
            // reset jumpToMessageStack
            message = await BackendRemote.rpc.messageGetMessage(
              accountId,
              msgId as number
            )
            chatId = message.chatId

            jumpToMessageId = msgId as number
            jumpToMessageStack = []
          } else {
            message = await BackendRemote.rpc.messageGetMessage(
              accountId,
              msgId as number
            )
            chatId = message.chatId

            jumpToMessageId = msgId as number
            // If we are not switching chats, add current jumpToMessageId to the stack
            const currentChatId = chatStore.state.chat?.id || -1
            if (chatId !== currentChatId) {
              jumpToMessageStack = []
            } else if (
              chatStore.state.jumpToMessageStack.indexOf(
                addMessageIdToStack
              ) !== -1
            ) {
              jumpToMessageStack = chatStore.state.jumpToMessageStack
            } else {
              jumpToMessageStack = [
                ...chatStore.state.jumpToMessageStack,
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

          const chat = await BackendRemote.rpc.chatlistGetFullChatById(
            accountId,
            chatId
          )
          if (chat.id === null) {
            log.debug(
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
          let oldestFetchedMessageIndex = -1
          let newestFetchedMessageIndex = -1
          let messagePage: MessagePage | null = null
          const half_page_size = Math.ceil(PAGE_SIZE / 2)
          if (messageListItems.length !== 0) {
            oldestFetchedMessageIndex = Math.max(
              jumpToMessageIndex - half_page_size,
              0
            )
            newestFetchedMessageIndex = Math.min(
              jumpToMessageIndex + half_page_size,
              messageListItems.length - 1
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
                messageListItems.length - 1
              )
            }

            messagePage = await messagePageFromMessageIndexes(
              accountId,
              chatId,
              oldestFetchedMessageIndex,
              newestFetchedMessageIndex
            )
          }

          if (messagePage === null) {
            throw new Error(
              'jumpToMessage: messagePage is null, this should not happen'
            )
          }

          this.reducer.selectedChat({
            chat,
            accountId,
            messagePages: [messagePage],
            messageListItems,
            oldestFetchedMessageIndex,
            newestFetchedMessageListItemIndex: newestFetchedMessageIndex,
            viewState: ChatViewReducer.jumpToMessage(
              this.state.viewState,
              jumpToMessageId,
              highlight
            ),
            jumpToMessageStack,
          })
          ActionEmitter.emitAction(
            chat.archived
              ? KeybindAction.ChatList_SwitchToArchiveView
              : KeybindAction.ChatList_SwitchToNormalView
          )
          debouncedUpdateBadgeCounter()
          saveLastChatId(chatId)
        },
        'jumpToMessage'
      ),
      'jumpToMessage'
    ),
    markseenMessages: async (chatId: number, msgIds: number[]) => {
      if (!this.state.chat || !this.state.chat.id) return
      if (this.state.chat.id !== chatId) return
      if (!this.state.accountId) {
        throw new Error('Account Id unset')
      }

      await BackendRemote.rpc.markseenMsgs(this.state.accountId, msgIds)
      const freshMessageCounter = await BackendRemote.rpc.getFreshMsgCnt(
        this.state.accountId,
        this.state.chat.id
      )
      this.reducer.setFreshMessageCounter({
        id: this.state.chat.id,
        freshMessageCounter,
      })

      debouncedUpdateBadgeCounter()
    },
    uiDeleteMessage: (msgId: number) => {
      if (!this.state.accountId) {
        throw new Error('Account Id unset')
      }
      BackendRemote.rpc.deleteMessages(this.state.accountId, [msgId])
      if (!this.state.chat) return
      const id = this.state.chat.id
      this.reducer.uiDeleteMessage({ id, msgId })
    },
    fetchMoreMessagesTop: this.scheduler.queuedEffect(
      this.scheduler.lockedEffect(
        'scroll',
        async () => {
          log.debug(`fetchMoreMessagesTop`)
          if (!this.state.accountId) {
            throw new Error('no account set')
          }
          const state = this.state
          if (state.chat === null) {
            return false
          }
          const id = state.chat.id
          const oldestFetchedMessageIndex = Math.max(
            state.oldestFetchedMessageIndex - PAGE_SIZE,
            0
          )
          const lastMessageIndexOnLastPage = state.oldestFetchedMessageIndex
          if (lastMessageIndexOnLastPage === 0) {
            log.debug(
              'FETCH_MORE_MESSAGES: lastMessageIndexOnLastPage is zero, returning'
            )
            return false
          }
          const fetchedMessageListItems = state.messageListItems.slice(
            oldestFetchedMessageIndex,
            lastMessageIndexOnLastPage
          )
          if (fetchedMessageListItems.length === 0) {
            log.debug(
              'fetchMoreMessagesTop: fetchedMessageListItems.length is zero, returning'
            )
            return false
          }

          const messagePage: MessagePage = await messagePageFromMessageIndexes(
            this.state.accountId,
            id,
            oldestFetchedMessageIndex,
            lastMessageIndexOnLastPage - 1
          )

          this.reducer.appendMessagePageTop({
            id,
            messagePage,
            oldestFetchedMessageIndex,
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
          if (!this.state.accountId) {
            throw new Error('no account set')
          }
          const state = this.state
          if (state.chat === null) {
            return false
          }
          const id = state.chat.id

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
          log.debug(`fetchMoreMessagesBottom`)

          const fetchedMessageListItems = state.messageListItems.slice(
            newestFetchedMessageListItemIndex,
            newNewestFetchedMessageListItemIndex + 1
          )
          if (fetchedMessageListItems.length === 0) {
            log.debug(
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
            this.state.accountId,
            id,
            newestFetchedMessageListItemIndex,
            newNewestFetchedMessageListItemIndex
          )

          this.reducer.appendMessagePageBottom({
            id,
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
        async (payload: { chatId: number }) => {
          const { chatId: eventChatId } = payload
          log.debug(`refresh`, eventChatId)
          const state = this.state
          if (state.chat === null) {
            log.debug('refresh: state.chat is null, returning')
            return false
          }
          if (state.chat.id !== payload.chatId) {
            log.debug(
              'refresh: state.chat.id and payload.chatId mismatch, returning',
              state.chat.id,
              payload.chatId
            )
            return false
          }
          const chatId = payload.chatId
          if (!this.state.accountId) {
            throw new Error('no account set')
          }
          const messageListItems = await BackendRemote.rpc.getMessageListItems(
            this.state.accountId,
            chatId,
            C.DC_GCM_ADDDAYMARKER
          )
          let {
            newestFetchedMessageListItemIndex: newestFetchedMessageIndex,
            oldestFetchedMessageIndex,
          } = state
          newestFetchedMessageIndex = Math.min(
            newestFetchedMessageIndex,
            messageListItems.length - 1
          )
          oldestFetchedMessageIndex = Math.max(oldestFetchedMessageIndex, 0)

          const messagePages = await messagePagesFromMessageIndexes(
            this.state.accountId,
            chatId,
            oldestFetchedMessageIndex,
            newestFetchedMessageIndex
          )

          this.reducer.refresh(
            messageListItems,
            messagePages,
            newestFetchedMessageIndex,
            oldestFetchedMessageIndex
          )
          return true
        },
        'refresh'
      ),
      'refresh'
    ),
    mute: async (payload: {
      chatId: number
      muteDuration: Type.MuteDuration
    }) => {
      if (payload.chatId !== this.state.chat?.id) return

      await BackendRemote.rpc.setChatMuteDuration(
        selectedAccountId(),
        payload.chatId,
        payload.muteDuration
      )
    },
    sendMessage: this.scheduler.queuedEffect(
      async (payload: { chatId: number; message: sendMessageParams }) => {
        log.debug('sendMessage')
        if (
          payload.chatId !== this.state.chat?.id ||
          this.state.accountId === undefined
        ) {
          return
        }

        const { text, filename, location, quoteMessageId } = payload.message
        const [messageId, message] = await BackendRemote.rpc.miscSendMsg(
          this.state.accountId,
          payload.chatId,
          text || null,
          filename || null,
          location ? [location.lat, location.lng] : null,
          quoteMessageId || null
        )

        // Workaround for failed messages
        if (messageId === 0) return
        if (message === null) return
        await this.effect.jumpToMessage(messageId, false)
      },
      'sendMessage'
    ),
    onEventChatModified: this.scheduler.queuedEffect(async (chatId: number) => {
      if (this.state.chat?.id !== chatId) {
        return
      }
      if (!this.state.accountId) {
        throw new Error('no account set')
      }
      this.reducer.modifiedChat({
        id: chatId,
        chat: await BackendRemote.rpc.chatlistGetFullChatById(
          this.state.accountId,
          chatId
        ),
      })
    }, 'onEventChatModified'),
    onEventIncomingMessage: this.scheduler.queuedEffect(
      async (chatId: number) => {
        if (chatId !== this.state.chat?.id) {
          log.debug(
            `DC_EVENT_INCOMING_MSG chatId of event (${chatId}) doesn't match id of selected chat (${this.state.chat?.id}). Skipping.`
          )
          return
        }
        if (!this.state.accountId) {
          throw new Error('no account set')
        }
        const messageListItems = await BackendRemote.rpc.getMessageListItems(
          this.state.accountId,
          chatId,
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
          log.debug(
            `onEventIncomingMessage: new incoming messages cannot added to state without having a hole (indexStart: ${indexStart}, newestFetchedMessageListItemIndex ${this.state.newestFetchedMessageListItemIndex}), returning`
          )
          this.reducer.setMessageListItems({
            id: chatId,
            messageListItems,
          })
          return
        }
        const messagePage = await messagePageFromMessageIndexes(
          this.state.accountId,
          chatId,
          indexStart,
          indexEnd
        )

        this.reducer.fetchedIncomingMessages({
          id: chatId,
          messageListItems,
          messagePage,
          newestFetchedMessageIndex: indexEnd,
        })
      },
      'onEventIncomingMessage'
    ),
    onEventMessagesChanged: this.scheduler.queuedEffect(
      async (eventChatId: number, messageId: number) => {
        log.debug('DC_EVENT_MSGS_CHANGED', eventChatId, messageId)
        const chatId = this.state.chat?.id
        if (chatId === null || chatId === undefined) {
          return
        }
        if (
          messageId === 0 &&
          (eventChatId === 0 || eventChatId === this.state.chat?.id)
        ) {
          this.effect.refresh({ chatId })
          return
        }
        if (eventChatId !== this.state.chat?.id) return
        if (!this.state.accountId) {
          throw new Error('no account set')
        }
        if (
          this.state.messageListItems.findIndex(
            m => m.kind === 'message' && m.msg_id === messageId
          ) !== -1
        ) {
          log.debug(
            'DC_EVENT_MSGS_CHANGED',
            'changed message seems to be message we already know'
          )
          try {
            const message = await BackendRemote.rpc.messageGetMessage(
              this.state.accountId,
              messageId
            )
            this.reducer.messageChanged({
              id: chatId,
              messagesChanged: [message],
            })
          } catch (error) {
            log.warn('failed to fetch message with id', messageId, error)
            // ignore not found and other errors
            return
          }
        } else {
          log.debug(
            'DC_EVENT_MSGS_CHANGED',
            'changed message seems to be a new message, refetching messageIds'
          )
          const messageListItems = await BackendRemote.rpc.getMessageListItems(
            this.state.accountId,
            chatId,
            C.DC_GCM_ADDDAYMARKER
          )
          this.reducer.setMessageListItems({ id: chatId, messageListItems })
        }
      },
      'onEventMessagesChanged'
    ),
  }

  stateToHumanReadable(state: ChatStoreState): any {
    return {
      //...state,
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

const chatStore = new ChatStore({ ...defaultState() }, 'ChatStore')

chatStore.dispatch = (..._args) => {
  throw new Error('Deprecated')
}

const log = chatStore.log

onReady(() => {
  BackendRemote.on('ChatModified', (accountId, { chatId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.effect.onEventChatModified(chatId)
  })

  BackendRemote.on('MsgDelivered', (accountId, { chatId: id, msgId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.reducer.setMessageState({
      id,
      messageId: msgId,
      messageState: C.DC_STATE_OUT_DELIVERED,
    })
  })

  BackendRemote.on('IncomingMsg', (accountId, { chatId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.effect.onEventIncomingMessage(chatId)
  })

  BackendRemote.on('MsgRead', (accountId, { chatId: id, msgId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.reducer.setMessageState({
      id,
      messageId: msgId,
      messageState: C.DC_STATE_OUT_MDN_RCVD,
    })
  })

  BackendRemote.on('MsgsChanged', (accountId, { chatId, msgId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.effect.onEventMessagesChanged(chatId, msgId)
  })

  BackendRemote.on('MsgFailed', (accountId, { chatId, msgId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.effect.onEventMessagesChanged(chatId, msgId)
  })
})

export function calculatePageKey(
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

export const useChatStore = () => useStore(chatStore)[0]
export const useChatStore2 = () => {
  const [selectedChat, _chatStoreDispatch] = useStore(chatStore)
  return { selectedChat }
}

export default chatStore
window.__chatStore = chatStore

export type ChatStoreDispatch = Store<ChatStoreState>['dispatch']

export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>

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

  const messages = await BackendRemote.rpc.messageGetMessages(
    accountId,
    messageIds
  )

  log.debug('getMessagesFromIndex', {
    allMessageListItems,
    messageIds,
    messages,
  })

  return allMessageListItems.map(m => [
    m.kind === 'message' ? m.msg_id : `d${m.timestamp}`,
    m.kind === 'message'
      ? messages[m.msg_id]
      : { id: `d${m.timestamp}`, ts: m.timestamp },
  ])
}
