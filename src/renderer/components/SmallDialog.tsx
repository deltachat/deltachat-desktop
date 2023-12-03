import React, { PropsWithChildren } from 'react'

import Dialog from './Dialog'

import type { DialogProps } from './dialogs/DialogController'

type Props = PropsWithChildren<{
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}>

export default function SmallDialog(props: Props) {
  return (
    <Dialog canOutsideClickClose isOpen={props.isOpen} onClose={props.onClose}>
      {props.children}
    </Dialog>
  )
}
