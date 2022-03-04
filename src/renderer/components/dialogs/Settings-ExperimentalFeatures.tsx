import React from 'react'
import { H5 } from '@blueprintjs/core'
import { RenderDTSettingSwitchType, SettingsState } from './Settings'


export function SettingsExperimentalFeatures({
  state,
  renderDTSettingSwitch,
  DeltaSettingsInput,
}: {
  state: SettingsState
  renderDTSettingSwitch: RenderDTSettingSwitchType
  DeltaSettingsInput: any
}) {
  const tx = window.static_translate

return (
  <>
    <H5>{tx('pref_experimental_features')}</H5>
      {renderDTSettingSwitch(
        'enableOnDemandLocationStreaming',
        tx('pref_on_demand_location_streaming')
      )}
      {renderDTSettingSwitch(
        'minimizeToTray',
        tx('pref_show_tray_icon'),
        state.rc?.minimized,
        state.rc?.minimized
      )}
      {state.rc?.minimized && (
        <div className='bp3-callout'>
          {tx('explain_desktop_minimized_disabled_tray_pref')}
        </div>
      )}
      {renderDTSettingSwitch(
        'enableChatAuditLog',
        tx('menu_chat_audit_log')
      )}
      {renderDTSettingSwitch('enableAVCalls', tx('videochat'))}
      {state.settings.enableAVCalls === true && (
        <>
          <DeltaSettingsInput
            configKey='webrtc_instance'
            label={tx('videochat_instance')}
            style={{ width: '100%' }}
          />
          <div className='bp3-callout'>
            {tx('videochat_instance_explain')}
          </div>
        </>
      )}
      <br />
  </>
)
}
