import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ActionEmitter, KeybindAction } from '../keybindings'
import { markChatAsSeen, saveLastChatId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

import type { RefObject, PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'
import { useRpcFetch } from '../hooks/useFetch'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('ChatContext')

export type SelectChat = (
  nextAccountId: number,
  chatId: number
) => Promise<boolean>

export type UnselectChat = () => void

export type ChatContextValue = {
  /**
   * `withLinger` means that after `selectChat()` the value of `chatWithLinger`
   * does not change immediately (unlike `chatId`),
   * until the new chat's info gets loaded.
   */
  chatWithLinger?: T.FullChat
  chatNoLinger?: T.FullChat
  loadingChat: boolean
  chatId?: number
  // The resolve value of the promise is unused at the time of writing.
  // And the Promise itself doesn't seem to be used that much.
  // Maybe we can make it just return `void`, or need to reconsider
  // the correctness of the code that uses it.
  /**
   * Changes the active chat.
   * Returns a Promise that resolves with `true`
   * when we're done loading the chat
   * and setting the state (`chatWithLinger`) accordingly.
   *
   * If this function gets called another time before the Promise
   * from the previous call resolves,
   * the previous call's Promise will immediately resolve to `false`.
   *
   * @throws if `nextAccountId` is not the currently selected account.
   */
  selectChat: SelectChat
  unselectChat: UnselectChat
}

type Props = {
  accountId?: number
  /**
   * the ref gives us a handle to reset the component without moving it up in the hierarchy.
   * a class component would give us the option to call methods on the component,
   * but we are using a functional component here so we need to pass this as a property instead*/
  unselectChatRef: RefObject<UnselectChat | null>
}

export const ChatContext = React.createContext<ChatContextValue | null>(null)

export const ChatProvider = ({
  children,
  accountId,
  unselectChatRef,
}: PropsWithChildren<Props>) => {
  const [chatId, setChatId] = useState<number | undefined>()
  useEffect(() => {
    window.__selectedChatId = chatId
  }, [chatId])

  const chatFetch = useRpcFetch(
    BackendRemote.rpc.getFullChatById,
    accountId != undefined && chatId != undefined ? [accountId, chatId] : null
  )
  if (chatFetch?.result?.ok === false) {
    log.error('Failed to fetch chat', chatFetch.result.err)
  }
  const chatWithLinger = chatFetch?.lingeringResult?.ok
    ? chatFetch.lingeringResult.value
    : undefined
  const chatNoLinger = chatFetch?.result?.ok
    ? chatFetch.result.value
    : undefined

  type ChatOrNull = null | Awaited<
    ReturnType<typeof BackendRemote.rpc.getFullChatById>
  >
  const resolvePendingSetChatPromise = useRef<
    ((res: ChatOrNull) => void) | null
  >(null)
  if (
    resolvePendingSetChatPromise.current &&
    chatNoLinger != undefined &&
    // This is implied by `chatNoLinger != undefined`, but let's double-check.
    chatNoLinger.id === chatId
  ) {
    resolvePendingSetChatPromise.current(chatNoLinger)
    resolvePendingSetChatPromise.current = null
    // Maybe a callback passed to `useRpcFetch` would be simpler.
  }

  const selectChat = useCallback<SelectChat>(
    (nextAccountId: number, nextChatId: number) => {
      if (!accountId) {
        throw new Error('can not select chat when no `accountId` is given')
      }

      if (accountId !== nextAccountId) {
        throw new Error(
          'accountid of ChatProvider context is not equal to nextAccountId'
        )
      }

      // Jump to last message if user clicked chat twice
      // Remember that there might be no messages in the chat.
      // @TODO: We probably want this to be part of the UI logic instead
      if (nextChatId === chatId) {
        window.__internal_jump_to_message_asap = {
          accountId,
          chatId: nextChatId,
          jumpToMessageArgs: [
            {
              msgId: undefined,
              highlight: false,
              focus: false,
              addMessageIdToStack: undefined,
              // `scrollIntoViewArg:` doesn't really have effect when
              // jumping to the last message.
            },
          ],
        }
        window.__internal_check_jump_to_message?.()
      }

      // Already set known state
      setChatId(nextChatId)

      // Clear system notifications and mark chat as seen in backend
      markChatAsSeen(accountId, nextChatId)

      // Remember that user selected this chat to open it again when they come back
      saveLastChatId(accountId, nextChatId)

      resolvePendingSetChatPromise.current?.(null)
      const setChatPromise = new Promise<ChatOrNull>(r => {
        resolvePendingSetChatPromise.current = r
      })

      setChatPromise.then(nextChat => {
        if (nextChat == null) {
          return
        }
        // Switch to "archived" view if selected chat is there
        // @TODO: We probably want this to be part of the UI logic instead
        ActionEmitter.emitAction(
          nextChat.archived
            ? KeybindAction.ChatList_SwitchToArchiveView
            : KeybindAction.ChatList_SwitchToNormalView
        )
      })

      return setChatPromise.then(nextChat => nextChat != null)
    },
    [accountId, chatId]
  )

  const unselectChat = useCallback<UnselectChat>(() => {
    setChatId(undefined)
  }, [])

  unselectChatRef.current = unselectChat

  const refreshChat = chatFetch?.refresh
  // Subscribe to events coming from the core
  useEffect(() => {
    const onChatModified = (
      eventAccountId: number,
      { chatId: eventChatId }: { chatId: number }
    ) => {
      if (eventAccountId !== accountId) {
        return
      }

      if (eventChatId !== chatId) {
        return
      }

      if (refreshChat) {
        refreshChat()
      } else {
        log.error("tried to refreshChat, but it's", refreshChat)
      }
    }

    const onContactsModified = (
      eventAccountId: number,
      { contactId }: { contactId: number | null }
    ) => {
      if (eventAccountId !== accountId) {
        return
      }

      if (!chatWithLinger) {
        return
      }

      if (!contactId) {
        return
      }

      if (!chatWithLinger.contactIds.includes(contactId)) {
        return
      }

      if (refreshChat) {
        refreshChat()
      } else {
        log.error("tried to refreshChat, but it's", refreshChat)
      }
    }

    BackendRemote.on('ChatModified', onChatModified)
    BackendRemote.on('ChatEphemeralTimerModified', onChatModified)
    BackendRemote.on('ContactsChanged', onContactsModified)

    return () => {
      BackendRemote.off('ChatModified', onChatModified)
      BackendRemote.off('ChatEphemeralTimerModified', onChatModified)
      BackendRemote.off('ContactsChanged', onContactsModified)
    }
  }, [accountId, chatWithLinger, chatId, refreshChat])

  const value: ChatContextValue = {
    chatWithLinger,
    chatNoLinger,
    loadingChat: chatFetch?.loading ?? false,
    chatId,
    selectChat,
    unselectChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
