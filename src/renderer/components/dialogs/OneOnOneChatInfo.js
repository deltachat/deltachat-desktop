import React, { useState } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogFooter } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'

export default function OneOnOneChatInfo (props) {
  const { isOpen, onClose } = props
  const [viewMode, setViewMode] = useState('main')

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
    >
      <p>Test</p>
    </DeltaDialogBase>
  )
}

