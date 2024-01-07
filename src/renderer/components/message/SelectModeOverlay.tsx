import React, { useMemo } from 'react'
import classNames from 'classnames'
import useSelectedMessages from '../../hooks/useSelectedMessages'
import { MessageId, ChatId } from '../../contexts/SelectedMessagesContext'

type SelectModeOverlayProps = {
  messageId: MessageId
  chatId: ChatId
}

export default function SelectModeOverlay({
  messageId,
  chatId,
}: SelectModeOverlayProps) {
  const { selectedMessages, selectMessage, unselectMessage } =
    useSelectedMessages(chatId)
  const isSelected = useMemo(
    () => selectedMessages.includes(messageId),
    [selectedMessages]
  )

  return (
    <div
      onClick={
        isSelected
          ? unselectMessage.bind(null, messageId)
          : selectMessage.bind(null, messageId)
      }
      className={classNames('select-mode-overlay', isSelected && 'selected')}
    />
  )
}
