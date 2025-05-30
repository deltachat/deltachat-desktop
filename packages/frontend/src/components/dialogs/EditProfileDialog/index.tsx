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
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

type Props = {
  settingsStore: SettingsStoreState
  firstSetup?: boolean
} & DialogProps

export default function EditProfileDialog({ onClose, ...props }: Props) {
  const tx = useTranslationFunction()

  return (
    <Dialog canOutsideClickClose={false} onClose={onClose}>
      <DialogHeader title={tx('pref_profile_info_headline')} />
      {EditProfileDialogInner({ onClose, ...props })}
    </Dialog>
  )
}

function EditProfileDialogInner({
  onClose,
  settingsStore,
  firstSetup = false,
}: Props) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()

  const [displayname, setDisplayname] = useState(
    settingsStore.settings.displayname || ''
  )

  const [selfstatus, setSelfstatus] = useState(
    settingsStore.settings.selfstatus || ''
  )

  const [profilePicture, setProfilePicture] = useState(
    settingsStore.selfContact.profileImage
  )

  const onCancel = () => {
    onClose()
  }

  const onConfirm = async () => {
    // Display name should not be empty and needs to be set when setting up an
    // user account for the first time after scanning an QRCode with DCACCOUNT scheme
    // (for example via chatmail server invite code)
    if (displayname.length === 0) {
      await openAlertDialog({ message: tx('please_enter_name') })
      return
    }

    await BackendRemote.rpc.setConfig(
      selectedAccountId(),
      'selfavatar',
      profilePicture ? profilePicture : null
    )
    SettingsStoreInstance.effect.setCoreSetting('displayname', displayname)
    SettingsStoreInstance.effect.setCoreSetting('selfstatus', selfstatus)
    onClose()
  }

  return (
    <>
      <DialogBody>
        <DialogContent>
          <div className={styles.editProfileDialog}>
            <ProfileImageSelector
              displayName={displayname}
              addr={settingsStore.selfContact.address}
              color={settingsStore.selfContact.color}
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
            />
          </div>
          <DeltaInput
            key='displayname'
            id='displayname'
            dataTestId='displayname-input'
            placeholder={tx('pref_your_name')}
            value={displayname}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setDisplayname(event.target.value)
            }}
            autoFocus={true}
          />
        </DialogContent>
        {firstSetup && <Callout>{tx('set_name_and_avatar_explain')}</Callout>}
        <DialogContent>
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
          <div className={styles.editProfileHint}>
            {tx('pref_who_can_see_profile_explain')}
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          {!firstSetup && (
            <FooterActionButton onClick={onCancel} data-testid='cancel'>
              {tx('cancel')}
            </FooterActionButton>
          )}
          <FooterActionButton
            styling='primary'
            onClick={onConfirm}
            data-testid='ok'
          >
            {tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
