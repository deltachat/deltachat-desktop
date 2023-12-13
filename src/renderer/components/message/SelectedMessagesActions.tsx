import React from 'react'

import { useTranslationFunction } from '../../contexts'
import Button from '../ui/Button'
import { confirmDeleteMessage, openForwardDialog }  from './messageFunctions'

export default function SelectedMessagesActions({
  selectedMessages,
  resetSelected
}: {
  selectedMessages: number[]
  resetSelected: () => void
}) {
  const tx = useTranslationFunction()

  return (
    <div className='selected-messages-actions'>
      <Button
        type='primary'
        onClick={() => openForwardDialog(selectedMessages, resetSelected)}
      >{tx('forward')}</Button>
      <Button
        type='danger'
        onClick={() => confirmDeleteMessage(selectedMessages, resetSelected)}
      >
        {tx('delete')}
      </Button>
      <div>
        {tx(
          'selected_messages_number',
          selectedMessages.length.toLocaleString()
        )}
      </div>
    </div>
  )
}
