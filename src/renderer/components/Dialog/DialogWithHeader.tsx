import React from 'react'

import Dialog from './Dialog'
import DialogHeader from './DialogHeader'

import type { DialogProps } from '../dialogs/DialogController'

type Props = React.PropsWithChildren<
  {
    className?: string
    fixed?: boolean
    onClickBack?: () => void
    style?: React.CSSProperties
    title: string
  } & Pick<DialogProps, 'isOpen' | 'onClose'>
>

const DialogWithHeader = React.memo<Props>(props => {
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      style={props.style}
    >
      <DialogHeader
        onClose={props.onClose}
        onClickBack={props.onClickBack}
        title={props.title}
      />
      {props.children}
    </Dialog>
  )
})

export default DialogWithHeader
