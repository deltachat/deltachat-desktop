import React from 'react'

import type { PropsWithChildren } from 'react'

export type ChatValue = {}

export const ChatContext = React.createContext<ChatValue | null>(null)

export const ChatProvider = ({ children }: PropsWithChildren<{}>) => {
  const value: ChatValue = {}

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
