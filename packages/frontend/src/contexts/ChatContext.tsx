import React, { useCallback, useEffect, useState } from 'react'

import { ActionEmitter, KeybindAction } from '../keybindings'
import useKeyBindingAction from '../hooks/useKeyBindingAction'
import { markChatAsSeen, saveLastChatId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

import type { MutableRefObject, PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export type AlternativeView = 'global-gallery' | null

export enum ChatView {
  Map,
  Media,
  MessageList,
}

export type SetView = (nextView: ChatView) => void

export type SelectChat = (
  nextAccountId: number,
  chatId: number
) => Promise<void>

export type UnselectChat = () => void

export type ChatContextValue = {
  activeView: ChatView
  chat?: T.FullChat
  chatId?: number
  alternativeView: AlternativeView
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
  const [chat, setChat] = useState<T.FullChat | undefined>()
  const [chatId, setChatId] = useState<number | undefined>()
  const [alternativeView, setAlternativeView] = useState<AlternativeView>(null)

  const setChatView = useCallback<SetView>((nextView: ChatView) => {
    setActiveView(nextView)
  }, [])

  const selectChat = useCallback<SelectChat>(
    async (nextAccountId: number, nextChatId: number) => {
      if (!accountId) {
        throw new Error('can not select chat when no `accountId` is given')
      }

      if (accountId !== nextAccountId) {
        throw new Error(
          'accountid of ChatProvider context is not equal to nextAccountId'
        )
      }

      // Jump to last message if user clicked chat twice
      // @TODO: We probably want this to be part of the UI logic instead
      if (nextChatId === chatId) {
        window.__internal_jump_to_message?.({
          msgId: undefined,
          highlight: false,
          focus: false,
          addMessageIdToStack: undefined,
          // `scrollIntoViewArg:` doesn't really have effect when
          // jumping to the last message.
        })
      }

      // Already set known state
      setAlternativeView(null)
      setActiveView(ChatView.MessageList)
      setChatId(nextChatId)

      // Clear system notifications and mark chat as seen in backend
      markChatAsSeen(accountId, nextChatId)

      // Remember that user selected this chat to open it again when they come back
      saveLastChatId(accountId, nextChatId)

      // Load all chat data we need to get started
      const nextChat = await BackendRemote.rpc.getFullChatById(
        accountId,
        nextChatId
      )
      setChat(nextChat)

      // Switch to "archived" view if selected chat is there
      // @TODO: We probably want this to be part of the UI logic instead
      ActionEmitter.emitAction(
        nextChat.archived
          ? KeybindAction.ChatList_SwitchToArchiveView
          : KeybindAction.ChatList_SwitchToNormalView
      )
    },
    [accountId, chatId]
  )

  const refreshChat = useCallback(async () => {
    if (!accountId || !chatId) {
      return
    }

    setChat(await BackendRemote.rpc.getFullChatById(accountId, chatId))
  }, [accountId, chatId])

  const unselectChat = useCallback<UnselectChat>(() => {
    setAlternativeView(null)
    setActiveView(ChatView.MessageList)
    setChatId(undefined)
    setChat(undefined)
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

      if (!chat) {
        return
      }

      if (!contactId) {
        return
      }

      if (!chat.contactIds.includes(contactId)) {
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
  }, [accountId, chat, chatId, refreshChat])

  const value: ChatContextValue = {
    activeView,
    chat,
    chatId,
    alternativeView,
    selectChat,
    setChatView,
    unselectChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
