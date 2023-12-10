import { useTranslationFunction } from '../../contexts'
import React from 'react'
import Button from '../ui/Button'


export default function SelectedMessagesActions({ selectedMessages } : { selectedMessages: number[] }) {
  const tx = useTranslationFunction()
  return (
    <div className='selectedmessagesctions'>
      <Button></Button>
      <Button></Button>
      <div>{selectedMessages.length.toLocaleString()} {tx('selected_messages_number')}</div>
    </div>
  )
}
