import React, { useState, useContext, FormEvent } from 'react'
import { Card, Elevation, Radio, RadioGroup } from '@blueprintjs/core'
import { RenderDTSettingSwitchType, SettingsSelector } from './Settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DeltaInput } from '../Login-Styles'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import { DialogProps } from './DialogController'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'

const WEBRTC_INSTANCE_JITSI = 'https://meet.jit.si/$ROOM'
const WEBRTC_INSTANCE_SYSTEMLI = 'https://meet.systemli.org/$ROOM'
const WEBRTC_INSTANCE_AUTISTICI = 'https://vc.autistici.org/$ROOM'

export function SettingsExperimentalFeatures({
  settingsStore,
  renderDTSettingSwitch,
}: {
  renderDTSettingSwitch: RenderDTSettingSwitchType
  settingsStore: SettingsStoreState
}) {
  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)

  const onClickEdit = async () => {
    openDialog(EditVideochatInstanceDialog, {
      onOk: async (configValue: string) => {
        SettingsStoreInstance.effect.setCoreSetting(
          'webrtc_instance',
          configValue
        )
        if (configValue === '') {
          SettingsStoreInstance.effect.setDesktopSetting('enableAVCalls', false)
        } else {
          SettingsStoreInstance.effect.setDesktopSetting('enableAVCalls', true)
        }
      },
      settingsStore,
    })
  }

  const showVideochatInstance = (instance: string) => {
    if (instance === '') {
      return tx('off')
    } else if (instance === WEBRTC_INSTANCE_SYSTEMLI) {
      return 'Systemli'
    } else if (instance === WEBRTC_INSTANCE_AUTISTICI) {
      return 'Autistici'
    } else if (instance === WEBRTC_INSTANCE_JITSI) {
      return 'Jitsi'
    }
    return instance
  }

  return (
    <>
      {renderDTSettingSwitch({
        key: 'enableBroadcastLists',
        label: tx('broadcast_lists'),
        description: tx('chat_new_broadcast_hint'),
      })}
      {renderDTSettingSwitch({
        key: 'enableOnDemandLocationStreaming',
        label: tx('pref_on_demand_location_streaming'),
      })}
      {renderDTSettingSwitch({
        key: 'enableChatAuditLog',
        label: tx('menu_chat_audit_log'),
      })}
      <SettingsSelector
        onClick={onClickEdit.bind(null, false)}
        currentValue={showVideochatInstance(
          settingsStore.settings['webrtc_instance']
        )}
      >
        {tx('videochat')}
      </SettingsSelector>
    </>
  )
}

type RadioButtonValue =
  | 'disabled'
  | 'jitsi'
  | 'custom'
  | 'systemli'
  | 'autistici'

export function EditVideochatInstanceDialog({
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
    } else if (configValue === WEBRTC_INSTANCE_SYSTEMLI) {
      return 'systemli'
    } else if (configValue === WEBRTC_INSTANCE_AUTISTICI) {
      return 'autistici'
    } else if (configValue === WEBRTC_INSTANCE_JITSI) {
      return 'jitsi'
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
    onOk(configValue)
  }
  const onChangeRadio = (event: FormEvent<HTMLInputElement>) => {
    const currentRadioValue = event.currentTarget.value as RadioButtonValue
    let newConfigValue = ''
    if (currentRadioValue === 'disabled') {
      newConfigValue = ''
      setRadioValue('disabled')
    } else if (currentRadioValue === 'systemli') {
      newConfigValue = WEBRTC_INSTANCE_SYSTEMLI
      setRadioValue('systemli')
    } else if (currentRadioValue === 'autistici') {
      newConfigValue = WEBRTC_INSTANCE_AUTISTICI
      setRadioValue('autistici')
    } else if (currentRadioValue === 'jitsi') {
      newConfigValue = WEBRTC_INSTANCE_JITSI
      setRadioValue('jitsi')
    } else {
      newConfigValue = settingsStore.settings['webrtc_instance']
      setRadioValue('custom')
    }
    setConfigValue(newConfigValue)
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
      <DeltaDialogHeader title={tx('videochat')} />
      <DeltaDialogBody>
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

          <RadioGroup onChange={onChangeRadio} selectedValue={radioValue}>
            <Radio key='select-none' label={tx('off')} value='disabled' />
            <Radio key='select-systemli' label='Systemli' value='systemli' />
            <Radio key='select-autistici' label='Autistici' value='autistici' />
            <Radio key='select-jitsi' label='Jitsi' value='jitsi' />
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
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
