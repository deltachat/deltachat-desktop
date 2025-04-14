import React, { useEffect, useState, useCallback } from 'react'

import type { SettingsStoreState } from '../../stores/settings'
import Encryption from './Encryption'
import { ExperimentalFeatures } from './ExperimentalFeatures'
import ImapFolderHandling from './ImapFolderHandling'
import SettingsHeading from './SettingsHeading'
import SettingsSeparator from './SettingsSeparator'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import EditAccountAndPasswordDialog from '../dialogs/EditAccountAndPasswordDialog'
import useDialog from '../../hooks/dialog/useDialog'
import SettingsButton from './SettingsButton'
import { runtime } from '@deltachat-desktop/runtime-interface'
import CoreSettingsSwitch from './CoreSettingsSwitch'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import { AutostartState } from '@deltachat-desktop/shared/shared-types'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Advanced({ settingsStore }: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  return (
    <>
      <SettingsButton onClick={() => runtime.openLogFile()}>
        {tx('pref_view_log')}
      </SettingsButton>
      <CoreSettingsSwitch
        label={tx('enable_realtime')}
        settingsKey='webxdc_realtime_enabled'
        description={tx('enable_realtime_explain')}
      />

      {/*
        don't show it on electron yet, as the message "not available on this runtime/platform"
        would confuse users as long as tauri is not the default */}
      {runtime.getRuntimeInfo().target === 'tauri' && <SettingsAutoStart />}

      <SettingsSeparator />

      <SettingsHeading>{tx('pref_experimental_features')}</SettingsHeading>
      <ExperimentalFeatures settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_encryption')}</SettingsHeading>
      <Encryption />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_server')}</SettingsHeading>
      <SettingsButton
        onClick={() => {
          openDialog(EditAccountAndPasswordDialog, {
            settingsStore,
          })
        }}
        dataTestid='open-account-and-password'
      >
        {tx('pref_password_and_account_settings')}
      </SettingsButton>
      {settingsStore.settings.is_chatmail === '0' && (
        <ImapFolderHandling settingsStore={settingsStore} />
      )}
    </>
  )
}

function SettingsAutoStart() {
  const tx = useTranslationFunction()

  const [autostartState, setAutostartState] = useState<AutostartState | null>(
    null
  )
  const update = useCallback(() => {
    runtime.getAutostartState().then(setAutostartState)
  }, [])

  useEffect(() => {
    update()
  }, [update])

  return (
    <>
      <DesktopSettingsSwitch
        // force react to rerender element, so that the switch does not animate
        key={String(!autostartState)}
        settingsKey='autostart'
        label={tx('pref_autostart')}
        description={
          autostartState
            ? autostartState.isSupported
              ? autostartState.isRegistered
                ? tx('pref_autostart_registered')
                : tx('pref_autostart_not_registered')
              : tx('pref_autostart_not_supported')
            : undefined // don't show description while it is loading
        }
        disabled={!autostartState?.isSupported}
        disabledValue={false}
        callback={update}
      />
    </>
  )
}
