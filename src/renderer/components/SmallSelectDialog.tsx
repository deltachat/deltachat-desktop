import React, { useState } from 'react'
import { RadioGroup, Radio } from '@blueprintjs/core'

import SmallDialog from './SmallDialog'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from './Dialog'
import { DialogProps } from './dialogs/DialogController'
import { useTranslationFunction } from '../contexts'
import FooterActionButton from './Dialog/FooterActionButton'

export type SelectDialogOption = [value: string, label: string]

type Props = {
  title: string
  selectedValue: string
  values: SelectDialogOption[]
  onSave?: (selectedValue: string) => void
  onSelect?: (selectedValue: string) => void
  onCancel?: () => void
  onOpen?: DialogProps['onOpen']
} & Pick<DialogProps, 'isOpen' | 'onClose'>

export default function SmallSelectDialog({
  selectedValue,
  values,
  onSave,
  title,
  isOpen,
  onClose,
  onSelect,
  onCancel,
}: Props) {
  const tx = useTranslationFunction()

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

  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader title={title} />
      <DialogBody>
        <DialogContent>
          <RadioGroup onChange={onChange} selectedValue={actualSelectedValue}>
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
    </SmallDialog>
  )
}
