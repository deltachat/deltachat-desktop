import React, { useState } from 'react'

import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { DeltaInput } from '../../Login-Styles'
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import { BackendRemote } from '../../../backend-com'
import SettingsStoreInstance from '../../../stores/settings'

type Props = {
  selectedAccountId: number
  onCancel: () => void
}

export default function CreateAccountScreen({
  selectedAccountId,
  onCancel,
}: Props) {
  const tx = useTranslationFunction()

  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | undefined>()

  const onChangeProfileImage = (path: string) => {
    setProfilePicture(path)
  }

  const onChangeDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
  }

  const onConfirm = async () => {
    await BackendRemote.rpc.setConfig(
      selectedAccountId,
      'selfavatar',
      profilePicture ? profilePicture : null
    )
    SettingsStoreInstance.effect.setCoreSetting('displayname', displayName)
  }

  return (
    <>
      <DialogHeader title='Create new account' onClickBack={onCancel} />
      <DialogBody>
        <ProfileImageSelector
          displayName={displayName}
          profilePicture={profilePicture}
          setProfilePicture={onChangeProfileImage}
        />
        <DeltaInput
          key='displayName'
          id='displayName'
          placeholder={tx('pref_your_name')}
          value={displayName}
          onChange={onChangeDisplayName}
        />
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton onClick={onConfirm}>
            {tx('ok')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}
