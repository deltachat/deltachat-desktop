import React, { useState } from 'react'
import { Card, Elevation } from '@blueprintjs/core'

import { useTranslationFunction } from '../../contexts'
import { DeltaInput } from '../Login-Styles'
import { DialogProps } from './DialogController'
import { SettingsStoreState } from '../../stores/settings'
import RadioGroup from '../RadioGroup'
import Radio from '../Radio'
import {
  VIDEO_CHAT_INSTANCE_AUTISTICI,
  VIDEO_CHAT_INSTANCE_SYSTEMLI,
} from '../../../shared/constants'
import Dialog, {
  DialogBody,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'

type RadioButtonValue = 'disabled' | 'custom' | 'systemli' | 'autistici'

export default function EditVideochatInstanceDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  settingsStore,
}: DialogProps & { settingsStore: SettingsStoreState }) {
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
    onCancel && onCancel()
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
    <Dialog
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
      <DialogHeader title={tx('videochat')} />
      <DialogBody>
        <Card elevation={Elevation.ONE}>
          <div
            className='bp4-callout'
            style={{
              marginBottom: '20px',
              marginTop: '-20px',
            }}
          >
            {tx('videochat_instance_explain_2')}
          </div>

          <RadioGroup
            onChange={onChangeRadio}
            selectedValue={radioValue}
            name='videochat-instance'
          >
            <Radio key='select-none' label={tx('off')} value='disabled' />
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
              className={'test-videochat-custom'}
            />
          </RadioGroup>
          {radioValue === 'custom' && (
            <>
              <br />
              <div>
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
                <div className='bp4-callout'>
                  {tx('videochat_instance_example')}
                </div>
              </div>
            </>
          )}
        </Card>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}
