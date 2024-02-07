import React, { useState } from 'react'

import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../../stores/settings'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { DeltaInput, DeltaTextarea } from '../../Login-Styles'
import ProfileImageSelector from './ProfileImageSelector'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import Callout from '../../Callout'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useAlertDialog from '../../../hooks/useAlertDialog'

import type { DialogProps } from '../../../contexts/DialogContext'

type Props = {
  settingsStore: SettingsStoreState
  title?: string
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
} & DialogProps

export default function EditProfileDialog({ onClose, title, ...props }: Props) {
  const tx = useTranslationFunction()

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader title={title || tx('pref_edit_profile')} />
      {EditProfileDialogInner({ onClose, ...props })}
    </Dialog>
  )
}

function EditProfileDialogInner({
  onClose,
  settingsStore,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: Props) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()

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

  const onConfirm = async () => {
    // Display name needs to be set when setting up an user account for the
    // first time after scanning an QRCode with DCACCOUNT scheme (for example
    // via chatmail server invite code)
    if (firstSetup && displayname.length === 0) {
      await openAlertDialog({ message: tx('please_enter_name') })
      return
    }

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
          {firstSetup && <Callout>{tx('set_name_and_avatar_explain')}</Callout>}
          {!firstSetup && (
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
      <DialogFooter>
        <FooterActions>
          {!firstSetup && (
            <FooterActionButton onClick={onCancel}>
              {cancelLabel}
            </FooterActionButton>
          )}
          <FooterActionButton onClick={onConfirm}>
            {confirmLabel}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
