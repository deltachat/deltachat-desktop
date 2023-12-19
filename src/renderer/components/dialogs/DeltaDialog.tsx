import React, { useState, PropsWithChildren } from 'react'
import { Dialog, Classes, RadioGroup, Radio } from '@blueprintjs/core'
import classNames from 'classnames'

import type { DialogProps } from '../../contexts/DialogContext'

export const DeltaDialogBase = React.memo<
  React.PropsWithChildren<
    {
      canEscapeKeyClose?: boolean
      showCloseButton?: boolean
      fixed?: boolean
      className?: string
      style?: React.CSSProperties
      backdropProps?: React.HTMLProps<HTMLDivElement>
      canOutsideClickClose?: boolean
    } & DialogProps
  >
>(
  ({
    onClose,
    canEscapeKeyClose = true,
    canOutsideClickClose = true,
    showCloseButton = true,
    ...props
  }) => {
    const isFixed = props.fixed
    return (
      <>
        <Dialog
          isOpen={true}
          onClose={onClose}
          canOutsideClickClose={canOutsideClickClose}
          isCloseButtonShown={showCloseButton}
          canEscapeKeyClose={canEscapeKeyClose}
          backdropProps={props.backdropProps}
          className={classNames(
            'delta-dialog',
            isFixed === true ? 'FixedDeltaDialog' : 'DeltaDialog',
            props.className
          )}
          style={props.style}
        >
          {props.children}
        </Dialog>
      </>
    )
  }
)

export function DeltaDialogCloseButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <div className='header-button-wrapper close-btn'>
      <button
        {...props}
        aria-label='Close'
        className='bp4-dialog-close-button bp4-button bp4-minimal bp4-icon-large bp4-icon-cross'
      />
    </div>
  )
}

function DeltaDialogBackButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <div className='header-button-wrapper back-btn'>
      <button
        {...props}
        className='bp4-button bp4-minimal bp4-icon-large bp4-icon-arrow-left'
      />
    </div>
  )
}
function DeltaDialogEditButton(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className='header-button-wrapper edit-btn'>
      <div {...props} />
    </div>
  )
}

const DeltaDialog = React.memo<
  React.PropsWithChildren<
    {
      title: string
      fixed?: boolean
      className?: string
      style?: React.CSSProperties
      onClickBack?: () => void
      showBackButton?: boolean
      showCloseButton?: boolean
    } & DialogProps
  >
>(props => {
  return (
    <DeltaDialogBase
      onClose={props.onClose}
      fixed={props.fixed}
      className={props.className}
      style={props.style}
      showCloseButton={props.showCloseButton}
    >
      <DeltaDialogHeader
        onClose={props.onClose}
        onClickBack={props.onClickBack}
        showBackButton={props.showBackButton}
        showCloseButton={props.showCloseButton}
        title={props.title}
      />
      {props.children}
    </DeltaDialogBase>
  )
})

export default DeltaDialog

export function DeltaDialogHeader(props: {
  title?: string
  onClickBack?: () => void
  onClickEdit?: () => void
  onClose?: DialogProps['onClose']
  children?: React.ReactNode
  showBackButton?: boolean
  showEditButton?: boolean
  showCloseButton?: boolean
}) {
  const {
    onClickBack,
    title,
    onClose,
    onClickEdit,
    children,
    showCloseButton,
    showEditButton,
  } = props
  let { showBackButton } = props
  if (typeof showBackButton === 'undefined')
    showBackButton = typeof onClickBack === 'function'
  return (
    <div
      className={classNames(
        Classes.DIALOG_HEADER,
        'bp4-dialog-header-border-bottom'
      )}
    >
      {showBackButton && <DeltaDialogBackButton onClick={onClickBack} />}
      {title && <h4 className='bp4-heading'>{title}</h4>}
      {children}
      {showEditButton && <DeltaDialogEditButton onClick={onClickEdit} />}
      {typeof onClose === 'function' && showCloseButton !== false && (
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
  const { children } = props
  let { hide } = props
  if (typeof hide === 'undefined') hide = typeof children === 'undefined'
  return (
    <div
      style={{ display: hide ? 'none' : 'block', ...props.style }}
      className={classNames(
        Classes.DIALOG_FOOTER,
        'bp4-dialog-footer-border-top'
      )}
    >
      {children}
    </div>
  )
}

export function DeltaDialogBody(
  props: React.PropsWithChildren<{
    noFooter?: boolean
    ref?: todo
    style?: React.CSSProperties
    id?: string
  }>
) {
  const { noFooter, children, style, id } = props
  return (
    <div
      ref={props.ref}
      className={classNames(Classes.DIALOG_BODY, {
        'bp4-dialog-body-no-footer': noFooter !== false,
      })}
      style={style}
      id={id}
    >
      {children}
    </div>
  )
}

export function DeltaDialogContent(
  props: React.PropsWithChildren<{
    noPadding?: boolean
    noOverflow?: boolean
    className?: string
    style?: React.CSSProperties
    id?: string
  }>
) {
  const { noPadding, noOverflow, style, id, className } = props
  return (
    <div
      className={classNames(
        'delta-dialog-content',
        {
          'delta-dialog-content--no-padding': noPadding,
          'delta-dialog-content--no-overflow': noOverflow,
        },
        className
      )}
      style={style}
      id={id}
    >
      {props.children}
    </div>
  )
}

export function DeltaDialogContentTextSeparator(props: { text: string }) {
  return <div className='delta-dialog-content-text-separator'>{props.text}</div>
}

// unused - info: scss class is also commented out
// export function DeltaDialogContentSeparator(props: {
//   style?: React.CSSProperties
// }) {
//   return <div style={props.style} className='delta-dialog-content-separator' />
// }

export function DeltaDialogButton(
  props: React.PropsWithChildren<{ onClick: () => void }>
) {
  return (
    <div onClick={props.onClick} className='delta-dialog-button'>
      {props.children}
    </div>
  )
}

export function SmallDialog(props: PropsWithChildren<DialogProps>) {
  return (
    <DeltaDialogBase
      onClose={props.onClose}
      canOutsideClickClose
      className='small-dialog'
    >
      {props.children}
    </DeltaDialogBase>
  )
}

export type SelectDialogOption = [value: string, label: string]

export function SmallSelectDialog({
  selectedValue,
  values,
  onSave,
  title,
  onClose,
  onSelect,
  onCancel,
}: {
  title: string
  selectedValue: string
  values: SelectDialogOption[]
  onClose: DialogProps['onClose']
  onSave?: (selectedValue: string) => void
  onSelect?: (selectedValue: string) => void
  onCancel?: () => void
}) {
  const [actualSelectedValue, setActualSelectedValue] =
    useState<string>(selectedValue)

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const actualSelectedValue = String(event.currentTarget.value)
    setActualSelectedValue(actualSelectedValue)
    onSelect && onSelect(actualSelectedValue)
  }
  const saveAndClose = () => {
    onSave && onSave(actualSelectedValue)
    onClose()
  }

  const tx = window.static_translate
  return (
    <SmallDialog onClose={onClose}>
      <DeltaDialogHeader title={title} />
      <DeltaDialogBody>
        <DeltaDialogContent>
          <RadioGroup onChange={onChange} selectedValue={actualSelectedValue}>
            {values.map((element, index) => {
              const [value, label] = element
              return (
                <Radio key={'select-' + index} label={label} value={value} />
              )
            })}
          </RadioGroup>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter style={{ marginTop: '0px', padding: '20px' }}>
        <DeltaDialogFooterActions>
          <p
            className='delta-button primary bold'
            onClick={() => {
              onCancel && onCancel()
              onClose()
            }}
          >
            {tx('cancel')}
          </p>
          <p className='delta-button primary bold' onClick={saveAndClose}>
            {tx('save_desktop')}
          </p>
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </SmallDialog>
  )
}

export function DeltaDialogFooterActions({
  children,
  style,
}: {
  children: any
  style?: any
}) {
  return (
    <div
      style={{ justifyContent: 'flex-end', ...style }}
      className={Classes.DIALOG_FOOTER_ACTIONS}
    >
      {children}
    </div>
  )
}

export function DeltaDialogOkCancelFooter({
  onCancel,
  onOk,
  disableOK,
  cancelLabel,
  confirmLabel,
}: {
  onCancel: () => any
  onOk: () => any
  disableOK?: boolean
  cancelLabel?: string
  confirmLabel?: string
}) {
  const tx = window.static_translate
  disableOK = disableOK === true ? true : false

  cancelLabel = cancelLabel || tx('cancel')
  confirmLabel = confirmLabel || tx('ok')

  return (
    <DeltaDialogFooter>
      <DeltaDialogFooterActions>
        <p
          className='delta-button primary bold'
          style={{ marginRight: '10px' }}
          onClick={onCancel}
        >
          {cancelLabel}
        </p>
        <p
          //className={ 'delta-button bold primary' + disableOK ? " disabled" : "" }
          className={classNames(
            'delta-button bold primary test-selector-confirm',
            {
              disabled: disableOK,
            }
          )}
          onClick={onOk}
        >
          {confirmLabel}
        </p>
      </DeltaDialogFooterActions>
    </DeltaDialogFooter>
  )
}

export function DeltaDialogCloseFooter({ onClose }: { onClose: () => any }) {
  const tx = window.static_translate

  return (
    <DeltaDialogFooter>
      <DeltaDialogFooterActions>
        <p className={'delta-button bold primary'} onClick={onClose}>
          {tx('close')}
        </p>
      </DeltaDialogFooterActions>
    </DeltaDialogFooter>
  )
}

export const DeltaSwitch2 = ({
  label,
  description,
  value,
  onClick,
  disabled,
}: {
  label: string
  value: boolean
  description?: string
  onClick: () => void
  disabled?: boolean
}) => {
  disabled = disabled === true ? true : false
  return (
    <label className={classNames('DialogSwitch', { disabled })}>
      <div className='left'>
        <div className='label'>{label}</div>
        {description && <div className='description'>{description}</div>}
      </div>
      <div className='right'>
        <label className='delta-switch2 bp4-switch bp4-align-right inactive'>
          <input
            type='checkbox'
            checked={value}
            onClick={() => {
              disabled === false && onClick()
            }}
            readOnly
          ></input>
          <span
            className={classNames('delta-switch2-indicator', {
              checked: value,
              disabled,
            })}
          ></span>
        </label>
      </div>
    </label>
  )
}
