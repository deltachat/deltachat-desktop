import { createContext } from 'react'

export type MessageId = number
export type ChatId = number

export type SelectedMessagesValue = {
  selectedMessages: Record<ChatId, MessageId[]>
  selectMessage: (chatId: ChatId, msgId: MessageId) => void
  unselectMessage: (chatId: ChatId, msgId: MessageId) => void
  resetSelected: (chatId: ChatId) => void
}

const SelectedMessagesContext = createContext<SelectedMessagesValue | null>(null)

export default SelectedMessagesContext
