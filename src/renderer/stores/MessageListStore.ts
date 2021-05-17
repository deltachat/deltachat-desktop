import { C } from 'deltachat-node/dist/constants'
import { getLogger } from '../../shared/logger'
import {
  MessageType,
  MessageState,
  Message,
  MarkerOneParams,
} from '../../shared/shared-types'
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
  safeMessageIdIndex,
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

export class MessageListPage {
  messageIds: MessageIds
  messages: MessageType[]
  firstMessageIdIndex: number
  lastMessageIdIndex: number
  key: string
}

export interface PageStoreState {
  pages: { [key: string]: MessageListPage }
  pageOrdering: string[]
  chatId: number
  messageIds: MessageId[]
  markerOne: MarkerOneParams
  unreadMessageIds: number[]
  loading: boolean
}

export function defaultPageStoreState(): PageStoreState {
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
  action: Action
  isLayoutEffect: boolean
}
export type DispatchesAfter = DispatchAfter[]

export class PageStore extends Store<PageStoreState> {
  public currentlyLoadingPage = false

  public ignoreDcEventMsgsChanged = 0
  updatePage(pageKey: string, updateObj: Partial<PageStoreState['pages']>) {
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
      async (state: PageStoreState, setState) => {
        log.debug('xxx0')
        const {
          unreadMessageIds,
          firstUnreadMessageId,
          messageIds,
          markerOne,
        } = await getUnreadMessageIdsMarkerOneAndMessageIds(chatId, {})

        let [pages, pageOrdering]: [
          PageStoreState['pages'],
          PageStoreState['pageOrdering']
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

          this.pushLayoutEffect({
            type: 'SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
            payload: {
              pageKey: pageOrdering[0],
              messageIdIndex: messageIdIndexToFocus,
            },
            id: chatId,
          })
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
          this.pushLayoutEffect({
            type: 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
            payload: {},
            id: chatId,
          })
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
      async (state: PageStoreState, setState) => {
        log.debug(`jumpToMessage: chatId: ${chatId} messageId: ${messageId}`)
        const {
          unreadMessageIds,
          messageIds,
          markerOne,
        } = await getUnreadMessageIdsMarkerOneAndMessageIds(chatId, {})

        const jumpToMessageIndex = messageIds.indexOf(messageId)

        const { pages, pageOrdering } = await loadPageWithMessageIndexInMiddle(
          chatId,
          messageIds,
          jumpToMessageIndex,
          markerOne
        )

        this.pushLayoutEffect({
          type: 'SCROLL_TO_MESSAGE_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
          payload: {
            pageKey: pageOrdering[0],
            messageIdIndex: jumpToMessageIndex,
          },
          id: chatId,
        })

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
      async (state: PageStoreState, setState) => {
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
      async (state: PageStoreState, setState) => {
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

  sendMessage(chatId: number, messageParams: sendMessageParams) {
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

      this.pushLayoutEffect({
        type: 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
        payload: null,
        id: state.chatId,
      })

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
          this.pushLayoutEffect({
            type: 'SCROLL_TO_MESSAGE',
            payload: {
              messageKey,
              relativeScrollPosition,
            },
            id: state.chatId,
          })
        } else {
          this.pushLayoutEffect({
            type: 'SCROLL_TO_BOTTOM_AND_CHECK_IF_WE_NEED_TO_LOAD_MORE',
            payload: null,
            id: state.chatId,
          })
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
        } as Message)
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
        } as Message)
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
        } as Message)
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

  onMessagesChanged(chatId: number, messageId: number) {
    this.dispatch('onMessagesChanged', async (_state, _setState) => {
      log.debug(`onMessagesChanged: chatId: ${chatId} messageId: ${messageId}`)
    })
  }

  deleteMessage(messageId: number) {
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

const MessageListStore = new PageStore(
  defaultPageStoreState(),
  'MessageListStore'
)

export default MessageListStore
