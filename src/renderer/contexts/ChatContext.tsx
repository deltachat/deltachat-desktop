import React, { useCallback, useEffect, useState } from 'react'

import { getChat, markChatAsSeen, saveLastChatId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

import type { PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export enum ChatView {
  Map,
  Media,
  MessageList,
}

export type SetView = (nextView: ChatView) => void

export type SelectChat = (accountId: number, chatId: number) => Promise<void>

export type UnselectChat = () => void

export type ChatValue = {
  accountId?: number
  activeView: ChatView
  chat?: T.FullChat
  chatId?: number
  selectChat: SelectChat
  setChatView: SetView
  unselectChat: UnselectChat
}

export const ChatContext = React.createContext<ChatValue | null>(null)

export const ChatProvider = ({ children }: PropsWithChildren<{}>) => {
  // @TODO: Explore how to refactor account state into its own context
  const [accountId, setAccountId] = useState<number | undefined>()
  const [activeView, setActiveView] = useState(ChatView.MessageList)
  const [chat, setChat] = useState<T.FullChat | undefined>()
  const [chatId, setChatId] = useState<number | undefined>()

  const setChatView = useCallback((nextView: ChatView) => {
    setActiveView(nextView)
  }, [])

  const selectChat = useCallback(async (accountId: number, chatId: number) => {
    // Already set known state
    setActiveView(ChatView.MessageList)
    setChatId(chatId)
    setAccountId(accountId)

    // Clear system notifications and mark chat as seen in backend
    markChatAsSeen(accountId, chatId)

    // Remember that user selected this chat to open it again when they come back
    saveLastChatId(accountId, chatId)

    // Load all chat data we need to get started
    setChat(await getChat(accountId, chatId))
  }, [])

  const refreshChat = useCallback(async () => {
    if (!accountId || !chatId) {
      return
    }

    setChat(await getChat(accountId, chatId))
  }, [accountId, chatId])

  const unselectChat = useCallback(() => {
    setActiveView(ChatView.MessageList)
    setAccountId(undefined)
    setChatId(undefined)
    setChat(undefined)
  }, [])

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

  const value: ChatValue = {
    accountId,
    activeView,
    chat,
    chatId,
    selectChat,
    setChatView,
    unselectChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
