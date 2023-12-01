import React from 'react'

import Dialog from './Dialog'
import DialogHeader from './DialogHeader'

type Props = React.PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  title: string
  fixed?: boolean
  className?: string
  style?: React.CSSProperties
  onClickBack?: () => void
  showBackButton?: boolean
  showCloseButton?: boolean
}>

const DialogWithHeader = React.memo<Props>(props => {
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      style={props.style}
      showCloseButton={props.showCloseButton}
    >
      <DialogHeader
        onClose={props.onClose}
        onClickBack={props.onClickBack}
        showBackButton={props.showBackButton}
        showCloseButton={props.showCloseButton}
        title={props.title}
      />
      {props.children}
    </Dialog>
  )
})

export default DialogWithHeader
