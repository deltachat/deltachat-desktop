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
    title: string
    width?: number
    dataTestid?: string
  } & DialogProps &
    Pick<Parameters<typeof Dialog>[0], 'closedby'>
>

const DialogWithHeader = React.memo<Props>(props => {
  return (
    <Dialog
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      width={props.width}
      height={props.height}
      closedby={props.closedby}
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
