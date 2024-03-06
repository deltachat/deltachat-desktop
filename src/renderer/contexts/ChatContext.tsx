import React, { useCallback, useState } from 'react'

import { BackendRemote } from '../backend-com'

import type { PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export enum ChatView {
  Map,
  Media,
  MessageList,
}

export type SetView = (nextView: ChatView) => void

export type SelectChat = (accountId: number, chatId: number) => void

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
  const [accountId, setAccountId] = useState<number | undefined>()
  const [activeView, setActiveView] = useState(ChatView.MessageList)
  const [chat, setChat] = useState<T.FullChat | undefined>()
  const [chatId, setChatId] = useState<number | undefined>()

  const setChatView = useCallback((nextView: ChatView) => {
    setActiveView(nextView)
  }, [])

  const selectChat = useCallback(async (accountId: number, chatId: number) => {
    setActiveView(ChatView.MessageList)
    setAccountId(accountId)
    setChatId(chatId)

    const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
    setChat(chat)
  }, [])

  const unselectChat = useCallback(() => {
    setActiveView(ChatView.MessageList)
    setAccountId(undefined)
    setChatId(undefined)
    setChat(undefined)
  }, [])

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
