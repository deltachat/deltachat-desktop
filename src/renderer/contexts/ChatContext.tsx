import React, { useCallback, useEffect, useState } from 'react'

import { ActionEmitter, KeybindAction } from '../keybindings'
import { markChatAsSeen, saveLastChatId } from '../backend/chat'
import { BackendRemote } from '../backend-com'

import type { PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export enum ChatView {
  Map,
  Media,
  MessageList,
}

export type SetView = (nextView: ChatView) => void

export type SelectChat = (chatId: number) => Promise<void>

export type UnselectChat = () => void

export type ChatContextValue = {
  activeView: ChatView
  chat?: T.FullChat
  chatId?: number
  selectChat: SelectChat
  setChatView: SetView
  unselectChat: UnselectChat
}

type Props = {
  accountId?: number
}

export const ChatContext = React.createContext<ChatContextValue | null>(null)

export const ChatProvider = ({
  children,
  accountId,
}: PropsWithChildren<Props>) => {
  const [activeView, setActiveView] = useState(ChatView.MessageList)
  const [chat, setChat] = useState<T.FullChat | undefined>()
  const [chatId, setChatId] = useState<number | undefined>()

  const setChatView = useCallback<SetView>((nextView: ChatView) => {
    setActiveView(nextView)
  }, [])

  const selectChat = useCallback<SelectChat>(
    async (nextChatId: number) => {
      if (!accountId) {
        throw new Error('can not select chat when no `accountId` is given')
      }

      // Jump to last message if user clicked chat twice
      // @TODO: We probably want this to be part of the UI logic instead
      if (nextChatId === chatId) {
        window.__internal_jump_to_message?.(undefined, false, undefined)
      }

      // Already set known state
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
    setActiveView(ChatView.MessageList)
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

  const value: ChatContextValue = {
    activeView,
    chat,
    chatId,
    selectChat,
    setChatView,
    unselectChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
