import React from 'react'

import {
  DesktopSettingsStoreInstance,
  useDesktopSettingsStore,
} from '../../stores/settings'
import DesktopSettingsSwitch from './DesktopSettingsSwitch'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import SettingsSwitch from './SettingsSwitch'
import { runtime } from '@deltachat-desktop/runtime-interface'
import useDialog from '../../hooks/dialog/useDialog'
import AlertDialog from '../dialogs/AlertDialog'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import { DialogProps } from '../../contexts/DialogContext'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { DeltaInput } from '../Login-Styles'
import SettingsSelector from './SettingsSelector'
import { defaultAppStoreBaseUrl } from '@deltachat-desktop/shared/state'
import type { DesktopSettingsType } from '@deltachat-desktop/shared/shared-types'

const log = getLogger('ExperimentalFeatures')

export function ExperimentalFeatures() {
  const tx = useTranslationFunction()
  const desktopSettingsStore = useDesktopSettingsStore()[0]
  const { openDialog } = useDialog()

  const showExperimentalInfoDialog = async (
    settingsKey: keyof Pick<
      DesktopSettingsType,
      'enableOnDemandLocationStreaming'
    >,
    updatedValue: boolean
  ) => {
    if (!updatedValue) {
      return
    }
    let message: string
    // The strings are copy-pasted from
    // https://github.com/deltachat/deltachat-android/blob/2385b236c7ed9eb0e26ef819d8274936877b7023/src/main/java/org/thoughtcrime/securesms/preferences/AdvancedPreferenceFragment.java

    switch (settingsKey) {
      case 'enableOnDemandLocationStreaming':
        message =
          'Thanks for trying out "On-Demand Location Streaming"\n\n' +
          '• If enabled you will find a map icon above the message list, which opens a map with shared locations of your contacts' +
          '\n\n• Sharing your own location is only available in mobile clients'
        break
    }

    message +=
      '\n\n• If you want to quit the experimental feature, you can disable it at "Settings / Advanced"'
    openDialog(AlertDialog, { message })
  }

  return (
    <>
      <DesktopSettingsSwitch
        settingsKey='enableOnDemandLocationStreaming'
        label={tx('pref_on_demand_location_streaming')}
        callback={value =>
          showExperimentalInfoDialog('enableOnDemandLocationStreaming', value)
        }
      />
      {runtime.getRuntimeInfo().isContentProtectionSupported && (
        <DesktopSettingsSwitch
          settingsKey='contentProtectionEnabled'
          label={tx('pref_screen_security')}
          description={tx('pref_screen_security_explain')}
        />
      )}
      <SyncAllAccountsSwitch />
      <SettingsSelector
        onClick={() => openDialog(AppPickerUrlDialog)}
        currentValue={
          desktopSettingsStore == undefined
            ? undefined
            : desktopSettingsStore.appStoreBaseUrl || defaultAppStoreBaseUrl
        }
      >
        {tx('webxdc_store_url')}
      </SettingsSelector>
    </>
  )
}

function SyncAllAccountsSwitch() {
  const tx = useTranslationFunction()
  const desktopSettingsStore = useDesktopSettingsStore()[0]

  return (
    <SettingsSwitch
      label={tx('pref_background_sync_disabled')}
      description={tx('explain_background_sync_disabled')}
      value={desktopSettingsStore?.syncAllAccounts !== true}
      disabled={desktopSettingsStore == null}
      onChange={() => {
        if (desktopSettingsStore == null) {
          return
        }
        DesktopSettingsStoreInstance.effect.set(
          'syncAllAccounts',
          !desktopSettingsStore.syncAllAccounts
        )
      }}
    />
  )
}

function AppPickerUrlDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const desktopSettingsStore = useDesktopSettingsStore()[0]

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={tx('webxdc_store_url')} onClose={onClose} />
      <form
        action={formData => {
          const url = formData.get('url')
          if (typeof url !== 'string') {
            log.error('App picker URL form submitted, but URL is', url)
            return
          }
          DesktopSettingsStoreInstance.effect.set(
            'appStoreBaseUrl',
            url === '' ? undefined : url
          )
          onClose()
        }}
      >
        <DialogBody>
          <DialogContent>
            <p className='whitespace'>{tx('webxdc_store_url_explain')}</p>
            <p className='whitespace'>
              {tx('webxdc_store_url_explain_2_desktop')}
            </p>
            {desktopSettingsStore && (
              <DeltaInput
                value={undefined}
                placeholder={defaultAppStoreBaseUrl}
                onChange={() => {}}
                type='url'
                name='url'
                defaultValue={desktopSettingsStore.appStoreBaseUrl}
              />
            )}
          </DialogContent>
        </DialogBody>
        <DialogFooter>
          <FooterActions>
            <FooterActionButton onClick={onClose}>
              {tx('cancel')}
            </FooterActionButton>
            <FooterActionButton type='submit' styling='primary'>
              {tx('save')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
