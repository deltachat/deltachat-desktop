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
  description?: string
  onOk: (value: string) => void
  onCancel?: () => void
}

export default function TextDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  defaultValue,
  description,
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
          {description && (
            <DeltaDialogContent>
              <p>{description}</p>
            </DeltaDialogContent>
          )}

          <DeltaInput
            key='contactname'
            id='contactname'
            placeholder={tx('name_desktop')}
            value={value}
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
