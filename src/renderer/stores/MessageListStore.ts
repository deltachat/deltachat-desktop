import { C } from 'deltachat-node/dist/constants'
import React from 'react'
import { getLogger } from '../../shared/logger'
import {
  MetaMessage,
  MessageState,
  NormalMessage,
  MarkerOneParams,
} from '../../shared/shared-types'
import {
  isScrolledToBottom,
  messagesInView,
  rotateAwayFromIndex,
} from '../components/message/MessageList-Helpers'
import { DeltaBackend, sendMessageParams } from '../delta-remote'
import { ipcBackend } from '../ipc'
import {
  calculateIndexesForLastPage,
  calculateIndexesForPageAfter,
  calculateIndexesForPageBefore,
  calculateIndexesForPageWithMessageIdInMiddle,
  findPageWithMessageId,
  findPageWithMessageIndex,
  getUnreadMessageIdsAndMarkerOne,
  getUnreadMessageIdsMarkerOneAndMessageIds,
  loadPageWithFirstMessageIndex,
  loadPageWithMessageIndexInMiddle,
  parseMessageKey,
  safeMessageIdIndex,
  scrollToBottomAndCheckIfWeNeedToLoadMore,
  scrollToMessage,
  scrollToMessageAndCheckIfWeNeedToLoadMore,
  updateMessage,
  withoutPages,
} from './MessageListStore-Helpers'
import Store, {
  Action,
  OnlyDispatchIfCurrentlyDispatchedCounterEqualsZero,
} from './store2'

export const PAGE_SIZE = 20

export type MessageId = number
const log = getLogger('renderer/stores/MessageListStore')

export type MessageIds = Array<MessageId>

export type MessageListPage = {
  messageIds: MessageIds
  messages: MetaMessage[]
  firstMessageIdIndex: number
  lastMessageIdIndex: number
  key: string
}

export interface MessageListStoreState {
  pages: { [key: string]: MessageListPage }
  pageOrdering: string[]
  chatId: number
  messageIds: MessageId[]
  markerOne: MarkerOneParams
  unreadMessageIds: number[]
  loading: boolean
}

export function defaultMessageListStoreState(): MessageListStoreState {
  return {
    pages: {},
    pageOrdering: [],
    chatId: -1,
    messageIds: [],
    unreadMessageIds: [],
    loading: false,
    markerOne: {},
  }
}

export interface DispatchAfter {
  action: Action<MessageListStoreState, MessageListStoreContext>
  isLayoutEffect: boolean
}
export type DispatchesAfter = DispatchAfter[]

export type MessageListStoreContext = {
  messageListRef: React.MutableRefObject<HTMLDivElement>
  messageListWrapperRef: React.MutableRefObject<HTMLDivElement>
  messageListTopRef: React.MutableRefObject<HTMLDivElement>
  messageListBottomRef: React.MutableRefObject<HTMLDivElement>
}

class _MessageListStore extends Store<
  MessageListStoreState,
  MessageListStoreContext
> {
  public currentlyLoadingPage = false

  public ignoreDcEventMsgsChanged = 0
  updatePage(
    pageKey: string,
    updateObj: Partial<MessageListStoreState['pages']>
  ) {
    return {
      ...this.state,
      pages: {
        ...this.state.pages,
        [pageKey]: {
          ...this.state.pages[pageKey],
          ...updateObj,
        },
      },
    }
  }

  dispatchAfter(dispatchAfter: DispatchAfter) {
    dispatchAfter.isLayoutEffect
      ? this.pushLayoutEffect(dispatchAfter.action)
      : this.pushEffect(dispatchAfter.action)
  }

  dispatchesAfter(dispatchesAfter: DispatchesAfter) {
    if (!dispatchesAfter) return
    dispatchesAfter.forEach(this.dispatchAfter.bind(this))
  }

  selectChat(chatId: number) {
    return this.dispatch(
      'selectChat',
      async (state: MessageListStoreState, setState) => {
        log.debug('xxx0')
        const {
          unreadMessageIds,
          firstUnreadMessageId,
          messageIds,
          markerOne,
        } = await getUnreadMessageIdsMarkerOneAndMessageIds(chatId, {})

        let [pages, pageOrdering]: [
          MessageListStoreState['pages'],
          MessageListStoreState['pageOrdering']
        ] = [{}, []]

        if (messageIds.length === 0) {
          setState({
            pages,
            pageOrdering,
            chatId,
            messageIds,
            unreadMessageIds,
            markerOne,
            loading: false,
          })
          return
        }

        if (firstUnreadMessageId !== -1) {
          const firstUnreadMessageIdIndex = messageIds.indexOf(
            firstUnreadMessageId
          )

          const tmp = await loadPageWithMessageIndexInMiddle(
            chatId,
            messageIds,
            firstUnreadMessageIdIndex,
            markerOne
          )
          pages = tmp.pages
          pageOrdering = tmp.pageOrdering

          // We cannot focus messages with messageIdInex === C.DC_MSG_ID_DAYMARKER, therefore we focus
          // the first message before
          let messageIdIndexToFocus = Math.max(0, firstUnreadMessageIdIndex - 1)
          while (
            messageIdIndexToFocus === C.DC_MSG_ID_DAYMARKER &&
            messageIdIndexToFocus !== 0
          ) {
            messageIdIndexToFocus = Math.max(0, messageIdIndexToFocus - 1)
          }

          this.pushLayoutEffect(
            scrollToMessageAndCheckIfWeNeedToLoadMore(
              chatId,
              pageOrdering[0],
              messageIdIndexToFocus
            )
          )
        } else {
          const [
            firstMessageIdIndexOnLastPage,
            lastMessageIdIndexOnLastPage,
          ] = calculateIndexesForLastPage(messageIds)
          const tmp = await loadPageWithFirstMessageIndex(
            chatId,
            messageIds,
            firstMessageIdIndexOnLastPage,
            lastMessageIdIndexOnLastPage,
            markerOne
          )
          pages = tmp.pages
          pageOrdering = tmp.pageOrdering
          this.pushLayoutEffect(
            scrollToBottomAndCheckIfWeNeedToLoadMore(chatId)
          )
        }

        setState({
          pages,
          pageOrdering,
          chatId,
          messageIds,
          unreadMessageIds,
          markerOne,
          loading: false,
        })
      }
    )
  }

  async jumpToMessage(chatId: number, messageId: number) {
    return this.dispatch(
      'jumpToMessage',
      async (state: MessageListStoreState, setState) => {
        log.debug(`jumpToMessage: chatId: ${chatId} messageId: ${messageId}`)
        let { unreadMessageIds, messageIds, markerOne } = state
        if (chatId !== state.chatId) {
          const result = await getUnreadMessageIdsMarkerOneAndMessageIds(
            chatId,
            {}
          )
          unreadMessageIds = result.unreadMessageIds
          messageIds = result.messageIds
          markerOne = result.markerOne
        }

        const jumpToMessageIndex = messageIds.indexOf(messageId)
        const { pages, pageOrdering } = await loadPageWithMessageIndexInMiddle(
          chatId,
          messageIds,
          jumpToMessageIndex,
          markerOne
        )

        this.pushLayoutEffect(
          scrollToMessageAndCheckIfWeNeedToLoadMore(
            chatId,
            pageOrdering[0],
            jumpToMessageIndex
          )
        )

        setState({
          pages,
          pageOrdering,
          chatId,
          messageIds,
          unreadMessageIds,
          markerOne,
          loading: false,
        })
      }
    )
  }

  async loadPageBefore(
    chatId: number,
    withoutPageKeys: string[],
    dispatchesAfter?: DispatchesAfter
  ) {
    return this.dispatch(
      'loadPageBefore',
      async (state: MessageListStoreState, setState) => {
        if (chatId !== state.chatId) {
          log.debug(
            `loadPageBefore: chatId ${chatId} doesn't match with state.chatId ${state.chatId} returning`
          )
          return
        }
        const lastPage = state.pages[state.pageOrdering[0]]

        if (!lastPage) {
          log.debug(`loadPageBefore: couldn't find last page??? Returning`)
          return
        }

        const [
          firstMessageIdIndexOnPageBefore,
          lastMessageIndexOnPageBefore,
          noMorePagesFlag,
        ] = calculateIndexesForPageBefore(lastPage)

        if (noMorePagesFlag) {
          log.debug(`loadPageBefore: no more pages before, returning`)
          return
        }

        const { pageOrdering, pages } = await loadPageWithFirstMessageIndex(
          state.chatId,
          state.messageIds,
          firstMessageIdIndexOnPageBefore,
          lastMessageIndexOnPageBefore,
          state.markerOne
        )

        const modifiedState = withoutPages(this.state, withoutPageKeys)

        if (!dispatchesAfter) return
        this.dispatchesAfter(dispatchesAfter)
        setState({
          ...modifiedState,
          pageOrdering: [...pageOrdering, ...modifiedState.pageOrdering],
          pages: {
            ...modifiedState.pages,
            ...pages,
          },
        })
      },
      OnlyDispatchIfCurrentlyDispatchedCounterEqualsZero
    )
  }

  canLoadPageBefore(pageKey: string) {
    return this.state.pages[pageKey].firstMessageIdIndex > 0
  }

  canLoadPageAfter(pageKey: string) {
    return (
      this.state.pages[pageKey].lastMessageIdIndex <
      this.state.messageIds.length - 1
    )
  }

  async loadPageAfter(
    chatId: number,
    withoutPageKeys: string[],
    dispatchesAfter?: DispatchesAfter
  ) {
    return this.dispatch(
      'loadPageAfter',
      async (state: MessageListStoreState, setState) => {
        if (chatId !== state.chatId) {
          log.debug(
            `loadPageAfter: chatId ${chatId} doesn't match with state.chatId ${state.chatId} returning`
          )
          return
        }

        const lastPageKey = state.pageOrdering[state.pageOrdering.length - 1]
        const lastPage = state.pages[lastPageKey]
        if (!lastPage) {
          log.debug(`loadPageAfter: could not find last page, returning`)
          return
        }

        const [
          firstMessageIdIndexOnPageAfter,
          lastMessageIdIndexOnPageAfter,
          noMorePagesFlag,
        ] = calculateIndexesForPageAfter(lastPage, state.messageIds)

        if (noMorePagesFlag) {
          log.debug(`loadPageAfter: no more pages after, returning`)
          return
        }

        log.debug(
          `loadPageAfter: loading page with firstMessageIdIndexOnPageAfter: ${firstMessageIdIndexOnPageAfter} lastMessageIdIndexOnPageAfter: ${lastMessageIdIndexOnPageAfter}`
        )

        const { pageOrdering, pages } = await loadPageWithFirstMessageIndex(
          state.chatId,
          state.messageIds,
          firstMessageIdIndexOnPageAfter,
          lastMessageIdIndexOnPageAfter,
          this.state.markerOne
        )

        const modifiedState = withoutPages(this.state, withoutPageKeys)

        if(!dispatchesAfter) return

        this.dispatchesAfter(dispatchesAfter)
        setState({
          ...modifiedState,
          pageOrdering: [...modifiedState.pageOrdering, ...pageOrdering],
          pages: {
            ...modifiedState.pages,
            ...pages,
          },
        })
      },
      OnlyDispatchIfCurrentlyDispatchedCounterEqualsZero
    )
  }

  removePage(pageKey: string) {
    this.dispatch('removePage', async (state, setState) => {
      setState(withoutPages(state, [pageKey]))
    })
  }

  async sendMessage(chatId: number, messageParams: sendMessageParams) {
    this.dispatch('sendMessage', async (state, setState) => {
      this.ignoreDcEventMsgsChanged++
      const [messageId, _message] = await DeltaBackend.call(
        'messageList.sendMessage',
        chatId,
        messageParams
      )

      if (chatId !== state.chatId) return

      if (messageId === 0) {
        // Workaround for failed messages
        return
      }
      const {
        unreadMessageIds,
        messageIds,
        markerOne,
      } = await getUnreadMessageIdsMarkerOneAndMessageIds(
        chatId,
        state.markerOne
      )

      const lastMessageIndex = messageIds.length - 1
      const firstMessageIndex = safeMessageIdIndex(
        lastMessageIndex - PAGE_SIZE,
        messageIds.length
      )

      const { pages, pageOrdering } = await loadPageWithFirstMessageIndex(
        chatId,
        messageIds,
        firstMessageIndex,
        lastMessageIndex,
        markerOne
      )

      this.pushLayoutEffect(
        scrollToBottomAndCheckIfWeNeedToLoadMore(state.chatId)
      )

      const newState = {
        pages,
        pageOrdering,
        chatId,
        messageIds,
        unreadMessageIds,
        markerOne: state.markerOne,
        loading: false,
      }

      await setState(newState)
    })
  }

  refresh(
    chatId: number,
    messageIds: number[],
    firstMessageOnScreenIndex: number,
    relativeScrollPosition: number
  ) {
    this.dispatch(
      'refresh',
      async (state, setState, yourIncrementingDispatchedCounter) => {
        if (chatId !== state.chatId) {
          log.debug(
            `refresh: chatId doesn't equal currently selected chat. Returning.`
          )
          return
        }

        if (
          yourIncrementingDispatchedCounter !==
          this.incrementingDispatchedCounter
        ) {
          log.debug(`refresh: dispatchedCounter incremented, returning`)
          return
        }

        const {
          unreadMessageIds,
          markerOne,
        } = await getUnreadMessageIdsAndMarkerOne(chatId, state.markerOne)

        if (
          yourIncrementingDispatchedCounter !==
          this.incrementingDispatchedCounter
        ) {
          log.debug(`refresh: dispatchedCounter incremented, returning`)
          return
        }

        const [
          firstMessageIndex,
          lastMessageIndex,
        ] = calculateIndexesForPageWithMessageIdInMiddle(
          messageIds,
          firstMessageOnScreenIndex
        )

        const { pages, pageOrdering } = await loadPageWithFirstMessageIndex(
          chatId,
          messageIds,
          firstMessageIndex,
          lastMessageIndex,
          markerOne
        )

        if (
          yourIncrementingDispatchedCounter !==
          this.incrementingDispatchedCounter
        ) {
          log.debug(`refresh: dispatchedCounter incremented, returning`)
          return
        }

        const newState = {
          pages,
          pageOrdering,
          chatId,
          messageIds,
          unreadMessageIds,
          markerOne,
          loading: false,
        }

        if (relativeScrollPosition !== -1) {
          const { messageKey } = findPageWithMessageIndex(
            newState,
            firstMessageOnScreenIndex
          )
          this.pushLayoutEffect(
            scrollToMessage(chatId, messageKey, relativeScrollPosition)
          )
        } else {
          this.pushLayoutEffect(
            scrollToBottomAndCheckIfWeNeedToLoadMore(chatId)
          )
        }
        setState(newState)
      }
    )
  }
  onMessageDelivered(chatId: number, messageId: number) {
    this.dispatch('onMessageDelivered', async (state, setState) => {
      if (chatId !== state.chatId) {
        log.debug(
          `onMessageDelivered: chatId doesn't equal currently selected chat. Returning.`
        )
        return
      }
      const { pageKey, indexOnPage } = findPageWithMessageId(
        state,
        messageId,
        true
      )

      if (pageKey === null) {
        log.debug(
          `onMessageDelivered: Couldn't find messageId in any shown pages. Returning`
        )
        return
      }

      const message = state.pages[pageKey].messages[indexOnPage]

      setState(
        updateMessage(state, pageKey, indexOnPage, {
          ...message,
          state: MessageState.OUT_DELIVERED,
        } as NormalMessage)
      )
    })
  }

  onMessageFailed(chatId: number, messageId: number) {
    this.dispatch('onMessageFailed', async (state, setState) => {
      if (chatId !== state.chatId) {
        log.debug(
          `onMessageFailed: chatId doesn't equal currently selected chat. Returning.`
        )
        return
      }
      const { pageKey, indexOnPage } = findPageWithMessageId(
        state,
        messageId,
        true
      )

      if (pageKey === null) {
        log.debug(
          `onMessageFailed: Couldn't find messageId in any shown pages. Returning`
        )
        return
      }

      const message = state.pages[pageKey].messages[indexOnPage]

      setState(
        updateMessage(state, pageKey, indexOnPage, {
          ...message,
          state: MessageState.OUT_FAILED,
        } as NormalMessage)
      )
    })
  }

  onMessageRead(chatId: number, messageId: number) {
    this.dispatch('onMessageRead', async (state, setState) => {
      if (chatId !== state.chatId) {
        log.debug(
          `onMessageRead: chatId of event (${chatId}) doesn't match id of selected chat (${state.chatId}). Returning.`
        )
        return
      }
      const { pageKey, indexOnPage } = findPageWithMessageId(
        state,
        messageId,
        true
      )

      if (pageKey === null) {
        log.debug(
          `onMessageRead: Couldn't find messageId in any shown pages. Returning`
        )
        return
      }

      const message = state.pages[pageKey].messages[indexOnPage]

      setState(
        updateMessage(state, pageKey, indexOnPage, {
          ...message,
          state: MessageState.OUT_MDN_RCVD,
        } as NormalMessage)
      )
    })
  }

  markMessagesSeen(chatId: number, messageIds: number[]) {
    this.dispatch('markMessagesSeen', async (state, setState) => {
      if (chatId !== state.chatId) {
        log.debug(
          `markMessagesSeen: chatId of event (${chatId}) doesn't match id of selected chat (${state.chatId}). Returning.`
        )
        return
      }
      log.debug(
        `markMessagesSeen: chatId:(${chatId}) messageIds: ${JSON.stringify(
          messageIds
        )} unreadMessageIds: ${JSON.stringify(state.unreadMessageIds)}`
      )

      const markSeen = DeltaBackend.call(
        'messageList.markSeenMessages',
        messageIds
      )

      let update = false
      for (const messageId of messageIds) {
        const { pageKey } = findPageWithMessageId(state, messageId, true)
        if (pageKey === null) {
          log.debug(
            `markMessagesSeen: Couldn't find messageId in any shown pages. Returning`
          )
          continue
        }

        update = true
      }

      if (update) {
        await markSeen
        // Use this.state as it's possible that things changed during the await
        setState({
          ...this.state,
          unreadMessageIds: this.state.unreadMessageIds.filter(
            mId => messageIds.indexOf(mId) === -1
          ),
        })
      }
    })
  }

  async onMessagesChanged(context: MessageListStoreContext) {
    if (MessageListStore.ignoreDcEventMsgsChanged > 0) {
      MessageListStore.ignoreDcEventMsgsChanged--
      log.debug(
        'onMessagesChanged: MessageListSotre.ignoreDcEventMsgsChanged is > 0, so we do. returning'
      )
      return
    }
    const chatId = MessageListStore.state.chatId

    const scrollTop = context.messageListRef.current.scrollTop
    const scrollHeight = context.messageListRef.current.scrollHeight
    const wrapperHeight = context.messageListWrapperRef.current.clientHeight

    if (isScrolledToBottom(scrollTop, scrollHeight, wrapperHeight)) {
      MessageListStore.selectChat(chatId)
      return
    }

    const unreadMessageIds = await DeltaBackend.call(
      'messageList.getUnreadMessageIds',
      chatId
    )
    const firstUnreadMessageId =
      unreadMessageIds.length > 0 ? unreadMessageIds[0] : -1
    const marker1MessageId = firstUnreadMessageId || 0
    const marker1Counter = unreadMessageIds.length
    const markerOne = {
      ...MessageListStore.state.markerOne,
      [marker1MessageId]: marker1Counter,
    }

    const messageIds = await DeltaBackend.call(
      'messageList.getMessageIds',
      chatId,
      markerOne
    )

    for (const { messageElement, messageOffsetTop } of messagesInView(
      context.messageListRef
    )) {
      const id = messageElement.getAttribute('id')
      if (!id) continue
      const { messageId, messageIndex: oldMessageIndex } = parseMessageKey(id)

      const messageIndex = messageIds.indexOf(messageId)
      if (messageId <= 9 && oldMessageIndex !== messageIndex) {
        continue
      }

      if (messageIndex === -1) continue

      // Position of messageBottom on screen
      const relativeScrollPosition = scrollTop - messageOffsetTop

      if (MessageListStore.currentlyDispatchedCounter > 0) return
      MessageListStore.refresh(
        chatId,
        messageIds,
        messageIndex,
        relativeScrollPosition
      )

      return
    }

    const firstMessageInView = messagesInView(context.messageListRef).next()
      .value
    if (!firstMessageInView) {
      log.debug(
        `onMessagesChanged: No message in view. Should normally not happen. Let's just select the chat again?`
      )

      return this.selectChat(MessageListStore.state.chatId)
    }

    const id = firstMessageInView.messageElement.getAttribute('id')
    if (!id) return
    const { messageIndex: indexOfFirstMessageInView } = parseMessageKey(id)
    log.debug(
      `onMessagesChanged: No message in view is in changed messageIds. Trying to find closest still existing message. indexOfFirstMessageInView: ${indexOfFirstMessageInView}`
    )
    const oldMessageIds = MessageListStore.state.messageIds

    // Find closest still existing messageId and jump there
    for (const oldMessageIndex of rotateAwayFromIndex(
      indexOfFirstMessageInView,
      messageIds.length
    )) {
      const messageId = oldMessageIds[oldMessageIndex]
      const realMessageIndex = messageIds.indexOf(messageId)
      if (messageId <= 9 && oldMessageIndex !== realMessageIndex) {
        continue
      }

      if (realMessageIndex === -1) continue

      // In theory it would be better/more accurate to jump to the bottom if firstMessageIndexInView < indexOfFirstMessageInView
      // and to the top of the message if firstMessageIndexInView > indexOfFirstMessageInView
      // But this should be good enough for now
      MessageListStore.jumpToMessage(chatId, messageId)
      return
    }

    log.debug(
      'onMessagesChanged: Could not find a message to restore from. Reloading chat.'
    )
    MessageListStore.selectChat(chatId)
  }

  async deleteMessage(messageId: number) {
    this.dispatch('deleteMessage', async (_state, _setState) => {
      log.debug(`deleteMessage: deleting message with id ${messageId}`)
      DeltaBackend.call('messageList.deleteMessage', messageId)
    })
  }

  init() {
    ipcBackend.on('DC_EVENT_MSG_DELIVERED', (_evt, [chatId, messageId]) => {
      this.onMessageDelivered(chatId, messageId)
    })

    ipcBackend.on('DC_EVENT_MSG_FAILED', (_evt, [chatId, messageId]) => {
      this.onMessageFailed(chatId, messageId)
    })

    ipcBackend.on('DC_EVENT_MSG_READ', (_, [chatId, messageId]) => {
      this.onMessageRead(chatId, messageId)
    })
  }
}

const MessageListStore = new _MessageListStore(
  defaultMessageListStoreState(),
  'MessageListStore'
)

export default MessageListStore
