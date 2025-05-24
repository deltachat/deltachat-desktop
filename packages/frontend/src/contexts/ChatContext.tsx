import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ActionEmitter, KeybindAction } from '../keybindings'
import useKeyBindingAction from '../hooks/useKeyBindingAction'
import { markChatAsSeen, saveLastChatId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

import type { MutableRefObject, PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export type AlternativeView = 'global-gallery' | null

export enum ChatView {
  Media,
  MessageList,
}

export type SetView = (nextView: ChatView) => void

export type SelectChat = (
  nextAccountId: number,
  chatId: number
) => Promise<boolean>

export type UnselectChat = () => void

export type ChatContextValue = {
  activeView: ChatView
  /**
   * `withLinger` means that after `selectChat()` the value of `chatWithLinger`
   * does not change immediately (unlike `chatId`),
   * until the new chat's info gets loaded.
   */
  chatWithLinger?: T.FullChat
  chatId?: number
  alternativeView: AlternativeView
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
  setChatView: SetView
  unselectChat: UnselectChat
}

type Props = {
  accountId?: number
  /**
   * the ref gives us a handle to reset the component without moving it up in the hierarchy.
   * a class component would give us the option to call methods on the component,
   * but we are using a functional component here so we need to pass this as a property instead*/
  unselectChatRef: MutableRefObject<UnselectChat | null>
}

export const ChatContext = React.createContext<ChatContextValue | null>(null)

export const ChatProvider = ({
  children,
  accountId,
  unselectChatRef,
}: PropsWithChildren<Props>) => {
  const [activeView, setActiveView] = useState(ChatView.MessageList)

  const [chatWithLinger, setChatWithLinger] = useState<T.FullChat | undefined>()
  const cancelPendingSetChat = useRef<(() => void) | undefined>(undefined)

  const [chatId, setChatId] = useState<number | undefined>()
  window.__selectedChatId = chatId
  const [alternativeView, setAlternativeView] = useState<AlternativeView>(null)

  const setChatView = useCallback<SetView>((nextView: ChatView) => {
    setActiveView(nextView)
  }, [])

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
      setAlternativeView(null)
      setActiveView(ChatView.MessageList)
      setChatId(nextChatId)

      // Clear system notifications and mark chat as seen in backend
      markChatAsSeen(accountId, nextChatId)

      // Remember that user selected this chat to open it again when they come back
      saveLastChatId(accountId, nextChatId)

      // Make sure that this gets called eventually.
      let resolveRetPromise: (result: boolean) => void
      const retPromise = new Promise<boolean>(r => {
        resolveRetPromise = r
      })

      // `cancelPendingSetChat` is mostly to resolve race conditions
      // where the previous `selectChat()` finishes _after_ the new one.
      cancelPendingSetChat.current?.()
      let cancelled = false
      const cancel = () => {
        cancelled = true
        resolveRetPromise(false)
      }
      cancelPendingSetChat.current = cancel

      BackendRemote.rpc
        .getFullChatById(accountId, nextChatId)
        .then(nextChat => {
          if (cancelled) {
            throw new Error('cancelled')
          }

          setChatWithLinger(nextChat)

          // Switch to "archived" view if selected chat is there
          // @TODO: We probably want this to be part of the UI logic instead
          ActionEmitter.emitAction(
            nextChat.archived
              ? KeybindAction.ChatList_SwitchToArchiveView
              : KeybindAction.ChatList_SwitchToNormalView
          )
        })
        .then(() => {
          resolveRetPromise(true)
        })
        .catch(_err => {
          resolveRetPromise(false)
        })
        .finally(() => {
          // Yes, need to check if the current pendingSetChat
          // is this one, because this one might take longer
          // than the next one.
          if (cancelPendingSetChat.current === cancel) {
            // This is not necessary. Just to clean up the state.
            cancelPendingSetChat.current = undefined
          }
        })

      return retPromise
    },
    [accountId, chatId]
  )

  const refreshChat = useCallback(async () => {
    if (!accountId || !chatId) {
      return
    }

    setChatWithLinger(
      await BackendRemote.rpc.getFullChatById(accountId, chatId)
    )
  }, [accountId, chatId])

  const unselectChat = useCallback<UnselectChat>(() => {
    setAlternativeView(null)
    setActiveView(ChatView.MessageList)
    setChatId(undefined)
    setChatWithLinger(undefined)
  }, [])

  unselectChatRef.current = unselectChat

  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    unselectChat()
    setAlternativeView('global-gallery')
  })

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

      refreshChat()
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

      refreshChat()
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
    activeView,
    chatWithLinger,
    chatId,
    alternativeView,
    selectChat,
    setChatView,
    unselectChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
