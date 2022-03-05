import React from 'react'
import { H5 } from '@blueprintjs/core'
import { RenderDTSettingSwitchType, SettingsState } from './Settings'
// import { DesktopSettings } from '../../../shared/shared-types'

export function SettingsExperimentalFeatures({
  // desktopSettings,
  renderDTSettingSwitch,
  state,
  DeltaSettingsInput,
}: {
  // desktopSettings: DesktopSettings
  renderDTSettingSwitch: RenderDTSettingSwitchType
  state: SettingsState
  DeltaSettingsInput: any
}) {
  const tx = window.static_translate

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
      {renderDTSettingSwitch({
        key: 'enableAVCalls',
        label: tx('videochat'),
      })}
      {state.settings.enableAVCalls === true && (
        <>
          <DeltaSettingsInput
            configKey='webrtc_instance'
            label={tx('videochat_instance')}
            style={{ width: '100%' }}
          />
          <div className='bp3-callout'>{tx('videochat_instance_explain')}</div>
        </>
      )}
      <br />
    </>
  )
}
