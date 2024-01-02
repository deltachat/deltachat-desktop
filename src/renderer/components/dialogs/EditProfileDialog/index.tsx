import React, { useState } from 'react'

import ProfileImageSelector from './ProfileImageSelector'
import { BackendRemote } from '../../../backend-com'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../../ScreenController'
import SettingsStoreInstance from '../../../stores/settings'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../../Dialog'
import { DeltaInput, DeltaTextarea } from '../../Login-Styles'

import type { DialogProps } from '../../../contexts/DialogContext'
import type { SettingsStoreState } from '../../../stores/settings'

export default function EditProfileDialog({
  onClose,
  settingsStore,
  title,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  settingsStore: SettingsStoreState
  title?: string
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
} & DialogProps) {
  const tx = useTranslationFunction()

  title = title || tx('pref_edit_profile')

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader title={title} />
      {EditProfileDialogInner({
        settingsStore,
        onClose,
        cancelLabel,
        confirmLabel,
        firstSetup,
      })}
    </Dialog>
  )
}

function EditProfileDialogInner({
  onClose,
  settingsStore,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  onClose: DialogProps['onClose']
  settingsStore: SettingsStoreState
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
}) {
  const tx = useTranslationFunction()

  const [displayname, setDisplayname] = useState(
    settingsStore.settings.displayname
  )

  const [selfstatus, setSelfstatus] = useState(
    settingsStore.settings.selfstatus
  )

  const [profilePicture, setProfilePicture] = useState(
    settingsStore.selfContact.profileImage
  )

  const onCancel = () => {
    onClose()
  }

  const onOk = async () => {
    await BackendRemote.rpc.setConfig(
      selectedAccountId(),
      'selfavatar',
      profilePicture ? profilePicture : null
    )
    SettingsStoreInstance.effect.setCoreSetting(
      'displayname',
      displayname || ''
    )
    SettingsStoreInstance.effect.setCoreSetting('selfstatus', selfstatus || '')
    onClose()
  }

  return (
    <>
      <DialogBody>
        <DialogContent>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            <ProfileImageSelector
              displayName={settingsStore.settings.displayname}
              addr={settingsStore.selfContact.address}
              color={settingsStore.selfContact.color}
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
            />
          </div>
          <DeltaInput
            key='displayname'
            id='displayname'
            placeholder={tx('pref_your_name')}
            value={displayname}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setDisplayname(event.target.value)
            }}
          />
          {firstSetup ? (
            <p className='bp4-callout'>
              {tx('qraccount_success_enter_name', [
                settingsStore.selfContact.address,
              ])}
            </p>
          ) : null}
          {firstSetup ? null : (
            <DeltaTextarea
              key='status'
              id='status'
              placeholder={tx('pref_default_status_label')}
              value={selfstatus}
              onChange={(
                event: React.FormEvent<HTMLElement> &
                  React.ChangeEvent<HTMLTextAreaElement>
              ) => {
                setSelfstatus(event.target.value)
              }}
            />
          )}
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onOk={onOk}
      />
    </>
  )
}
