// test-env must be the first import: it installs the fake DOM and the fake
// Runtime (`window.r`) that app modules read at import time.
import {
  fakeMessageListElement,
  getRpcCalls,
  resetTestEnv,
  setSelectedAccountId,
  stubRpc,
  tick,
} from '../helpers/test-env.js'

import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'
import { C, type T } from '@deltachat/jsonrpc-client'

import { MessageListStore } from '../../stores/messagelist.js'

const ACCOUNT_ID = 1
const CHAT_ID = 1010

// PAGE_SIZE in stores/messagelist.ts
const PAGE_SIZE = 11
// A window is `before + 1 + after` messages, see `getMessageWindow`.
const FIRST_PAGE = PAGE_SIZE + 1
const JUMP_PAGE = 2 * Math.ceil(PAGE_SIZE / 2) + 1

/**
 * Message ids must be > 9 (`DC_MSG_ID_LAST_SPECIAL`), lower ids are
 * special/daymarker ids. With `makeIds(30)` the id of the message at
 * position `i` of the chat is `10 + i`.
 */
function makeIds(count: number, startId = 10): number[] {
  return Array.from({ length: count }, (_, i) => startId + i)
}

/** The `timestamp` column of a message, one hour apart per message. */
function timestampOf(msgId: number): number {
  return 1_700_000_000 + (msgId - 10) * 3600
}

function makeMessage(id: number, overrides: { [key: string]: any } = {}) {
  return {
    kind: 'message',
    id,
    chatId: CHAT_ID,
    state: C.DC_STATE_OUT_DELIVERED,
    text: `message ${id}`,
    ...overrides,
  } as any as T.MessageLoadResult
}

/**
 * Stubs the RPC methods the store needs, simulating a chat containing the
 * given message ids, oldest first. Returned `setMessages` simulates the chat
 * content changing in core (takes effect on the next window request).
 */
function setupChat(ids: number[], opts: { firstUnread?: number } = {}) {
  let chatIds = [...ids]
  const timestamps = new Map<number, number>()
  const timestampOfMessage = (msgId: number) =>
    timestamps.get(msgId) ?? timestampOf(msgId)

  stubRpc('getFirstUnreadMessageOfChat', async () => opts.firstUnread ?? null)
  stubRpc('getMessages', async (_accountId: number, msgIds: number[]) =>
    Object.fromEntries(msgIds.map(id => [id, makeMessage(id)]))
  )
  stubRpc('getMessage', async (_accountId: number, id: number) =>
    makeMessage(id, { sortTimestamp: timestampOfMessage(id) } as any)
  )
  stubRpc('getBasicChatInfo', async () => ({ archived: false }) as any)
  stubRpc('getExistingMsgIds', async (_accountId: number, msgIds: number[]) =>
    msgIds.filter(id => chatIds.includes(id))
  )
  // The same keyset window as `chat::get_chat_msgs_window()` in core.
  stubRpc(
    'getMessageWindow',
    async (
      _accountId: number,
      _chatId: number,
      anchorMsgId: number | null,
      before: number,
      after: number
    ): Promise<T.MessageWindow> => {
      let anchorIndex: number
      if (anchorMsgId == null) {
        // Anchor at the newest message; `after` has no effect then.
        anchorIndex = chatIds.length - 1
        after = 0
      } else {
        anchorIndex = chatIds.indexOf(anchorMsgId)
        if (anchorIndex === -1) {
          throw new Error(
            `${anchorMsgId} is not a visible message of ${CHAT_ID}`
          )
        }
      }
      if (anchorIndex < 0) {
        return {
          items: [],
          prevTimestamp: null,
          hasOlder: false,
          hasNewer: false,
        }
      }

      const start = Math.max(anchorIndex - before, 0)
      const end = Math.min(anchorIndex + after, chatIds.length - 1)
      return {
        items: chatIds.slice(start, end + 1).map(msgId => ({
          msgId,
          timestamp: timestampOfMessage(msgId),
        })),
        prevTimestamp:
          start > 0 ? timestampOfMessage(chatIds[start - 1]!) : null,
        hasOlder: start > 0,
        hasNewer: end < chatIds.length - 1,
      }
    }
  )

  return {
    setMessages: (newIds: number[]) => {
      chatIds = [...newIds]
    },
    setTimestamp: (msgId: number, timestamp: number) => {
      timestamps.set(msgId, timestamp)
    },
  }
}

async function makeLoadedStore(
  ids: number[],
  opts: { firstUnread?: number } = {}
) {
  const chat = setupChat(ids, opts)
  const store = new MessageListStore(ACCOUNT_ID, CHAT_ID)
  await store.effect.loadChat()
  return { store, ...chat }
}

/**
 * Emulates the MessageList component's contract: after a `viewState`
 * change it applies the scroll position and calls `unlockScroll()`.
 * Without this, subsequent `lockedEffect`s are silently dropped.
 */
async function emulateScrollDone(store: MessageListStore) {
  store.reducer.unlockScroll()
  await tick()
}

function cachedIds(store: MessageListStore): number[] {
  return Object.keys(store.state.messageCache)
    .map(Number)
    .sort((a, b) => a - b)
}

/** The timestamps of the loaded window, oldest first. */
function loadedTimestamps(store: MessageListStore): number[] {
  return store.state.loadedMessageIds.map(
    msgId => store.state.loadedTimestamps[msgId]!
  )
}

describe('MessageListStore', () => {
  beforeEach(() => {
    resetTestEnv()
    setSelectedAccountId(ACCOUNT_ID)
  })

  describe('loadChat', () => {
    it('loads the newest page of a long chat and scrolls to bottom', async () => {
      const { store } = await makeLoadedStore(makeIds(30)) // ids 10..39

      expect(store.state.loaded).to.equal(true)
      // only the window is loaded, not the whole chat
      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(FIRST_PAGE, 40 - FIRST_PAGE)
      )
      expect(store.state.hasOlder).to.equal(true)
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.prevTimestamp).to.equal(timestampOf(39 - FIRST_PAGE))
      expect(loadedTimestamps(store)).to.deep.equal(
        store.state.loadedMessageIds.map(timestampOf)
      )
      expect(cachedIds(store)).to.deep.equal(store.state.loadedMessageIds)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToBottom',
        ifClose: false,
      })
    })

    it('never asks for all message ids of the chat', async () => {
      await makeLoadedStore(makeIds(30))

      // `getMessageIds` is not stubbed, so a call would have rejected,
      // but let's say it explicitly.
      expect(getRpcCalls('getMessageIds')).to.have.length(0)
      expect(getRpcCalls('getMessageWindow')).to.have.length(1)
    })

    it('loads all messages of a chat smaller than one page', async () => {
      const { store } = await makeLoadedStore(makeIds(3))

      expect(store.state.loadedMessageIds).to.deep.equal([10, 11, 12])
      expect(store.state.hasOlder).to.equal(false)
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.prevTimestamp).to.equal(undefined)
      expect(cachedIds(store)).to.deep.equal([10, 11, 12])
    })

    it('handles an empty chat', async () => {
      const { store } = await makeLoadedStore([])

      expect(store.state.loaded).to.equal(true)
      expect(store.state.loadedMessageIds).to.have.length(0)
      expect(store.state.hasOlder).to.equal(false)
      expect(store.state.hasNewer).to.equal(false)
      expect(getRpcCalls('getMessages')).to.have.length(0)
    })

    it('jumps to the first unread message, centering it', async () => {
      const { store } = await makeLoadedStore(makeIds(30), {
        firstUnread: 25,
      })

      // half page = 6 on each side of message 25
      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(JUMP_PAGE, 19))
      expect(store.state.hasOlder).to.equal(true)
      expect(store.state.hasNewer).to.equal(true)
      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(25)
      expect(scrollTo.highlight).to.equal(true)
      expect(scrollTo.focus).to.equal(false)
      expect(scrollTo.scrollIntoViewArg).to.deep.equal({ block: 'center' })
    })

    it('does not extend the window past the end of the chat', async () => {
      // message 38 is the second newest one
      const { store } = await makeLoadedStore(makeIds(30), {
        firstUnread: 38,
      })

      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(8, 32))
      expect(store.state.hasNewer).to.equal(false)
    })

    it('honors window.__internal_jump_to_message_asap', async () => {
      setupChat(makeIds(30))
      ;(window as any).__internal_jump_to_message_asap = {
        accountId: ACCOUNT_ID,
        chatId: CHAT_ID,
        jumpToMessageArgs: [{ msgId: 25, highlight: false, focus: false }],
      }
      const store = new MessageListStore(ACCOUNT_ID, CHAT_ID)
      await store.effect.loadChat()

      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(25)
      expect(scrollTo.highlight).to.equal(false)
      expect((window as any).__internal_jump_to_message_asap).to.equal(
        undefined
      )
      expect(getRpcCalls('getFirstUnreadMessageOfChat')).to.have.length(0)
    })
  })

  describe('fetchMoreMessagesTop / fetchMoreMessagesBottom', () => {
    it('prepends an older page and anchors the scroll position', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      fakeMessageListElement.scrollHeight = 2222
      fakeMessageListElement.scrollTop = 11

      const result = await store.effect.fetchMoreMessagesTop()

      expect(result).to.equal(true)
      // PAGE_SIZE older messages, the window stays contiguous
      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(FIRST_PAGE + PAGE_SIZE, 40 - FIRST_PAGE - PAGE_SIZE)
      )
      expect(store.state.hasOlder).to.equal(true)
      expect(store.state.prevTimestamp).to.equal(
        timestampOf(39 - FIRST_PAGE - PAGE_SIZE)
      )
      expect(loadedTimestamps(store)).to.deep.equal(
        store.state.loadedMessageIds.map(timestampOf)
      )
      expect(cachedIds(store)).to.deep.equal(store.state.loadedMessageIds)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToLastKnownPosition',
        lastKnownScrollHeight: 2222,
        lastKnownScrollTop: 11,
        appendedOn: 'top',
      })
    })

    it('drops further fetches until the MessageList unlocks the scroll', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      await store.effect.fetchMoreMessagesTop()
      expect(store.scheduler.isLocked('scroll')).to.equal(true)
      const loadedBefore = store.state.loadedMessageIds

      // scroll is still locked: this one must be dropped
      const result = await store.effect.fetchMoreMessagesTop()
      expect(result).to.equal(false)
      expect(store.state.loadedMessageIds).to.equal(loadedBefore)

      // after the component is done scrolling, fetching works again
      await emulateScrollDone(store)
      await store.effect.fetchMoreMessagesTop()
      // FIRST_PAGE + 2 * PAGE_SIZE is more than the chat has
      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(30))
      expect(store.state.hasOlder).to.equal(false)
    })

    it('reaches the start of the chat and stops there', async () => {
      const { store } = await makeLoadedStore(makeIds(FIRST_PAGE + 3))
      await emulateScrollDone(store)

      expect(await store.effect.fetchMoreMessagesTop()).to.equal(true)
      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(FIRST_PAGE + 3)
      )
      expect(store.state.hasOlder).to.equal(false)
      expect(store.state.prevTimestamp).to.equal(undefined)

      await emulateScrollDone(store)
      const result = await store.effect.fetchMoreMessagesTop()

      expect(result).to.equal(false)
      // the effect must unlock itself, otherwise all future
      // lockedEffects would be dropped
      expect(store.scheduler.isLocked('scroll')).to.equal(false)
    })

    it('does nothing at the oldest message and releases the scroll lock', async () => {
      const { store } = await makeLoadedStore(makeIds(5))
      await emulateScrollDone(store)

      const result = await store.effect.fetchMoreMessagesTop()

      expect(result).to.equal(false)
      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(5))
      expect(store.scheduler.isLocked('scroll')).to.equal(false)
    })

    it('appends a newer page after jumping into the middle of a chat', async () => {
      const { store } = await makeLoadedStore(makeIds(50))
      await emulateScrollDone(store)
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)
      expect(store.state.hasNewer).to.equal(true)

      const result = await store.effect.fetchMoreMessagesBottom()

      expect(result).to.equal(true)
      // window 19..31 plus PAGE_SIZE newer messages
      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(JUMP_PAGE + PAGE_SIZE, 19)
      )
      expect(store.state.hasNewer).to.equal(true)
      expect(cachedIds(store)).to.deep.equal(store.state.loadedMessageIds)
      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToLastKnownPosition')
      expect(scrollTo.appendedOn).to.equal('bottom')
    })

    it('reaches the end of the chat and stops there', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      // the window is 14..26, the chat ends at 39
      await store.effect.jumpToMessage({ msgId: 20, focus: false })
      await emulateScrollDone(store)
      expect(store.state.hasNewer).to.equal(true)

      while (store.state.hasNewer) {
        expect(await store.effect.fetchMoreMessagesBottom()).to.equal(true)
        await emulateScrollDone(store)
      }

      // paging down loaded the rest of the chat, without gaps
      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(26, 14))
      const result = await store.effect.fetchMoreMessagesBottom()

      expect(result).to.equal(false)
      expect(store.scheduler.isLocked('scroll')).to.equal(false)
    })

    it('does nothing at the newest message', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      const windowCallsBefore = getRpcCalls('getMessageWindow').length

      const result = await store.effect.fetchMoreMessagesBottom()

      expect(result).to.equal(false)
      expect(getRpcCalls('getMessageWindow')).to.have.length(windowCallsBefore)
      expect(store.scheduler.isLocked('scroll')).to.equal(false)
    })
  })

  describe('incoming messages', () => {
    it('appends new messages and scrolls down when the newest ones are shown', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      setMessages(makeIds(31)) // new message id 40
      await store.effect.onEventIncomingMessage()

      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(FIRST_PAGE + 1, 40 - FIRST_PAGE)
      )
      expect(store.state.loadedTimestamps[40]).to.equal(timestampOf(40))
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.messageCache[40]).to.not.equal(undefined)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToBottom',
        ifClose: true,
      })
    })

    it('needs no extra request for a message at the end of the chat', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      const windowCalls = getRpcCalls('getMessageWindow').length

      setMessages(makeIds(31)) // new message id 40
      await store.effect.onEventIncomingMessage(40)

      expect(store.state.loadedMessageIds).to.include(40)
      expect(getRpcCalls('getMessageWindow')).to.have.length(windowCalls + 1)
    })

    it('handles the first message arriving in an empty chat', async () => {
      const { store, setMessages } = await makeLoadedStore([])
      await emulateScrollDone(store)

      setMessages([10])
      await store.effect.onEventIncomingMessage()

      expect(store.state.loadedMessageIds).to.deep.equal([10])
      expect(store.state.messageCache[10]).to.not.equal(undefined)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToBottom',
        ifClose: true,
      })
    })

    it('does not extend the window when the user is scrolled up', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      // scroll up: the newest messages are no longer part of the window
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)
      const loadedBefore = store.state.loadedMessageIds

      setMessages(makeIds(31))
      await store.effect.onEventIncomingMessage()

      // the "jump down" button covers this case, there is nothing to append to
      expect(store.state.loadedMessageIds).to.equal(loadedBefore)
      expect(store.state.messageCache[40]).to.equal(undefined)
      expect(store.state.hasNewer).to.equal(true)
    })

    /** Ids 10..39 with the delayed message 100 sorted right after `afterId`. */
    function withDelayedMessage(afterId: number) {
      const ids = makeIds(30)
      ids.splice(ids.indexOf(afterId) + 1, 0, 100)
      return ids
    }

    it('inserts a delayed message into the window', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      await emulateScrollDone(store)
      fakeMessageListElement.scrollTop = 123
      const loadedBefore = store.state.loadedMessageIds

      setMessages(withDelayedMessage(35))
      setTimestamp(100, timestampOf(35) + 1)
      await store.effect.onEventIncomingMessage(100)

      const expected = [...loadedBefore]
      expected.splice(expected.indexOf(35) + 1, 0, 100)
      expect(store.state.loadedMessageIds).to.deep.equal(expected)
      expect(store.state.messageCache[100]).to.not.equal(undefined)
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToPosition',
        scrollTop: 123,
      })
    })

    it('inserts a delayed message while the scroll is locked', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      // no `emulateScrollDone()`: the scroll is still locked

      setMessages(withDelayedMessage(35))
      setTimestamp(100, timestampOf(35) + 1)
      await store.effect.onEventIncomingMessage(100)

      expect(store.state.loadedMessageIds).to.include(100)
    })

    it('inserts a delayed message when the user is scrolled up', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      await emulateScrollDone(store)
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)
      const loadedBefore = store.state.loadedMessageIds

      setMessages(withDelayedMessage(25))
      setTimestamp(100, timestampOf(25) + 1)
      await store.effect.onEventIncomingMessage(100)

      expect(store.state.loadedMessageIds).to.include.members(loadedBefore)
      expect(store.state.loadedMessageIds).to.include(100)
      expect(store.state.hasNewer).to.equal(true)
    })

    it('ignores a delayed message older than the window', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      await emulateScrollDone(store)
      const loadedBefore = store.state.loadedMessageIds

      setMessages(withDelayedMessage(15))
      setTimestamp(100, timestampOf(15) + 1)
      await store.effect.onEventIncomingMessage(100)

      expect(store.state.loadedMessageIds).to.equal(loadedBefore)
    })

    it('does not fail on a hidden message', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      const loadedBefore = store.state.loadedMessageIds

      await store.effect.onEventIncomingMessage(100)

      expect(store.state.loadedMessageIds).to.equal(loadedBefore)
    })

    it('does not append a message that is already loaded', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      await emulateScrollDone(store)

      // the newest message moved back behind its predecessor
      setMessages([...makeIds(28), 39, 38])
      setTimestamp(39, timestampOf(38) - 1)
      await store.effect.onEventIncomingMessage()

      const ids = store.state.loadedMessageIds
      expect(new Set(ids).size).to.equal(ids.length)
    })
  })

  describe('onEventMessagesChanged', () => {
    it('reorders the window when a timestamp changed', async () => {
      const { store, setMessages, setTimestamp } = await makeLoadedStore(
        makeIds(30)
      )
      await emulateScrollDone(store)

      setMessages([...makeIds(28), 39, 38])
      setTimestamp(39, timestampOf(38) - 1)
      await store.effect.onEventMessagesChanged(39)

      expect(store.state.loadedMessageIds.slice(-2)).to.deep.equal([39, 38])
      expect(store.state.loadedTimestamps[39]).to.equal(timestampOf(38) - 1)
    })

    it('reloads a message of the window without reloading the window', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      const windowCallsBefore = getRpcCalls('getMessageWindow').length
      stubRpc('getMessage', async (_accountId: number, id: number) =>
        makeMessage(id, {
          text: 'edited',
          sortTimestamp: timestampOf(id),
        } as any)
      )

      await store.effect.onEventMessagesChanged(39)

      expect((store.state.messageCache[39] as any).text).to.equal('edited')
      expect(getRpcCalls('getMessageWindow')).to.have.length(windowCallsBefore)
    })

    it('ignores changes to draft messages', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      const windowCallsBefore = getRpcCalls('getMessageWindow').length
      stubRpc('getMessage', async (_accountId: number, id: number) =>
        makeMessage(id, { state: C.DC_STATE_OUT_DRAFT })
      )

      await store.effect.onEventMessagesChanged(500)

      expect(store.state.messageCache[500]).to.equal(undefined)
      expect(getRpcCalls('getMessageWindow')).to.have.length(windowCallsBefore)
    })

    it('appends unknown non-draft messages like incoming ones', async () => {
      // e.g. info messages ("group name changed") fire MsgsChanged
      // without IncomingMsg
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      setMessages(makeIds(31))
      await store.effect.onEventMessagesChanged(40)

      expect(store.state.loadedMessageIds).to.contain(40)
      expect(store.state.messageCache[40]).to.not.equal(undefined)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToBottom',
        ifClose: true,
      })
    })
  })

  describe('setMessageState', () => {
    it('updates the state of a cached message', async () => {
      const { store } = await makeLoadedStore(makeIds(30))

      store.reducer.setMessageState(39, C.DC_STATE_OUT_MDN_RCVD)

      expect((store.state.messageCache[39] as any).state).to.equal(
        C.DC_STATE_OUT_MDN_RCVD
      )
    })

    it('is a no-op for messages outside the loaded window', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      const stateBefore = store.state

      // message 10 is the oldest one, far outside the loaded window
      store.reducer.setMessageState(10, C.DC_STATE_OUT_MDN_RCVD)

      expect(store.state).to.equal(stateBefore)
    })
  })

  describe('jumpToMessage', () => {
    it('centers the window around the target message', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      await store.effect.jumpToMessage({ msgId: 25, focus: false })

      // message 25 ± 6
      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(JUMP_PAGE, 19))
      expect(store.state.hasOlder).to.equal(true)
      expect(store.state.hasNewer).to.equal(true)
      expect(store.state.prevTimestamp).to.equal(timestampOf(18))
      // the cache is bounded to the new window
      expect(cachedIds(store)).to.deep.equal(store.state.loadedMessageIds)
      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(25)
      expect(scrollTo.highlight).to.equal(true)
    })

    it('keeps the loaded window when the message is already in it', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      await store.effect.fetchMoreMessagesTop()
      await emulateScrollDone(store)
      const loadedBefore = store.state.loadedMessageIds
      const windowCallsBefore = getRpcCalls('getMessageWindow').length

      await store.effect.jumpToMessage({ msgId: 30, focus: false })

      // no reload, and the messages the user scrolled to are kept
      expect(getRpcCalls('getMessageWindow')).to.have.length(windowCallsBefore)
      expect(store.state.loadedMessageIds).to.deep.equal(loadedBefore)
      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(30)
    })

    it('pushes to the jump stack and pops it when jumping down', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      // e.g. clicking a quote of message 15 while reading message 39
      await store.effect.jumpToMessage({
        msgId: 15,
        addMessageIdToStack: 39,
        focus: false,
      })
      expect(store.state.jumpToMessageStack).to.deep.equal([39])
      expect(store.state.loadedMessageIds).to.contain(15)
      await emulateScrollDone(store)

      // "jump down" button: back to message 39
      await store.effect.jumpToMessage({ msgId: undefined, focus: false })
      expect(store.state.jumpToMessageStack).to.deep.equal([])
      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(39)
      expect(store.state.loadedMessageIds).to.contain(39)
      expect(store.state.hasNewer).to.equal(false)
    })

    it('jumps to the last message without highlight when the stack is empty', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      // scroll up, so that the newest message is not loaded
      await store.effect.jumpToMessage({ msgId: 20, focus: false })
      await emulateScrollDone(store)

      await store.effect.jumpToMessage({ msgId: undefined, focus: false })

      const scrollTo = store.state.viewState.scrollTo as any
      expect(scrollTo.type).to.equal('scrollToMessage')
      expect(scrollTo.msgId).to.equal(39)
      expect(scrollTo.highlight).to.equal(false)
      expect(store.state.hasNewer).to.equal(false)
    })

    it('falls back to the last message for unknown ids', async () => {
      const { store } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)

      await store.effect.jumpToMessage({ msgId: 9999, focus: false })

      // the newest messages of the chat are shown
      expect(store.state.loadedMessageIds).to.deep.equal(
        makeIds(FIRST_PAGE, 40 - FIRST_PAGE)
      )
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.loaded).to.equal(true)
    })
  })

  describe('refresh', () => {
    it('keeps the window where it is and keeps the scroll position', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)
      fakeMessageListElement.scrollTop = 123

      setMessages(makeIds(29)) // the newest message got deleted
      await store.effect.refresh()

      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(JUMP_PAGE, 19))
      expect(store.state.loaded).to.equal(true)
      expect(store.state.viewState.scrollTo).to.deep.equal({
        type: 'scrollToPosition',
        scrollTop: 123,
      })
    })

    it('re-anchors the window when its middle message was deleted', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)

      // the window is 19..31, its middle message 25 is gone
      setMessages(makeIds(30).filter(id => id !== 25))
      await store.effect.refresh()

      expect(store.state.loadedMessageIds).to.not.contain(25)
      expect(store.state.loadedMessageIds).to.contain(19)
      expect(store.state.loadedMessageIds).to.contain(31)
      expect(store.state.loaded).to.equal(true)
    })

    it('falls back to the newest messages when the window is gone', async () => {
      const { store, setMessages } = await makeLoadedStore(makeIds(30))
      await emulateScrollDone(store)
      await store.effect.jumpToMessage({ msgId: 25, focus: false })
      await emulateScrollDone(store)

      // every message the window contained (19..31) is deleted
      setMessages(makeIds(5))
      await store.effect.refresh()

      expect(store.state.loadedMessageIds).to.deep.equal(makeIds(5))
      expect(store.state.hasNewer).to.equal(false)
      expect(store.state.loaded).to.equal(true)
    })
  })
})
