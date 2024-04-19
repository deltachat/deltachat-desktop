import React, { useContext, useEffect, useState } from 'react'

import Button from '../../Button'
import Callout from '../../Callout'
import ClickableLink from '../../helpers/ClickableLink'
import ProfileImageSelector from '../../dialogs/EditProfileDialog/ProfileImageSelector'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import useChat from '../../../hooks/chat/useChat'
import useInstantOnboarding from '../../../hooks/useInstantOnboarding'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { BackendRemote } from '../../../backend-com'
import { DeltaInput } from '../../Login-Styles'
import { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import { ScreenContext } from '../../../contexts/ScreenContext'
import { Screens } from '../../../ScreenController'

import styles from './styles.module.scss'

type Props = {
  selectedAccountId: number
  onCancel: () => void
}

// URL of page listing chatmail instances
// @TODO: Insert correct URL
const INSTANCE_LIST_URL = 'https://delta.chat/'

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
          <div className={styles.welcomeScreenButtonGroup}>
            <Button
              className={styles.welcomeScreenButton}
              type='primary'
              onClick={onConfirm}
            >
              Create account
            </Button>
          </div>
        </DialogContent>
        <ChatmailInstanceInfo accountId={selectedAccountId} />
      </DialogBody>
    </>
  )
}

function ChatmailInstanceInfo(props: { accountId: number }) {
  const { welcomeQr } = useInstantOnboarding()
  const [contactAddress, setContactAddress] = useState('')

  useEffect(() => {
    const loadContactName = async () => {
      if (!welcomeQr || welcomeQr.qr.kind !== 'askVerifyContact') {
        setContactAddress('')
        return
      }

      const contact = await BackendRemote.rpc.getContact(
        props.accountId,
        welcomeQr.qr.contact_id
      )
      setContactAddress(contact.address)
    }

    loadContactName()
  }, [props.accountId, welcomeQr])

  // When no QR code got scanned by the user we're creating an account on the
  // default chatmail instance
  if (!welcomeQr) {
    return (
      <Callout>
        <p>Your account will be created on the default instance</p>
        <p>
          <ClickableLink href={INSTANCE_LIST_URL}>
            Show other instances
          </ClickableLink>
        </p>
      </Callout>
    )
  }

  if (welcomeQr.qr.kind === 'account') {
    return (
      <Callout>
        <p>Your account will be created on the following instance:</p>
        <p>
          <i>{welcomeQr.qr.domain}</i>
        </p>
        <p>
          <ClickableLink href={INSTANCE_LIST_URL}>
            Show other instances
          </ClickableLink>
        </p>
      </Callout>
    )
  } else if (welcomeQr.qr.kind === 'askVerifyGroup') {
    return (
      <Callout>
        <p>
          Create a new account and join the group \"{welcomeQr.qr.grpname}\"
        </p>
      </Callout>
    )
  } else if (welcomeQr.qr.kind === 'askVerifyContact') {
    return (
      <Callout>
        <p>Create a new account and chat with {contactAddress}</p>
      </Callout>
    )
  }

  return null
}
