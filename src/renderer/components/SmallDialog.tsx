import React, { PropsWithChildren } from 'react'
import { Dialog as BlueprintDialog } from '@blueprintjs/core'

import { DialogProps } from './dialogs/DialogController'

type Props = PropsWithChildren<{
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}>

export default function SmallDialog(props: Props) {
  return (
    <BlueprintDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      canOutsideClickClose
      className='delta-dialog small-dialog'
    >
      {props.children}
    </BlueprintDialog>
  )
}
