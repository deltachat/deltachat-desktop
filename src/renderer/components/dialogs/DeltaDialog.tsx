import React, { useState, PropsWithChildren } from 'react'
import { Dialog, Classes, RadioGroup, Radio } from '@blueprintjs/core'
import classNames from 'classnames'
import { DialogProps } from './DialogController'

export const DeltaDialogBase = React.memo<
  React.PropsWithChildren<{
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
>(props => {
  const isFixed = props.fixed
  return (
    <>
      <Dialog
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
          isFixed === true ? 'FixedDeltaDialog' : 'DeltaDialog',
          [props.className]
        )}
        style={props.style}
      >
        {props.children}
      </Dialog>
    </>
  )
})

export function DeltaDialogCloseButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <div className='header-button-wrapper close-btn'>
      <button
        {...props}
        aria-label='Close'
        className='bp3-dialog-close-button bp3-button bp3-minimal bp3-icon-large bp3-icon-cross'
      />
    </div>
  )
}

function DeltaDialogBackButton(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <div className='header-button-wrapper back-btn'>
      <button
        {...props}
        className='bp3-button bp3-minimal bp3-icon-large bp3-icon-arrow-left'
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
  React.PropsWithChildren<{
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
>(props => {
  return (
    <DeltaDialogBase
      isOpen={props.isOpen}
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

  const renderDialog: () => JSX.Element | null = () => {
    if (!isOpen) return null
    const Component = DialogComponent as (props: any) => JSX.Element
    return <Component {...{ ...props, isOpen, onClose }} />
  }
  return [renderDialog, showDialog] as [typeof renderDialog, typeof showDialog]
}

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
        'bp3-dialog-header-border-bottom'
      )}
    >
      {showBackButton && <DeltaDialogBackButton onClick={onClickBack} />}
      {title && <h4 className='bp3-heading'>{title}</h4>}
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
        'bp3-dialog-footer-border-top'
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
    style?: any
  }>
) {
  const { noFooter, children, style } = props
  return (
    <div
      ref={props.ref}
      className={classNames(Classes.DIALOG_BODY, {
        'bp3-dialog-body-no-footer': noFooter !== false,
      })}
      style={style}
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

// unused - info: scss class is also comented out
// export function DeltaDialogContentSeperator(props: {
//   style?: React.CSSProperties
// }) {
//   return <div style={props.style} className='delta-dialog-content-seperator' />
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

export function SmallDialog(
  props: PropsWithChildren<{
    isOpen: DialogProps['isOpen']
    onClose: DialogProps['onClose']
  }>
) {
  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      canOutsideClickClose
      className='delta-dialog small-dialog'
    >
      {props.children}
    </Dialog>
  )
}

export type SelectDialogOption = [value: string, label: string]

export function SmallSelectDialog({
  selectedValue,
  values,
  onSave,
  title,
  isOpen,
  onClose,
  onSelect,
  onCancel,
}: {
  title: string
  selectedValue: string
  values: SelectDialogOption[]

  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  onSave?: (selectedValue: string) => void
  onSelect?: (selectedValue: string) => void
  onCancel?: () => void
}) {
  const [actualSelectedValue, setActualSelectedValue] = useState<string>(
    selectedValue
  )

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
    <SmallDialog isOpen={isOpen} onClose={onClose}>
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
}: {
  onCancel: () => any
  onOk: () => any
  disableOK?: boolean
}) {
  const tx = window.static_translate
  disableOK = disableOK === true ? true : false

  return (
    <DeltaDialogFooter>
      <DeltaDialogFooterActions>
        <p
          className='delta-button primary bold'
          style={{ marginRight: '10px' }}
          onClick={onCancel}
        >
          {tx('cancel')}
        </p>
        <p
          //className={ 'delta-button bold primary' + disableOK ? " disabled" : "" }
          className={classNames('delta-button bold primary', {
            disabled: disableOK,
          })}
          onClick={onOk}
        >
          {tx('ok')}
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
        <label className='delta-switch2 bp3-switch bp3-align-right inactive'>
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
