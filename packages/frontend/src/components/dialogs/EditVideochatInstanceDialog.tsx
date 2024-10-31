import React, { useState } from 'react'

import { DeltaInput } from '../Login-Styles'
import { SettingsStoreState } from '../../stores/settings'
import RadioGroup from '../RadioGroup'
import Radio from '../Radio'
import {
  VIDEO_CHAT_INSTANCE_AUTISTICI,
  VIDEO_CHAT_INSTANCE_SYSTEMLI,
} from '../../../../shared/constants'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import Callout from '../Callout'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type RadioButtonValue = 'disabled' | 'custom' | 'systemli' | 'autistici'

type Props = {
  onOk: (configValue: string) => void
  settingsStore: SettingsStoreState
}

export default function EditVideochatInstanceDialog({
  onClose,
  onOk,
  settingsStore,
}: DialogProps & Props) {
  const tx = useTranslationFunction()
  const [configValue, setConfigValue] = useState(
    settingsStore.settings['webrtc_instance']
  )
  const [radioValue, setRadioValue] = useState<RadioButtonValue>(() => {
    if (configValue === '') {
      return 'disabled'
    } else if (configValue === VIDEO_CHAT_INSTANCE_SYSTEMLI) {
      return 'systemli'
    } else if (configValue === VIDEO_CHAT_INSTANCE_AUTISTICI) {
      return 'autistici'
    } else {
      return 'custom'
    }
  })

  const onClickCancel = () => {
    onClose()
  }

  const onClickOk = () => {
    onClose()
    onOk(configValue.trim()) // the trim is here to not save custom provider if it only contains whitespaces
  }

  const onChangeRadio = (value: string) => {
    let newConfigValue = ''
    if (value === 'disabled') {
      newConfigValue = ''
      setRadioValue('disabled')
    } else if (value === 'systemli') {
      newConfigValue = VIDEO_CHAT_INSTANCE_SYSTEMLI
      setRadioValue('systemli')
    } else if (value === 'autistici') {
      newConfigValue = VIDEO_CHAT_INSTANCE_AUTISTICI
      setRadioValue('autistici')
    } else {
      newConfigValue = settingsStore.settings['webrtc_instance']
      setRadioValue('custom')
    }
    setConfigValue(newConfigValue)
  }

  return (
    <Dialog onClose={onClose} canOutsideClickClose={false}>
      <DialogHeader title={tx('videochat')} />
      <DialogBody>
        <Callout>{tx('videochat_instance_explain_2')}</Callout>
        <DialogContent>
          <RadioGroup
            onChange={onChangeRadio}
            selectedValue={radioValue}
            name='videochat-instance'
          >
            <Radio
              key='select-none'
              label={tx('off')}
              value='disabled'
              subtitle=''
            />
            <Radio
              key='select-systemli'
              label='Systemli'
              value='systemli'
              subtitle={VIDEO_CHAT_INSTANCE_SYSTEMLI}
            />
            <Radio
              key='select-autistici'
              label='Autistici'
              value='autistici'
              subtitle={VIDEO_CHAT_INSTANCE_AUTISTICI}
            />
            <Radio
              key='select-custom'
              label={tx('custom')}
              value='custom'
              subtitle=''
              className={'test-videochat-custom'}
            />
          </RadioGroup>
        </DialogContent>
        {radioValue === 'custom' && (
          <>
            <DialogContent paddingTop>
              <DeltaInput
                key='custom_webrtc_instance'
                id='custom_webrtc_instance'
                value={configValue}
                placeholder={tx('videochat_instance_placeholder')}
                onChange={(
                  event: React.FormEvent<HTMLElement> &
                    React.ChangeEvent<HTMLInputElement>
                ) => {
                  setConfigValue(event.target.value)
                }}
              />
            </DialogContent>
            <Callout>{tx('videochat_instance_example')}</Callout>
          </>
        )}
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}
