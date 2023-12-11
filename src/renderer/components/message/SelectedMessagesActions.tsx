import { useTranslationFunction } from '../../contexts'
import React from 'react'
import Button from '../ui/Button'

export default function SelectedMessagesActions({
  selectedMessages,
}: {
  selectedMessages: number[]
}) {
  const tx = useTranslationFunction()
  return (
    <div className='selected-messages-actions'>
      <Button type='primary'>Forward</Button>
      <Button type='danger'>Delete</Button>
      <div>
        {tx(
          'selected_messages_number',
          selectedMessages.length.toLocaleString()
        )}
      </div>
    </div>
  )
}
