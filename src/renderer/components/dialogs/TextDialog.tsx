import React, { useState } from 'react'
import { DeltaInput } from '../Login-Styles'
import { DialogProps } from './DialogController'
import { Card, Elevation } from '@blueprintjs/core'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import { useTranslationFunction } from '../../contexts'

type TextDialogProps = {
  defaultValue?: string
  message?: string
  onOk: (value: string) => void
  onCancel?: () => void
  placeholder?: string
  type?: string
}

export default function TextDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  defaultValue,
  placeholder,
  type,
  message,
}: DialogProps & TextDialogProps) {
  const [value, setValue] = useState(defaultValue || '')
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
    onCancel && onCancel()
  }
  const onClickOk = () => {
    onClose()
    onOk(value)
  }
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        top: '15vh',
        width: '500px',
        maxHeight: '70vh',
        height: 'auto',
      }}
      fixed
    >
      <DeltaDialogHeader title={tx('menu_edit_name')} />
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
          {message && (
            <DeltaDialogContent>
              <p>{message}</p>
            </DeltaDialogContent>
          )}

          <DeltaInput
            key='contactname'
            id='contactname'
            placeholder={placeholder}
            value={value}
            type={type}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setValue(event.target.value)
            }}
          />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
