import React, { useState } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogFooter, DeltaDialogBody } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'

export default function ViewProfile (props) { 
  const { isOpen, onClose, chat } = props
  const [viewMode, setViewMode] = useState('main')
  console.log(chat)

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
        <p>{chat.name}</p>
        <p>{chat.subtitle}</p>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter>
      </DeltaDialogFooter>
    </DeltaDialogBase>
  )
}
