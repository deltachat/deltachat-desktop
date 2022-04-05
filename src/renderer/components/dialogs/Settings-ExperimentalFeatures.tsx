import React, { useState, useContext, FormEvent } from 'react'
import { Card, Elevation, H5, Radio, RadioGroup } from '@blueprintjs/core'
import {
  RenderDTSettingSwitchType,
  SettingsSelector,
  SettingsState,
} from './Settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DeltaInput } from '../Login-Styles'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import { DialogProps } from './DialogController'


const WEBRTC_INSTANCE_JITSI = 'https://meet.jit.si/$ROOM'

export function SettingsExperimentalFeatures({
  renderDTSettingSwitch,
  state,
  handleDeltaSettingsChange,
  handleDesktopSettingsChange,
}: {
  renderDTSettingSwitch: RenderDTSettingSwitchType
  state: SettingsState
  handleDeltaSettingsChange: any
  handleDesktopSettingsChange: any
}) {
  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)

  const onClickEdit = async () => {
    openDialog(EditVideochatInstanceDialog, {
      onOk: async (configValue: string) => {
        handleDeltaSettingsChange('webrtc_instance', configValue)
        if (configValue === '') {
          handleDesktopSettingsChange('enableAVCalls', false)
        } else {
          handleDesktopSettingsChange('enableAVCalls', true)
        }
      },
      state: state,
    })
  }

  const showVideochatInstance = (instance: string) => {
    if (instance === '') {
      return tx('off')
    } else if (instance === WEBRTC_INSTANCE_JITSI) {
      return 'Jitsi'
    }
    return instance
  }

  return (
    <>
      {renderDTSettingSwitch({
        key: 'enableOnDemandLocationStreaming',
        label: tx('pref_on_demand_location_streaming'),
      })}
      {renderDTSettingSwitch({
        key: 'minimizeToTray',
        label: tx('pref_show_tray_icon'),
        disabled: state.rc?.minimized,
        disabledValue: state.rc?.minimized,
      })}
      {state.rc?.minimized && (
        <div className='bp3-callout'>
          {tx('explain_desktop_minimized_disabled_tray_pref')}
        </div>
      )}
      {renderDTSettingSwitch({
        key: 'enableChatAuditLog',
        label: tx('menu_chat_audit_log'),
      })}
      <SettingsSelector
        onClick={onClickEdit.bind(null, false)}
        currentValue={showVideochatInstance(state.settings['webrtc_instance'])}
      >
        {tx('videochat')}
      </SettingsSelector>
    </>
  )
}

type RadioButtonValue = 'disabled' | 'jitsi' | 'custom'

export function EditVideochatInstanceDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  state,
}: DialogProps) {
  const tx = useTranslationFunction()
  const [configValue, setConfigValue] = useState(
    state.settings['webrtc_instance']
  )
  const [radioValue, setRadioValue] = useState<RadioButtonValue>(() => {
    if (configValue === '') {
      return 'disabled'
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
    } else if (currentRadioValue === 'jitsi') {
      newConfigValue = WEBRTC_INSTANCE_JITSI
      setRadioValue('jitsi')
    } else {
      newConfigValue = state.settings['webrtc_instance']
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
      <DeltaDialogHeader title={tx('videochat')} showBackButton/>
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
          <div
            className='bp3-callout'
            style={{
              marginBottom: '20px',
              marginTop: '-20px',
            }}
          >
            {tx('videochat_instance_explain_2')}
          </div>

          <RadioGroup onChange={onChangeRadio} selectedValue={radioValue}>
            <Radio key='select-none' label={tx('off')} value='disabled' />
            <Radio key='select-jitsi' label='Jitsi' value='jitsi' />
            <Radio key='select-custom' label={tx('custom')} value='custom' />
          </RadioGroup>
          {radioValue === 'custom' && (
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
              <div className='bp3-callout'>
                {tx('videochat_instance_example')}
              </div>
            </div>
          )}
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
