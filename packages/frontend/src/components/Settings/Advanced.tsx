import React, { useEffect, useState, useCallback } from 'react'

import { SettingsStoreState } from '../../stores/settings'
import Encryption from './Encryption'
import { ExperimentalFeatures } from './ExperimentalFeatures'
import ImapFolderHandling from './ImapFolderHandling'
import SettingsHeading from './SettingsHeading'
import SettingsSeparator from './SettingsSeparator'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import Communication from './Communication'
import EditAccountAndPasswordDialog from '../dialogs/EditAccountAndPasswordDialog'
import useDialog from '../../hooks/dialog/useDialog'
import SettingsButton from './SettingsButton'
import { runtime } from '@deltachat-desktop/runtime-interface'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import { AutostartState } from '@deltachat-desktop/shared/shared-types'
import Callout from '../Callout'

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
      {/*
        don't show it on electron yet, as the message "not available on this runtime/platform"
        would confuse users as long as tauri is not the default */}
      {runtime.getRuntimeInfo().target === 'tauri' && <SettingsAutoStart />}
      <Communication settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_experimental_features')}</SettingsHeading>
      <ExperimentalFeatures settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_encryption')}</SettingsHeading>
      <Encryption settingsStore={settingsStore} />
      <SettingsSeparator />

      <SettingsHeading>{tx('pref_server')}</SettingsHeading>
      <SettingsButton
        onClick={() => {
          openDialog(EditAccountAndPasswordDialog, {
            settingsStore,
          })
        }}
      >
        {tx('pref_password_and_account_settings')}
      </SettingsButton>
      {settingsStore.settings.is_chatmail == '0' && (
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
        settingsKey='autostart'
        label={tx('pref_autostart')}
        description={
          autostartState
            ? autostartState.isRegistered
              ? tx('pref_autostart_registered')
              : tx('pref_autostart_not_registered')
            : undefined // don't show description while it is loading
        }
        disabled={!autostartState?.isSupported}
        disabledValue={false}
        callback={update}
      />
      {autostartState && !autostartState.isSupported && (
        <Callout>{tx('pref_autostart_not_supported')}</Callout>
      )}
    </>
  )
}
