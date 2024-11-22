import React, { useContext, useEffect, useState } from 'react'

import AdditionalActionInfo from './AdditionalActionInfo'
import Button from '../../Button'
import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import UserAgreement from './UserAgreement'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import useChat from '../../../hooks/chat/useChat'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { DeltaInput } from '../../Login-Styles'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import { ScreenContext } from '../../../contexts/ScreenContext'
import { Screens } from '../../../ScreenController'

import styles from './styles.module.scss'
import useDialog from '../../../hooks/dialog/useDialog'
import UseOtherServerDialog from './UseOtherServerDialog'
import { BackendRemote } from '../../../backend-com'

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
  const { welcomeQr } = useInstantOnboarding()
  const { openDialog } = useDialog()

  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [showMissingNameError, setShowMissingNameError] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { displayname, selfavatar } =
        await BackendRemote.rpc.batchGetConfig(selectedAccountId, [
          'displayname',
          'selfavatar',
        ])
      displayname && setDisplayName(displayname)
      selfavatar && setProfilePicture(selfavatar)
    })()
  }, [selectedAccountId])

  const onChangeProfileImage = async (path: string | null) => {
    try {
      if (!path) {
        await BackendRemote.rpc.setConfig(selectedAccountId, 'selfavatar', null)
        setProfilePicture(null)
        return
      }
      await BackendRemote.rpc.setConfig(selectedAccountId, 'selfavatar', path)
      const pathInBlobsDir = await BackendRemote.rpc.getConfig(
        selectedAccountId,
        'selfavatar'
      )
      if (!pathInBlobsDir) {
        throw new Error('Could not load image after core copied it')
      }
      setProfilePicture(pathInBlobsDir)
    } catch (error: any) {
      openAlertDialog({
        message:
          'Failed to set image, please inform developers about this issue:\n' +
            error?.message || error,
      })
    }
  }

  const onChangeDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
    if (showMissingNameError) {
      setShowMissingNameError(false)
    }
  }

  // do not do that inside of `onChangeDisplayName`,
  // because that function is called on every keypress
  const saveDisplayName = () =>
    BackendRemote.rpc.setConfig(selectedAccountId, 'displayname', displayName)

  const onConfirm = async () => {
    if (!displayName) {
      setShowMissingNameError(true)
      return
    }

    try {
      await saveDisplayName()
      // Automatically create a "chatmail" account
      const chatId = await createInstantAccount(selectedAccountId)

      // We redirect the user to the main screen after the account got
      // successfully created
      resetInstantOnboarding()
      changeScreen(Screens.Main)

      // If the user scanned a QR code to join a contact or group, then
      // we redirect to the created chat after instant onboarding
      if (chatId !== null) {
        selectChat(selectedAccountId, chatId)
      }
    } catch (error: any) {
      await openAlertDialog({
        message: error.message || error.toString(),
      })
    }
  }

  const showOtherOptions = () => {
    saveDisplayName()
    openDialog(UseOtherServerDialog)
  }

  const onClose = (result: string) => {
    if (result === 'cancel') {
      saveDisplayName()
      onCancel()
    }
  }

  return (
    <Dialog
      fixed
      onClose={onClose}
      width={400}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <DialogHeader title={tx('instant_onboarding_title')} />
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
            onBlur={saveDisplayName}
          />
          {showMissingNameError && (
            <p className={styles.inputError}>{tx('please_enter_name')}</p>
          )}
          <AdditionalActionInfo accountId={selectedAccountId} />
          <p>{tx('set_name_and_avatar_explain')}</p>
          <div className={styles.welcomeScreenButtonGroup}>
            <div className={styles.instantOnboardingAgreement}>
              {welcomeQr?.qr.kind !== 'login' && <UserAgreement />}
              {welcomeQr?.qr.kind === 'login' && (
                <>{tx('qrlogin_ask_login', welcomeQr.qr.address)}</>
              )}
            </div>
            <Button
              className={styles.welcomeScreenButton}
              styling='primary'
              onClick={onConfirm}
            >
              {welcomeQr?.qr.kind === 'login'
                ? tx('login')
                : tx('instant_onboarding_create')}
            </Button>
            <Button
              className={styles.welcomeScreenButton}
              styling='secondary'
              onClick={showOtherOptions}
            >
              {tx('instant_onboarding_show_more_instances')}
            </Button>
          </div>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
