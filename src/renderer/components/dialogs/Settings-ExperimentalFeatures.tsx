import React, { useState, useContext, useCallback, useReducer } from 'react'
import { Card, Elevation } from '@blueprintjs/core'
import {
  RenderDeltaSwitch2Type,
  RenderDTSettingSwitchType,
  SettingsSelector,
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
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import RadioGroup from '../RadioGroup'
import Radio from '../Radio'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const VIDEO_CHAT_INSTANCES = [
  ['Systemli', 'https://meet.systemli.org/$ROOM'],
  ['Autistici', 'https://vc.autistici.org/$ROOM'],
]

function getVideoChatInstanceName(url: string): string | null {
  for (const [instance_name, instance_url] of VIDEO_CHAT_INSTANCES) {
    if (instance_url === url) return instance_name
  }
  return null
}

function getVideoChatInstanceUrl(name: string): string | null {
  for (const [instance_name, instance_url] of VIDEO_CHAT_INSTANCES) {
    if (instance_name === name) return instance_url
  }
  return null
}

function useVideoChatInstanceIcon() {
  type Action = {
    blob: string
    instanceName: string
  }
  const [videoChatIcons, dispatch] = useReducer(
    (
      videoChatIcons: Record<string, string>,
      { blob, instanceName }: Action
    ) => {
      return {
        ...videoChatIcons,
        [instanceName]: 'data:image/vnd.microsoft.icon;base64,' + blob,
      }
    },
    {}
  )
  const [ran, setRan] = useState<boolean>(false)
  const getVideoChatIcon = useCallback(
    (name: string) => videoChatIcons[name] || undefined,
    [videoChatIcons]
  )
  if (!ran) {
    for (const [instanceName, instanceUrl] of VIDEO_CHAT_INSTANCES) {
      const url = instanceUrl.replace('$ROOM', 'favicon.ico')
      BackendRemote.rpc
        .getHttpResponse(selectedAccountId(), url)
        .then(response =>
          dispatch({
            blob: response.blob,
            instanceName,
          })
        )
    }
    setRan(true)
  }
  return getVideoChatIcon
}

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
  const { openDialog } = useContext(ScreenContext)
  const getVideoChatIcon = useVideoChatInstanceIcon()

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
      getVideoChatIcon,
      settingsStore,
    })
  }

  const showVideochatInstance = (instance: string) => {
    if (instance === '') {
      return tx('off')
    } else {
      return getVideoChatInstanceName(instance) || tx('custom')
    }
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

type RadioButtonValue = 'disabled' | 'custom' | string

type EditVideochatInstanceDialogExtraProps = {
  settingsStore: SettingsStoreState
  getVideoChatIcon: (name: string) => string | undefined
}

export function EditVideochatInstanceDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  settingsStore,
  getVideoChatIcon,
}: DialogProps & EditVideochatInstanceDialogExtraProps) {
  const tx = useTranslationFunction()
  const [configValue, setConfigValue] = useState(
    settingsStore.settings['webrtc_instance']
  )
  const [radioValue, setRadioValue] = useState<RadioButtonValue>(() => {
    if (configValue === '') {
      return 'disabled'
    } else {
      return getVideoChatInstanceName(configValue) || 'custom'
    }
  })

  const onClickCancel = () => {
    onClose()
    onCancel && onCancel()
  }
  const onClickOk = () => {
    onClose()
    onOk(configValue.trim())
    // the trim is here to not save custom provider if it only contains whitespaces
  }
  const onChangeRadio = (value: string) => {
    let newConfigValue = ''
    const instanceUrl = getVideoChatInstanceUrl(value)
    if (value === 'disabled') {
      newConfigValue = ''
      setRadioValue('disabled')
    } else if (instanceUrl) {
      newConfigValue = instanceUrl
      setRadioValue(value)
    } else {
      newConfigValue = settingsStore.settings['webrtc_instance']
      setRadioValue('custom')
    }
    setConfigValue(newConfigValue)
  }

  const radioGroupChildren = [
    <Radio key='select-none' label={tx('off')} value='disabled' />,
    VIDEO_CHAT_INSTANCES.map(([instanceName, instanceUrl]) => (
      <Radio
        key={instanceName}
        label={instanceName}
        value={instanceName}
        subtitle={instanceUrl}
        icon={getVideoChatIcon(instanceName)}
        iconStyle={{ borderRadius: '6px', padding: '4px' }}
      />
    )),
    <Radio
      key='select-custom'
      label={tx('custom')}
      value='custom'
      className={'test-videochat-custom'}
    />,
  ]
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

          <RadioGroup
            onChange={onChangeRadio}
            selectedValue={radioValue}
            name='videochat-instance'
          >
            {radioGroupChildren.flat()}
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
