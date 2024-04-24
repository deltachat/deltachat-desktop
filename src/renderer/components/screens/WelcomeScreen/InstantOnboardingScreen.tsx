import React, { useContext, useState } from 'react'

import AdditionalActionInfo from './AdditionalActionInfo'
import Button from '../../Button'
import InstantOnboardingFooter from './InstantOnboardingFooter'
import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import UserAgreement from './UserAgreement'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import useChat from '../../../hooks/chat/useChat'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { DeltaInput } from '../../Login-Styles'
import { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import { ScreenContext } from '../../../contexts/ScreenContext'
import { Screens } from '../../../ScreenController'

import styles from './styles.module.scss'
import QrScanButton from './QrScanButton'

type Props = {
  onCancel: () => void
  selectedAccountId: number
}

export default function InstantOnboardingScreen({
  onCancel,
  selectedAccountId,
}: Props) {
  const tx = useTranslationFunction()
  const openAlertDialog = useAlertDialog()
  const { changeScreen } = useContext(ScreenContext)
  const { createInstantAccount, resetInstantOnboarding } =
    useInstantOnboarding()
  const { selectChat } = useChat()

  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | undefined>()
  const [hasUserAgreement, setHasUserAgreement] = useState(false)

  const onChangeProfileImage = (path: string) => {
    setProfilePicture(path)
  }

  const onChangeDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
  }

  const onUserAgreementChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHasUserAgreement(event.target.checked)
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
      <DialogHeader
        onClickBack={onCancel}
        title={tx('instant_onboarding_title')}
      >
        <QrScanButton />
      </DialogHeader>
      <DialogBody className={styles.welcomeScreenBody}>
        <DialogContent paddingBottom>
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
          <AdditionalActionInfo accountId={selectedAccountId} />
          <p>{tx('set_name_and_avatar_explain')}</p>
          <div className={styles.welcomeScreenButtonGroup}>
            <div className={styles.instantOnboardingAgreement}>
              <UserAgreement
                onChange={onUserAgreementChange}
                checked={hasUserAgreement}
              />
            </div>
            <Button
              className={styles.welcomeScreenButton}
              disabled={displayName.length === 0 || !hasUserAgreement}
              type='primary'
              onClick={onConfirm}
            >
              {tx('instant_onboarding_create')}
            </Button>
          </div>
        </DialogContent>
        <InstantOnboardingFooter />
      </DialogBody>
    </>
  )
}
