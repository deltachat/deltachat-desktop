import React, { useContext, useState } from 'react'

import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import useChat from '../../../hooks/chat/useChat'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { DeltaInput } from '../../Login-Styles'
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import ClickableLink from '../../helpers/ClickableLink'
import { ScreenContext } from '../../../contexts/ScreenContext'
import { Screens } from '../../../ScreenController'

type Props = {
  selectedAccountId: number
  onCancel: () => void
}

export default function InstantAccountScreen({
  selectedAccountId,
  onCancel,
}: Props) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const { changeScreen } = useContext(ScreenContext)
  const { createInstantAccount, resetInstantOnboarding } =
    useInstantOnboarding()
  const { selectChat } = useChat()

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
      // Automatically create a "chatmail" account
      const chatId = await createInstantAccount(
        selectedAccountId,
        displayName,
        profilePicture
      )

      // We redirect the user to the main screen after the account got
      // successfully created
      resetInstantOnboarding()
      changeScreen(Screens.Main)

      // If the user scanned a QR code to join a contact or group, then
      // we redirect to the created chat after instant onboarding
      if (chatId !== null) {
        selectChat(chatId)
      }
    } catch (error: any) {
      await openAlertDialog({
        message: error.message || error.toString(),
      })
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
        <ChatmailInstanceInfo />
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

function ChatmailInstanceInfo() {
  const { welcomeQr } = useInstantOnboarding()

  if (!welcomeQr || welcomeQr.qr.kind !== 'account') {
    return null
  }

  return (
    <>
      <p>Your account will be created on the following instance:</p>
      <p>
        <i>{welcomeQr.qr.domain}</i>
      </p>
      <p>
        <ClickableLink href='https://delta.chat'>
          Show other instances
        </ClickableLink>
      </p>
    </>
  )
}
