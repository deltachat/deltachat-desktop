import React, { Fragment, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Dialog } from '@blueprintjs/core'
import classNames from 'classnames'

export const CreateDeltaDialogGlobal = createGlobalStyle`
  .FixedDeltaDialog {
    position: absolute;
    top: 0;
  }
  .bp3-dialog-header {
    padding-right: 4px;
  }
`

export const DeltaDialogBase = React.memo((props) => {
  return (
    <Fragment>
      <CreateDeltaDialogGlobal />
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        className={classNames(props.fixed ? 'FixedDeltaDialog' : 'DeltaDialog', props.className)}
        style={props.style}
      >
        {props.children}
      </Dialog>
    </Fragment>
  )
})

export const DeltaDialogCloseButtonWrapper = styled.div`
  .bp3-icon-cross::before {
    font-size: x-large !important;
  }

  .bp3-icon-large {
    margin-right: 0px;
  }
  button:hover {
    background-color: unset !important;
  }
`

export function DeltaDialogCloseButton (props) {
  return (
    <DeltaDialogCloseButtonWrapper>
      <button {...props} aria-label='Close' className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
    </DeltaDialogCloseButtonWrapper>
  )
}

const DeltaDialog = React.memo((props) => {
  return (
    <DeltaDialogBase {...props}>
      <div className='bp3-dialog-header'>
        <h4 className='bp3-heading'>{props.title}</h4>
        <DeltaDialogCloseButton onClick={props.onClose} />
      </div>
      {props.children}
    </DeltaDialogBase>
  )
})
export default DeltaDialog

export const useDialog = (DialogComponent) => {
  const [isOpen, setIsOpen] = useState(false)
  const [props, setProps] = useState({})
  const showDialog = (props) => {
    setProps(props || {})
    setIsOpen(true)
  }
  const dismissDialog = () => {
    setIsOpen(false)
  }
  const onClose = dismissDialog

  const renderDialog = () => {
    if (!isOpen) return null
    return <DialogComponent {...{ ...props, isOpen, onClose }} />
  }
  return [renderDialog, showDialog]
}

export function GoBackDialogHeader ({ onClickBack, title, onClose }) {
  return (
    <div className='bp3-dialog-header'>
      <button onClick={onClickBack} className='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left' />
      <h4 className='bp3-heading'>{title}</h4>
      <DeltaDialogCloseButton onClick={onClose} />
    </div>
  )
}
