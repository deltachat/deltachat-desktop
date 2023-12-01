import { Dialog as BlueprintDialog } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'

type Props = React.PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  canEscapeKeyClose?: boolean
  showCloseButton?: boolean
  fixed?: boolean
  className?: string
  style?: React.CSSProperties
  backdropProps?: any
  canOutsideClickClose?: boolean
}>

const Dialog = React.memo<Props>(props => {
  return (
    <>
      <BlueprintDialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose={
          typeof props.canOutsideClickClose === 'undefined'
            ? true
            : props.canOutsideClickClose
        }
        isCloseButtonShown={props.showCloseButton}
        canEscapeKeyClose={true}
        backdropProps={props.backdropProps}
        className={classNames(
          'delta-dialog',
          props.fixed === true ? 'FixedDeltaDialog' : 'DeltaDialog',
          [props.className]
        )}
        style={props.style}
      >
        {props.children}
      </BlueprintDialog>
    </>
  )
})

export default Dialog
