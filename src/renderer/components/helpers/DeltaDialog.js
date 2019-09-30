import React, { Fragment, useState } from 'react'
import styled, { createGlobalStyle, css } from 'styled-components'
import { Dialog, Classes } from '@blueprintjs/core'
import classNames from 'classnames'

export const CreateDeltaDialogGlobal = createGlobalStyle`
  .FixedDeltaDialog {
    position: absolute;
    top: 0;
    width: 400px;
    height: calc(100% - 60px);
  }
`

export const DeltaDialogBase = React.memo((props) => {
  return (
    <Fragment>
      <CreateDeltaDialogGlobal />
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose={false}
        canEscapeKeyClose={true}
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
    margin-right: -14px;
    font-size: 24px;
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
  button::before {
    margin-left: -13px !important;
    font-size: 20px !important;
  }
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
      <DeltaDialogHeader {...{ ...props, children: undefined }} />
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
  let { onClickBack, title, onClose, children, showBackButton } = props
  if (typeof showBackButton === 'undefined') showBackButton = typeof onClickBack === 'function'
  return (
    <div className={classNames(Classes.DIALOG_HEADER, 'bp3-dialog-header-border-bottom')}>
      { showBackButton && <DeltaDialogBackButton onClick={onClickBack} /> }
      { title && <h4 className='bp3-heading'>{title}</h4> }
      { children }
      <DeltaDialogCloseButton onClick={onClose} />
    </div>
  )
}

export function DeltaDialogFooter (props) {
  let { hide, children } = props
  if (typeof hide === 'undefined') hide = typeof children === 'undefined'
  return (
    <div style={{ display: hide ? 'none' : 'unset' }} className={classNames(Classes.DIALOG_FOOTER, 'bp3-dialog-footer-border-top')}>
      {children}
    </div>
  )
}

export function DeltaDialogBody (props) {
  let { noFooter, children } = props
  noFooter = noFooter !== false
  return (
    <div ref={props.ref} className={classNames(Classes.DIALOG_BODY, { '.bp3-dialog-body-no-footer': noFooter })}>
      {children}
    </div>
  )
}
