import React, { useState } from 'react'

import { DeltaInput } from '../Login-Styles'
import { SettingsStoreState } from '../../stores/settings'
import RadioGroup from '../RadioGroup'
import Radio from '../Radio'
import { VIDEO_CHAT_INSTANCES } from '../../../shared/constants'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import Callout from '../Callout'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type RadioButtonValue =
  | 'disabled'
  | 'custom'
  | keyof typeof VIDEO_CHAT_INSTANCES

type Props = {
  onOk: (configValue: string) => void
  settingsStore: SettingsStoreState
}

export function getVideoChatIdByUrl(url: string): string | undefined {
  const url_ = url
  for (const [id, { url }] of Object.entries(VIDEO_CHAT_INSTANCES)) {
    if (url_ === url) {
      return id
    }
  }
}

function getVideoChatUrlById(id: string): string | undefined {
  const instance = VIDEO_CHAT_INSTANCES[id]
  return instance && instance.url
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
    }
    const id = getVideoChatIdByUrl(configValue)
    return id ? (id as RadioButtonValue) : 'custom'
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
    } else {
      const url = getVideoChatUrlById(value)
      if (url) {
        newConfigValue = url
        setRadioValue(value as RadioButtonValue)
      } else {
        newConfigValue = settingsStore.settings['webrtc_instance']
        setRadioValue('custom')
      }
    }
    setConfigValue(newConfigValue)
  }
  const radios = [
    <Radio key='select-none' label={tx('off')} value='disabled' />,
    ...Object.entries(VIDEO_CHAT_INSTANCES).map(
      ([instanceId, instanceProps]: [string, any]) => (
        <Radio
          key={'select-' + instanceId}
          label={instanceProps.name}
          value={instanceId}
          icon={instanceProps.icon}
          iconSize='24px'
          iconRound
          iconWithBackground
          subtitle={instanceProps.url}
        />
      )
    ),
    <Radio
      key='select-custom'
      label={tx('custom')}
      value='custom'
      className='test-videochat-custom'
    />,
  ]
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
            {radios}
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
