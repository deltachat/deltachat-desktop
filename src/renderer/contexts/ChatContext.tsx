import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

export enum ChatView {
  Map,
  Media,
  MessageList,
}

export type ChatValue = {
  activeView: ChatView
  chatId?: number
  chat?: T.FullChat
}

export const ChatContext = React.createContext<ChatValue | null>(null)

export const ChatProvider = ({ children }: PropsWithChildren<{}>) => {
  const [activeView, setActiveView] = useState(ChatView.MessageList)
  const [chatId, setChatId] = useState<number | undefined>()
  const [chat, setChat] = useState<T.FullChat | undefined>()

  const value: ChatValue = {
    activeView,
    chatId,
    chat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
