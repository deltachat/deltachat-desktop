import { createContext } from 'react'

export type MessageId = number
export type ChatId = number

export type SelectedMessagesValue = {
  selectedMessages: MessageId[]
  selectMessage: (id: MessageId) => void
  unselectMessage: (id: MessageId) => void
  resetSelected: () => void
}

const SelectedMessagesContext = createContext<SelectedMessagesValue>({
  selectedMessages: [],
  selectMessage: (_id: MessageId) => {},
  unselectMessage: (_id: MessageId) => {},
  resetSelected: () => {},
})

export default SelectedMessagesContext
