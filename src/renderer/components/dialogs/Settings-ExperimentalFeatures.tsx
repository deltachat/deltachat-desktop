import React, { useState, useContext } from 'react'
import { Card, Elevation, H5 } from '@blueprintjs/core'
import { RenderDTSettingSwitchType, SettingsSelector, SettingsState } from './Settings'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DeltaInput } from '../Login-Styles'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogOkCancelFooter } from './DeltaDialog'
import { DialogProps } from './DialogController'


export function SettingsExperimentalFeatures({
  renderDTSettingSwitch,
  state,
  handleDeltaSettingsChange,
}: {
  renderDTSettingSwitch: RenderDTSettingSwitchType
  state: SettingsState
  handleDeltaSettingsChange: any
}) {
  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)
  const onClickEdit = async () => {
    openDialog(EditVideochatInstanceDialog, {
      onOk: async (instance: string) => {
        handleDeltaSettingsChange('webrtc_instance', instance)
      },
      state: state,
      configKey: 'webrtc_instance'
    })
  }

  return (
    <>
      <H5>{tx('pref_experimental_features')}</H5>
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
        currentValue={state.settings['webrtc_instance']}
      >
        {tx('videochat_instance')}
      </SettingsSelector>
      // TODO: Get rid of switch and make default true?
      {renderDTSettingSwitch({
        key: 'enableAVCalls',
        label: tx('videochat'),
      })}
      <br />
    </>
  )
}

export function EditVideochatInstanceDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  configKey,
  state
}: DialogProps) {
  const tx = useTranslationFunction()
  const [value, setValue] = useState(state.settings[configKey])

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
      <DeltaDialogHeader title={'Edit videocall instance'} />
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
          <DeltaInput
            key='webrtc_instance'
            id='webrtc_instance'
            value={value}
            placeholder={'Add videochat instance here'}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setValue(event.target.value)
            }}
          />
          <div className='bp3-callout'>{tx('videochat_instance_explain')}</div>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}