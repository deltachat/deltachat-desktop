import React, { useState, useContext } from 'react'
import classNames from 'classnames'
import { Card, Elevation } from '@blueprintjs/core'
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

const VIDEO_CHAT_INSTANCE_SYSTEMLI = 'https://meet.systemli.org/$ROOM'
const VIDEO_CHAT_INSTANCE_AUTISTICI = 'https://vc.autistici.org/$ROOM'

type RadioProps = {
  onSelect?: () => void
  selected?: boolean
  label: string
  value: string
  className?: string
  name?: string
  subtitle?: string
}

type RadioGroupProps = {
  onChange?: (value: string) => void
  children: any
  selectedValue: string
  name: string
}

function Radio({
  onSelect,
  selected,
  label,
  value,
  className,
  name,
  subtitle,
}: RadioProps) {
  const id: string = Math.floor(Math.random() * 10000).toString()
  return (
    <div className={classNames('radiobutton', className)}>
      <input
        id={id}
        name={name}
        type='radio'
        onClick={() => onSelect && onSelect()}
        value={value}
        defaultChecked={Boolean(selected)}
      />
      <label htmlFor={id} className={classNames(!subtitle && 'no-subtitle')}>
        <span>{label}</span>
        {subtitle && <span>{subtitle}</span>}
      </label>
    </div>
  )
}

function RadioGroup({
  onChange,
  children,
  selectedValue,
  name,
}: RadioGroupProps) {
  return (
    <form>
      <fieldset className='radiogroup'>
        {children.map((radio: any) => {
          return (
            <Radio
              {...radio.props}
              selected={radio.props.value === selectedValue}
              onSelect={() => onChange && onChange(radio.props.value)}
              name={name}
            />
          )
        })}
      </fieldset>
    </form>
  )
}

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
      })}
      {renderDTSettingSwitch({
        key: 'experimentalEnableMarkdownInMessages',
        label: 'Render Markdown in Messages',
      })}
      {renderDTSettingSwitch({
        key: 'enableWebxdcDevTools',
        label: 'Enable Webxdc Devtools',
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

type RadioButtonValue = 'disabled' | 'custom' | 'systemli' | 'autistici'

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

  const subtitle = (value: string) => {
    return value.replace('$ROOM', '')
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
              subtitle={subtitle(VIDEO_CHAT_INSTANCE_SYSTEMLI)}
            />
            <Radio
              key='select-autistici'
              label='Autistici'
              value='autistici'
              subtitle={subtitle(VIDEO_CHAT_INSTANCE_AUTISTICI)}
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
