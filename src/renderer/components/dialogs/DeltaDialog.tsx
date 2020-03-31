import React, { Fragment, useState } from 'react'
import styled, { css } from 'styled-components'
import { Dialog, Classes } from '@blueprintjs/core'
import classNames from 'classnames'

export const DeltaDialogBase = React.memo<
  React.PropsWithChildren<{
    isOpen: boolean
    onClose: () => void
    fixed?: boolean
    className?: string
    style?: React.CSSProperties
  }>
>(props => {
  const isFixed = props.fixed
  return (
    <Fragment>
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        canOutsideClickClose={false}
        canEscapeKeyClose
        className={classNames(
          isFixed === true ? 'FixedDeltaDialog' : 'DeltaDialog',
          [props.className]
        )}
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

export function DeltaDialogCloseButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <DeltaDialogCloseButtonWrapper>
      <button
        {...props}
        aria-label='Close'
        className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross'
      />
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

export function DeltaDialogBackButton(
  props: React.HTMLAttributes<HTMLButtonElement>
) {
  return (
    <DeltaDialogBackButtonWrapper>
      <button
        {...props}
        className='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left'
      />
    </DeltaDialogBackButtonWrapper>
  )
}

const DeltaDialog = React.memo<
  React.PropsWithChildren<{
    isOpen: boolean
    onClose: () => void
    title: string
    fixed?: boolean
    className?: string
    style?: React.CSSProperties
    onClickBack?: () => void
    showBackButton?: boolean
  }>
>(props => {
  return (
    <DeltaDialogBase
      isOpen={props.isOpen}
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      style={props.style}
    >
      <DeltaDialogHeader
        onClose={props.onClose}
        onClickBack={props.onClickBack}
        showBackButton={props.showBackButton}
        title={props.title}
      />
      {props.children}
    </DeltaDialogBase>
  )
})

export default DeltaDialog

export function useDialog<T extends (props: any) => JSX.Element>(
  DialogComponent: T
) {
  const [isOpen, setIsOpen] = useState(false)
  const [props, setProps] = useState({})
  const showDialog = (
    props: T extends (props: infer U) => JSX.Element ? U : never
  ) => {
    setProps(props || {})
    setIsOpen(true)
  }
  const dismissDialog = () => {
    setIsOpen(false)
  }
  const onClose = dismissDialog

  const renderDialog: () => JSX.Element = () => {
    if (!isOpen) return null
    const Component = DialogComponent as (props: any) => JSX.Element
    return <Component {...{ ...props, isOpen, onClose }} />
  }
  return [renderDialog, showDialog]
}

export function DeltaDialogHeader(props: {
  onClickBack?: () => void
  title: string
  onClose: () => void
  children?: React.ReactNode
  showBackButton?: boolean
}) {
  let { onClickBack, title, onClose, children, showBackButton } = props
  if (typeof showBackButton === 'undefined')
    showBackButton = typeof onClickBack === 'function'
  return (
    <div
      className={classNames(
        Classes.DIALOG_HEADER,
        'bp3-dialog-header-border-bottom'
      )}
    >
      {showBackButton && <DeltaDialogBackButton onClick={onClickBack} />}
      {title && <h4 className='bp3-heading'>{title}</h4>}
      {children}
      {typeof onClose === 'function' && (
        <DeltaDialogCloseButton onClick={onClose} />
      )}
    </div>
  )
}

export function DeltaDialogFooter(
  props: React.PropsWithChildren<{
    hide?: boolean
    style?: React.CSSProperties
  }>
) {
  let { hide, children } = props
  if (typeof hide === 'undefined') hide = typeof children === 'undefined'
  return (
    <div
      style={{ display: hide ? 'none' : 'unset', ...props.style }}
      className={classNames(
        Classes.DIALOG_FOOTER,
        'bp3-dialog-footer-border-top'
      )}
    >
      {children}
    </div>
  )
}

export function DeltaDialogBody(
  props: React.PropsWithChildren<{ noFooter?: boolean; ref?: todo }>
) {
  let { noFooter, children } = props
  return (
    <div
      ref={props.ref}
      className={classNames(Classes.DIALOG_BODY, {
        'bp3-dialog-body-no-footer': noFooter !== false,
      })}
    >
      {children}
    </div>
  )
}

export function DeltaDialogContent(
  props: React.PropsWithChildren<{
    noPadding?: boolean
    noOverflow?: boolean
    style?: React.CSSProperties
  }>
) {
  const { noPadding, noOverflow } = props
  return (
    <div
      style={props.style}
      className={classNames('delta-dialog-content', {
        'delta-dialog-content--no-padding': noPadding,
        'delta-dialog-content--no-overflow': noOverflow,
      })}
    >
      {props.children}
    </div>
  )
}

export function DeltaDialogContentTextSeperator(props: { text: string }) {
  return <div className='delta-dialog-content-text-seperator'>{props.text}</div>
}

export function DeltaDialogContentSeperator(props: {
  style?: React.CSSProperties
}) {
  return <div style={props.style} className='delta-dialog-content-seperator' />
}

export function DeltaDialogButton(
  props: React.PropsWithChildren<{ onClick: () => void }>
) {
  return (
    <div onClick={props.onClick} className='delta-dialog-button'>
      {props.children}
    </div>
  )
}
