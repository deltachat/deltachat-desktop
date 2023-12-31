import React, { PropsWithChildren, useCallback, useReducer, createContext } from 'react'

export type SelectedMessagesValue = {
  selectedMessages: number[]
  selectMessage: (id: number) => void
  unselectMessage: (id: number) => void
  resetSelected: () => void
}

export const SelectedMessagesContext = createContext<SelectedMessagesValue>({
  selectedMessages: [],
  selectMessage: (_id: number) => {},
  unselectMessage: (_id: number) => {},
  resetSelected: () => {}
})

export function SelectedMessagesProvider({ children }: PropsWithChildren<{}>) {
  type MessageAction =
    | {
        type_: 'select' | 'unselect'
        messageId: number
      }
    | { type_: 'reset'; messageId?: never }
  const [selectedMessages, _dispatch] = useReducer(
    (selectedMessages: number[], action: MessageAction) => {
      switch (action.type_) {
        case 'select':
          return [...selectedMessages, action.messageId]
        case 'unselect':
          return selectedMessages.filter(id => id !== action.messageId)
        case 'reset':
          return []
      }
    },
    []
  )

  const selectMessage = useCallback<(id: number) => void>(
    (id: number) => _dispatch({ messageId: id, type_: 'select' }),
    [_dispatch]
  )

  const unselectMessage = useCallback<(id: number) => void>(
    (id: number) => _dispatch({ messageId: id, type_: 'unselect' }),
    [_dispatch]
  )

  const resetSelected = useCallback<() => void>(
    () => _dispatch({ type_: 'reset' }),
    [_dispatch]
  )

  const value: SelectedMessagesValue = {
    selectedMessages,
    selectMessage,
    unselectMessage,
    resetSelected,
  }

  return (
    <SelectedMessagesContext.Provider value={value}>
      {children}
    </SelectedMessagesContext.Provider>
  )
}
