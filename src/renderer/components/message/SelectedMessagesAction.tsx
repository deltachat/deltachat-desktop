import React from 'react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import { openForwardDialog, confirmDeleteMessage } from './messageFunctions'
import useDialog from '../../hooks/useDialog'
import useSelectedMessages from '../../hooks/useSelectedMessages'
import { ChatId } from '../../contexts/SelectedMessagesContext'

export default function SelectedMessagesAction({ chatId }: { chatId: ChatId }) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectedMessages, resetSelected } = useSelectedMessages(chatId)
  if (selectedMessages.length === 0) return null

  return (
    <div className='selected-messages-action'>
      <button
        className='delta-button primary bold'
        onClick={() =>
          openForwardDialog(openDialog, selectedMessages, resetSelected)
        }
      >
        {tx('forward')}
      </button>
      <button
        className='delta-button danger bold'
        onClick={() =>
          confirmDeleteMessage(openDialog, selectedMessages, resetSelected)
        }
      >
        {tx('delete')}
      </button>
      <button className='delta-button secondary bold' onClick={resetSelected}>
        {tx('cancel')}
      </button>
      <p>
        {tx('n_selected', [selectedMessages.length.toLocaleString()], {
          quantity: selectedMessages.length,
        })}
      </p>
    </div>
  )
}
