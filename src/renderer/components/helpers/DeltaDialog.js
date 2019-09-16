import React, { Fragment, useState } from 'react'
import styled, { createGlobalStyle, css } from 'styled-components'
import { Dialog } from '@blueprintjs/core'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

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

export const DeltaDialogButtonMixin = css`
  .bp3-icon-large {
    margin-right: 0px;
  }
  button:hover {
    background-color: unset !important;
  }
`

export const DeltaDialogCloseButtonWrapper = styled.div`
  ${DeltaDialogButtonMixin}
  .bp3-icon-cross::before {
    font-size: x-large !important;
  }
`

export function DeltaDialogCloseButton (props) {
  return (
    <DeltaDialogCloseButtonWrapper>
      <button {...props} aria-label='Close' className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross' />
    </DeltaDialogCloseButtonWrapper>
  )
}
export const DeltaDialogBackButtonWrapper = styled.div`
  ${DeltaDialogButtonMixin}
`

export function DeltaDialogBackButton (props) {
  return (
    <DeltaDialogBackButtonWrapper>
      <button {...props} className='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left' />
    </DeltaDialogBackButtonWrapper>
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

export function DeltaDialogHeader (props) {
  let { onClickBack, title, onClose, borderBottom, children, showBackButton } = props
  if ( typeof showBackButton === 'undefined') showBackButton = typeof onClickBack === 'function'
  return (
    <div className={classNames(Classes.DIALOG_HEADER, {'bp3-dialog-header-border-bottom': borderBottom})}>
      { showBackButton && <DeltaDialogBackButton onClick={onClickBack} /> }
      { title && <h4 className='bp3-heading'>{title}</h4> }
      { children }
      <DeltaDialogCloseButton onClick={onClose} />
    </div>
  )
}

export function DeltaDialogFooter(props) {
  let { hide, children } = props
  if (typeof hide === 'undefined') hide = typeof children === 'undefined'
  return (
    <div style={{display: hide ? 'none' : 'unset'}} className={Classes.DIALOG_FOOTER}>
      {children}
    </div>
  )
}

export function DeltaDialogBody(props) {
  let { noFooter, children } = props
  noFooter = noFooter !== false
  return (
    <div className={classNames(Classes.DIALOG_BODY, {'.bp3-dialog-body-no-footer' : noFooter})} >
      {children}
    </div>
  )
}

