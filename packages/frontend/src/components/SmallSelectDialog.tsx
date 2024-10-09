import React, { useState } from 'react'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from './Dialog'
import Radio from './Radio'
import RadioGroup from './RadioGroup'
import FooterActionButton from './Dialog/FooterActionButton'
import useTranslationFunction from '../hooks/useTranslationFunction'

import type { DialogProps } from '../contexts/DialogContext'

export type SelectDialogOption = [value: string, label: string]

type Props = {
  title: string
  selectedValue: string
  values: SelectDialogOption[]
  onSave?: (selectedValue: string) => void
  onSelect?: (selectedValue: string) => void
  onCancel?: () => void
} & DialogProps

export default function SmallSelectDialog({
  selectedValue,
  values,
  onSave,
  title,
  onClose,
  onSelect,
  onCancel,
}: Props) {
  const tx = useTranslationFunction()

  const [actualSelectedValue, setActualSelectedValue] =
    useState<string>(selectedValue)

  const onChange = (value: string) => {
    setActualSelectedValue(value)
    onSelect && onSelect(value)
  }

  const saveAndClose = () => {
    onSave && onSave(actualSelectedValue)
    onClose()
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={title} />
      <DialogBody>
        <DialogContent>
          <RadioGroup
            onChange={onChange}
            selectedValue={actualSelectedValue}
            name='small-dialog-value'
          >
            {values.map((element, index) => {
              const [value, label] = element
              return (
                <Radio key={'select-' + index} label={label} value={value} />
              )
            })}
          </RadioGroup>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton
            onClick={() => {
              onCancel && onCancel()
              onClose()
            }}
          >
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton onClick={saveAndClose}>
            {tx('save_desktop')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
