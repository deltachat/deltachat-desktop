import React, { useState } from 'react'

import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import useAlertDialog from '../../../hooks/useAlertDialog'
import useDialog from '../../../hooks/useDialog'
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
import { ConfigureProgressDialog } from '../../LoginForm'
import { Screens } from '../../../ScreenController'

type Props = {
  selectedAccountId: number
  onCancel: () => void
}

const DEFAULT_CHATMAIL_INSTANCE_URL =
  'https://nine.testrun.org/cgi-bin/newemail.py'

export default function CreateAccountScreen({
  selectedAccountId,
  onCancel,
}: Props) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const { openDialog } = useDialog()

  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | undefined>()

  const onChangeProfileImage = (path: string) => {
    setProfilePicture(path)
  }

  const onChangeDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
  }

  const onConfirm = async () => {
    try {
      await BackendRemote.rpc.setConfigFromQr(
        selectedAccountId,
        `dcaccount:${DEFAULT_CHATMAIL_INSTANCE_URL}`
      )

      await BackendRemote.rpc.batchSetConfig(selectedAccountId, {
        displayname: displayName,
        selfavatar: profilePicture ? profilePicture : null,
      })

      openDialog(ConfigureProgressDialog, {
        onSuccess: () => {
          // Make sure to not ask user later for username in next screen, as
          // we're setting it here already
          window.__askForName = false
          window.__changeScreen(Screens.Main)
        },
      })
    } catch (err: any) {
      openAlertDialog({
        message: err.message || err.toString(),
      })
      return
    }
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
