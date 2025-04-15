import React from 'react'

import Dialog from './Dialog'
import DialogHeader from './DialogHeader'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = React.PropsWithChildren<
  {
    className?: string
    fixed?: boolean
    height?: number
    onClickBack?: () => void
    canOutsideClickClose?: boolean
    title: string
    width?: number
    dataTestid?: string
  } & DialogProps
>

const DialogWithHeader = React.memo<Props>(props => {
  return (
    <Dialog
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      width={props.width}
      height={props.height}
      canOutsideClickClose={props.canOutsideClickClose}
      dataTestid={props.dataTestid}
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
