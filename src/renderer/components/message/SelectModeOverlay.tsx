import React, { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { SelectedMessagesContext } from '../../contexts/SelectedMessagesContext'

export default function SelectModeOverlay({ messageId }: { messageId: number }) {
  const { selectedMessages, selectMessage, unselectMessage } = useContext(SelectedMessagesContext)
  const isSelected = useMemo(() => selectedMessages.includes(messageId), [selectedMessages])

  return (
    <div
      onClick={isSelected ? unselectMessage.bind(null, messageId) : selectMessage.bind(null, messageId)}
      className={classNames('select-mode-overlay', isSelected && 'selected')}
    />
  )
}
