import React, { useState } from 'react'
import { Card, Elevation } from '@blueprintjs/core'

import {
  RenderDeltaSwitch2Type,
  RenderDTSettingSwitchType,
  SettingsSelector,
} from './Settings'
import { DeltaInput } from '../Login-Styles'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import RadioGroup from '../RadioGroup'
import Radio from '../Radio'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

const VIDEO_CHAT_INSTANCE_SYSTEMLI = 'https://meet.systemli.org/$ROOM'
const VIDEO_CHAT_INSTANCE_AUTISTICI = 'https://vc.autistici.org/$ROOM'

export function SettingsExperimentalFeatures({
  settingsStore,
  renderDTSettingSwitch,
  renderDeltaSwitch2,
}: {
  renderDTSettingSwitch: RenderDTSettingSwitchType
  settingsStore: SettingsStoreState
  renderDeltaSwitch2: RenderDeltaSwitch2Type
}) {
  const tx = window.static_translate
  const { openDialog } = useDialog()

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
    } else if (instance === VIDEO_CHAT_INSTANCE_SYSTEMLI) {
      return 'Systemli'
    } else if (instance === VIDEO_CHAT_INSTANCE_AUTISTICI) {
      return 'Autistici'
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
        description: tx('chat_audit_log_description'),
      })}
      {renderDTSettingSwitch({
        key: 'enableRelatedChats',
        label: tx('related_chats'),
      })}
      {renderDTSettingSwitch({
        key: 'experimentalEnableMarkdownInMessages',
        label: 'Render Markdown in Messages',
      })}
      {renderDTSettingSwitch({
        key: 'enableWebxdcDevTools',
        label: 'Enable Webxdc Devtools',
        // See https://delta.chat/en/2023-05-22-webxdc-security,
        // "XDC-01-004 WP1: Data exfiltration via desktop app DevTools"
        //
        // Although thanks to another hardening measure this shouldn't be
        // easy to pull off. Namely, direct internet access is sort of
        // disabled for the Electron part of the app:
        // 853b584251a5dacf60ebc616f7fb10edffb5c5e5/src/main/index.ts#L12-L21
        description:
          'Careful: opening developer tools on a malicious webxdc app could lead to the app getting access to the Internet',
      })}
      {renderDeltaSwitch2({
        label: tx('disable_imap_idle'),
        key: 'disable_idle',
        description: tx('disable_imap_idle_explain'),
      })}
      <SettingsSelector
        onClick={onClickEdit.bind(null)}
        currentValue={showVideochatInstance(
          settingsStore.settings['webrtc_instance']
        )}
      >
        {tx('videochat')}
      </SettingsSelector>
    </>
  )
}

type RadioButtonValue = 'disabled' | 'custom' | 'systemli' | 'autistici'

export function EditVideochatInstanceDialog({
  settingsStore,
  onOk,
  ...dialogProps
}: DialogProps & {
  settingsStore: SettingsStoreState
  onOk: (configValue: string) => Promise<void>
}) {
  const { onClose } = dialogProps
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
    <DeltaDialogBase
      onClose={onClose}
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
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
