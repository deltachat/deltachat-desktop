import React, { useState } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogFooter, DeltaDialogBody } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'
import { useChatStore2 } from '../../stores/chat'

export default function OneOnOneChatInfo (props) {
  const { isOpen, onClose } = props
  const [viewMode, setViewMode] = useState('main')
  const { selectedChat } = useChatStore2()
  console.log(selectedChat)

  const tx = window.translate

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
    >
      <DeltaDialogHeader
        title={tx('menu_view_profile')}
        onClose={onClose}
        borderBottom
      />
      <DeltaDialogBody>
        <Card>
        <p>{selectedChat.name}</p>
        <p>{selectedChat.subtitle}</p>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter>
      </DeltaDialogFooter>
    </DeltaDialogBase>
  )
}
