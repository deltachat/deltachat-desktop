import { useContext } from 'react'

import { ChatContext } from '../../contexts/ChatContext'

import type { ChatContextValue } from '../../contexts/ChatContext'

export default function useChat(): ChatContextValue {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChat has to be used within <ChatProvider>')
  }

  return context
}
