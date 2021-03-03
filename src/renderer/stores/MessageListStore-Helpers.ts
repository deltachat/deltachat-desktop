import { MarkerOneParams, MessageType } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'
import { MessageListPage, PageStoreState, PAGE_SIZE } from './MessageListStore'

export async function loadPageWithFirstMessageIndex(
  chatId: number,
  messageIds: number[],
  startMessageIdIndex: number,
  endMessageIdIndex: number,
  markerOne: MarkerOneParams
): Promise<{
  pages: PageStoreState['pages']
  pageOrdering: PageStoreState['pageOrdering']
}> {
  if (
    startMessageIdIndex < 0 ||
    startMessageIdIndex >= messageIds.length ||
    endMessageIdIndex < startMessageIdIndex ||
    endMessageIdIndex >= messageIds.length
  ) {
    throw new Error(
      `_loadPageWithFirstMessage: pageFirstMessageIdIndex out of bound, returning startMessageIdIndex: ${startMessageIdIndex} endMessageIdIndex: ${endMessageIdIndex}`
    )
  }
  const messageId = messageIds[startMessageIdIndex]

  if (startMessageIdIndex === -1) {
    throw new Error(
      `_loadPageWithFirstMessage: messageId ${messageId} is not in messageIds`
    )
  }

  const pageMessageIds = messageIds.slice(
    startMessageIdIndex,
    endMessageIdIndex + 1
  )

  const pageMessages = await DeltaBackend.call(
    'messageList.getMessages',
    chatId,
    startMessageIdIndex,
    endMessageIdIndex,
    markerOne
  )

  const pageKey = calculatePageKey(startMessageIdIndex, endMessageIdIndex)

  return {
    pages: {
      [pageKey]: {
        firstMessageIdIndex: startMessageIdIndex,
        lastMessageIdIndex: endMessageIdIndex,
        messageIds: pageMessageIds,
        messages: pageMessages,
        key: pageKey,
      },
    },
    pageOrdering: [pageKey],
  }
}

export function calculateIndexesForPageWithMessageIdInMiddle(
  messageIds: number[],
  middleMessageIdIndex: number
): [number, number] {
  let firstMessageIdIndex = Math.max(middleMessageIdIndex - 3, 0)

  const currentDistance = middleMessageIdIndex - firstMessageIdIndex

  let remainingDistance = PAGE_SIZE - currentDistance
  const lastMessageIdIndex = Math.min(
    middleMessageIdIndex + remainingDistance,
    messageIds.length - 1
  )

  remainingDistance = lastMessageIdIndex - firstMessageIdIndex
  if (remainingDistance <= PAGE_SIZE) {
    firstMessageIdIndex = Math.max(firstMessageIdIndex - remainingDistance, 0)
  }

  return [firstMessageIdIndex, lastMessageIdIndex]
}

export function calculateIndexesForLastPage(messageIds: number[]) {
  const firstMessageIdIndexOnLastPage = Math.max(
    0,
    messageIds.length - PAGE_SIZE
  )
  const lastMessageIdIndexOnLastPage = Math.min(
    firstMessageIdIndexOnLastPage + PAGE_SIZE - 1,
    messageIds.length - 1
  )
  return [firstMessageIdIndexOnLastPage, lastMessageIdIndexOnLastPage]
}

export function calculateIndexesForPageBefore(
  page: MessageListPage
): [number, number, boolean] {
  const firstMessageIdIndexOnPage = page.firstMessageIdIndex

  const firstMessageIdIndexOnPageBefore = Math.max(
    0,
    firstMessageIdIndexOnPage - PAGE_SIZE
  )

  if (firstMessageIdIndexOnPageBefore === firstMessageIdIndexOnPage) {
    return [-1, -1, true]
  }

  const lastMessageIndexOnPageBefore = Math.min(
    firstMessageIdIndexOnPage + PAGE_SIZE,
    page.firstMessageIdIndex - 1
  )

  return [firstMessageIdIndexOnPageBefore, lastMessageIndexOnPageBefore, false]
}

export function calculateIndexesForPageAfter(
  page: MessageListPage,
  messageIds: number[]
): [number, number, boolean] {
  const lastMessageIdIndexOnPage = page.lastMessageIdIndex

  const firstMessageIdIndexOnPageAfter = Math.min(
    messageIds.length - 1,
    lastMessageIdIndexOnPage + 1
  )

  if (firstMessageIdIndexOnPageAfter === lastMessageIdIndexOnPage) {
    return [-1, -1, true]
  }

  const lastMessageIdIndexOnPageAfter = Math.min(
    firstMessageIdIndexOnPageAfter + PAGE_SIZE - 1,
    messageIds.length - 1
  )

  return [firstMessageIdIndexOnPageAfter, lastMessageIdIndexOnPageAfter, false]
}

export async function loadPageWithMessageIndexInMiddle(
  chatId: number,
  messageIds: number[],
  middleMessageIdIndex: number,
  markerOne: MarkerOneParams
) {
  const [
    firstMessageIdIndex,
    lastMessageIdIndex,
  ] = calculateIndexesForPageWithMessageIdInMiddle(
    messageIds,
    middleMessageIdIndex
  )

  return await loadPageWithFirstMessageIndex(
    chatId,
    messageIds,
    firstMessageIdIndex,
    lastMessageIdIndex,
    markerOne
  )
}

export function withoutPages(
  state: PageStoreState,
  withoutPageKeys: string[]
): PageStoreState {
  const pages: Partial<PageStoreState['pages']> = {}
  const pageOrdering: Partial<PageStoreState['pageOrdering']> = []

  let modified = false
  for (const pageKey of state.pageOrdering) {
    const without = withoutPageKeys.indexOf(pageKey) !== -1

    if (without) continue
    modified = true
    pages[pageKey] = state.pages[pageKey]
    pageOrdering.push(pageKey)
  }

  if (!modified) return state

  return {
    ...state,
    pageOrdering,
    pages,
  }
}

export function indexOfMessageId(
  state: PageStoreState,
  messageId: number,
  iterateFromback?: boolean
): number {
  iterateFromback = iterateFromback === true
  const messageIdsLength = state.messageIds.length
  for (
    let i = iterateFromback ? messageIdsLength - 1 : 0;
    iterateFromback ? i >= 0 : i < messageIdsLength;
    iterateFromback ? i-- : i++
  ) {
    if (state.messageIds[i] === messageId) {
      return i
    }
  }
  return -1
}

export function findPageWithMessageId(
  state: PageStoreState,
  messageId: number,
  iterateFromback?: boolean
): {
  pageKey: string
  indexOnPage: number
  messageIdIndex: number
  messageKey: string
} {
  const messageIdIndex = indexOfMessageId(state, messageId, iterateFromback)

  return findPageWithMessageIndex(state, messageIdIndex)
}

export function findPageWithMessageIndex(
  state: PageStoreState,
  messageIdIndex: number
): {
  pageKey: string
  indexOnPage: number
  messageIdIndex: number
  messageKey: string
} {
  let pageKey: string = null
  let indexOnPage = -1

  const messageId = state.messageIds[messageIdIndex]
  if (messageIdIndex !== -1) {
    for (const currentPageKey of state.pageOrdering) {
      const currentPage = state.pages[currentPageKey]
      if (
        messageIdIndex >= currentPage.firstMessageIdIndex &&
        messageIdIndex <= currentPage.lastMessageIdIndex
      ) {
        pageKey = currentPageKey
        indexOnPage = messageIdIndex - currentPage.firstMessageIdIndex
        break
      }
    }
  }

  return {
    pageKey,
    indexOnPage,
    messageIdIndex,
    messageKey: calculateMessageKey(pageKey, messageId, messageIdIndex),
  }
}

export function updateMessage(
  state: PageStoreState,
  pageKey: string,
  indexOnPage: number,
  updatedMessage: MessageType
): PageStoreState {
  return {
    ...state,
    pages: {
      ...state.pages,
      [pageKey]: {
        ...state.pages[pageKey],
        messages: [
          ...state.pages[pageKey].messages.slice(0, indexOnPage),
          updatedMessage,
          ...state.pages[pageKey].messages.slice(indexOnPage + 1),
        ],
      },
    },
  }
}

export function calculatePageKey(
  firstMessageIdIndex: number | string,
  lastMessageIdIndex: number | string
): string {
  return `page-${firstMessageIdIndex}-${lastMessageIdIndex}`
}
export function calculateMessageKey(
  pageKey: string,
  messageId: number,
  messageIndex: number
): string {
  return pageKey + '-' + messageId + '-' + messageIndex
}

export function parseMessageKey(
  messageKey: string
): {
  pageKey: string
  messageId: number
  messageIndex: number
} {
  const splittedMessageKey = messageKey.split('-')
  if (splittedMessageKey[0] !== 'page' && splittedMessageKey.length === 5) {
    throw new Error('Expected a proper messageKey')
  }
  return {
    pageKey: calculatePageKey(splittedMessageKey[1], splittedMessageKey[2]),
    messageId: Number.parseInt(splittedMessageKey[3]),
    messageIndex: Number.parseInt(splittedMessageKey[4]),
  }
}

export async function getUnreadMessageIdsMarkerOneAndMessageIds(
  chatId: number,
  oldMarkerOne: MarkerOneParams
) {
  const {
    unreadMessageIds,
    firstUnreadMessageId,
    markerOne,
  } = await getUnreadMessageIdsAndMarkerOne(chatId, oldMarkerOne)

  const messageIds = await DeltaBackend.call(
    'messageList.getMessageIds',
    chatId,
    markerOne
  )

  return { unreadMessageIds, firstUnreadMessageId, messageIds, markerOne }
}

export async function getUnreadMessageIdsAndMarkerOne(
  chatId: number,
  oldMarkerOne: MarkerOneParams
) {
  const unreadMessageIds = await DeltaBackend.call(
    'messageList.getUnreadMessageIds',
    chatId
  )
  const firstUnreadMessageId =
    unreadMessageIds.length > 0 ? unreadMessageIds[0] : -1

  const marker1MessageId = firstUnreadMessageId || 0
  const marker1MessageCount = unreadMessageIds.length
  const markerOne = { ...oldMarkerOne, [marker1MessageId]: marker1MessageCount }

  return { unreadMessageIds, firstUnreadMessageId, markerOne }
}

export function safeMessageIdIndex(
  messageIdIndex: number,
  messageIdsLength: number
) {
  if (messageIdIndex < 0) {
    return 0
  } else if (messageIdIndex > messageIdsLength - 1) {
    return messageIdsLength - 1
  }
  return messageIdIndex
}
