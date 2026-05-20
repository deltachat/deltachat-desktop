import React, { useEffect, useCallback } from 'react'

import { useSettingsStore } from '../../stores/settings'
import { SendBackupDialog } from '../dialogs/SetupMultiDevice'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { donationUrl } from '../../../../shared/constants'
import SettingsIconButton from './SettingsIconButton'
import ConnectivityButton from './ConnectivityButton'
import ChatsAndMedia from './ChatsAndMedia'
import Notifications from './Notifications'
import About from '../dialogs/About'
import Appearance from './Appearance'
import Advanced from './Advanced'
import Profile from './Profile'
import Dialog, { DialogBody, DialogHeader } from '../Dialog'
import EditProfileDialog from '../dialogs/EditProfileDialog'
import SettingsSeparator, { SettingsEndSeparator } from './SettingsSeparator'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type SettingsView =
  | 'chats_and_media'
  | 'notifications'
  | 'appearance'
  | 'advanced'

export default function Settings({ onClose }: DialogProps) {
  const { openDialog } = useDialog()

  const settingsStore = useSettingsStore()[0]
  const tx = useTranslationFunction()

  useEffect(() => {
    if (window.__settingsOpened) {
      throw new Error(
        'Settings window was already open - this should not happen, please file a bug'
      )
    }
    window.__settingsOpened = true
    return () => {
      window.__settingsOpened = false
    }
  }, [])

  const openSettingsSectionDialog = useCallback(
    (settingsMode: SettingsView) => {
      openDialog(SettingsSectionDialog, {
        settingsMode,
        closeParentDialog: onClose,
      })
    },
    [onClose, openDialog]
  )

  return (
    <Dialog onClose={onClose} fixed width={400} dataTestid='settings-dialog'>
      <DialogHeader
        title={tx('menu_settings')}
        onClose={onClose}
        dataTestid='settings'
      />
      <DialogBody>
        {settingsStore != null && (
          <Profile
            settingsStore={settingsStore}
            onStatusClick={() => {
              if (settingsStore == null) {
                return
              }
              openDialog(EditProfileDialog, {
                settingsStore,
              })
            }}
          />
        )}
        <SettingsSeparator />
        <SettingsIconButton
          icon='forum'
          onClick={() => openSettingsSectionDialog('chats_and_media')}
        >
          {tx('pref_chats')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='bell'
          onClick={() => openSettingsSectionDialog('notifications')}
        >
          {tx('pref_notifications')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='brightness-6'
          onClick={() => openSettingsSectionDialog('appearance')}
        >
          {tx('pref_appearance')}
        </SettingsIconButton>
        <SettingsIconButton
          icon='devices'
          onClick={() => {
            openDialog(SendBackupDialog)
            onClose()
          }}
        >
          {tx('multidevice_title')}
        </SettingsIconButton>
        <ConnectivityButton />
        <SettingsIconButton
          icon='code-tags'
          onClick={() => openSettingsSectionDialog('advanced')}
          dataTestid='open-advanced-settings'
        >
          {tx('menu_advanced')}
        </SettingsIconButton>
        <SettingsSeparator />
        {!runtime.getRuntimeInfo().isMac && (
          <SettingsIconButton
            icon='favorite'
            onClick={() => runtime.openLink(donationUrl)}
            isLink
          >
            {tx('donate')}
          </SettingsIconButton>
        )}
        <SettingsIconButton
          icon='question_mark'
          onClick={() => runtime.openHelpWindow()}
        >
          {tx('menu_help')}
        </SettingsIconButton>
        <SettingsIconButton icon='info' onClick={() => openDialog(About)}>
          {tx('global_menu_help_about_desktop')}
        </SettingsIconButton>
        <SettingsEndSeparator />
      </DialogBody>
    </Dialog>
  )
}

function SettingsSectionDialog(
  props: {
    settingsMode: SettingsView
    closeParentDialog: () => void
  } & DialogProps
) {
  const { settingsMode, onClose: closeThisDialog } = props
  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  const closeThisAndParent = useCallback(() => {
    closeThisDialog()
    props.closeParentDialog()
  }, [closeThisDialog, props])
  const commonHeaderProps = {
    onClickBack: closeThisDialog,
    onClose: closeThisAndParent,
  } as const satisfies Partial<Parameters<typeof DialogHeader>[0]>

  return (
    <Dialog onClose={closeThisDialog} fixed width={400}>
      {settingsMode === 'chats_and_media' && (
        <>
          <DialogHeader title={tx('pref_chats')} {...commonHeaderProps} />
          <DialogBody>
            {settingsStore != null && (
              <ChatsAndMedia settingsStore={settingsStore} />
            )}
            <SettingsEndSeparator />
          </DialogBody>
        </>
      )}
      {settingsMode === 'notifications' && (
        <>
          <DialogHeader
            title={tx('pref_notifications')}
            {...commonHeaderProps}
          />
          <DialogBody>
            {settingsStore != null && (
              <Notifications desktopSettings={settingsStore.desktopSettings} />
            )}
            <SettingsEndSeparator />
          </DialogBody>
        </>
      )}
      {settingsMode === 'appearance' && (
        <>
          <DialogHeader title={tx('pref_appearance')} {...commonHeaderProps} />
          <DialogBody>
            {settingsStore != null && (
              <Appearance
                rc={settingsStore.rc}
                desktopSettings={settingsStore.desktopSettings}
                settingsStore={settingsStore}
              />
            )}
            <SettingsEndSeparator />
          </DialogBody>
        </>
      )}
      {settingsMode === 'advanced' && (
        <>
          <DialogHeader
            title={tx('menu_advanced')}
            {...commonHeaderProps}
            dataTestid='settings-advanced'
          />
          <DialogBody>
            <Advanced onClose={closeThisAndParent} />
            <SettingsEndSeparator />
          </DialogBody>
        </>
      )}
    </Dialog>
  )
}
