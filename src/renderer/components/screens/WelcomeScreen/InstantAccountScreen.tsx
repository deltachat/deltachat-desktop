import React, { useState } from 'react'

import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import SettingsStoreInstance from '../../../stores/settings'
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

export default function InstantAccountScreen({
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
      // 1. In this "Instant Onboarding" account creation flow the user is not
      // asked to manually insert any mail server credentials.
      //
      // Internally, the function will call the chatmail instance URL via HTTP
      // from which it'll receive the address and password as an JSON object.
      //
      // After parsing it'll automatically configure the account with the
      // appropriate keys for login, e.g. `addr` and `mail_pw`
      await BackendRemote.rpc.setConfigFromQr(
        selectedAccountId,
        `dcaccount:${DEFAULT_CHATMAIL_INSTANCE_URL}`
      )

      // 2. Kick-off the actual account creation process by calling `configure`.
      // This happens inside of this dialog
      openDialog(ConfigureProgressDialog, {
        onSuccess: async () => {
          // 3. Additionally we set the `selfavatar` / profile picture and `displayname`
          // configuration for this account
          //
          // Note: We need to set these profile settings _after_ calling `configure` to
          // make the UI aware of them already.
          //
          // @TODO: Not sure why it doesn't work otherwise, the configuration seems to
          // be set correctly in both cases?
          if (profilePicture) {
            await BackendRemote.rpc.setConfig(
              selectedAccountId,
              'selfavatar',
              profilePicture
            )
          }
          await SettingsStoreInstance.effect.setCoreSetting(
            'displayname',
            displayName
          )

          // 4. Make sure to not ask user later for username in next screen, as
          // we've set it already
          window.__askForName = false

          // 5. We redirect the user to the main screen after the account got
          // successfully created
          window.__changeScreen(Screens.Main)
        },
      })
    } catch (error: any) {
      await openAlertDialog({
        message: error.message || error.toString(),
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
