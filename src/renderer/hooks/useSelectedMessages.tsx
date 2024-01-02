import { useReducer, useCallback } from 'react'
import {
  MessageId,
  ChatId,
  SelectedMessagesValue,
} from '../contexts/SelectedMessagesContext'

export default function useSelectedMessages(
  chatId: MessageId
): SelectedMessagesValue {
  type MessageAction =
    | {
        type_: 'select' | 'unselect'
        messageId: MessageId
      }
    | { type_: 'reset'; messageId?: never }
  const [selectedMessagesPerChat, _dispatch] = useReducer(
    (
      selectedMessagesPerChat: Record<ChatId, MessageId[]>,
      action: MessageAction
    ) => {
      const selectedMessages = selectedMessagesPerChat[chatId] || []
      switch (action.type_) {
        case 'select':
          selectedMessagesPerChat[chatId] = [
            ...selectedMessages,
            action.messageId,
          ]
          break
        case 'unselect':
          selectedMessagesPerChat[chatId] = selectedMessages.filter(
            id => id !== action.messageId
          )
          break
        case 'reset':
          selectedMessagesPerChat[chatId] = []
          break
      }
      return selectedMessagesPerChat
    },
    {}
  )

  const selectMessage = useCallback<(id: MessageId) => void>(
    (id: MessageId) => _dispatch({ messageId: id, type_: 'select' }),
    [_dispatch, chatId]
  )

  const unselectMessage = useCallback<(id: MessageId) => void>(
    (id: MessageId) => _dispatch({ messageId: id, type_: 'unselect' }),
    [_dispatch, chatId]
  )

  const resetSelected = useCallback<() => void>(
    () => _dispatch({ type_: 'reset' }),
    [_dispatch, chatId]
  )

  const value: SelectedMessagesValue = {
    selectedMessages: selectedMessagesPerChat[chatId] || [],
    selectMessage,
    unselectMessage,
    resetSelected,
  }

  return value
}
