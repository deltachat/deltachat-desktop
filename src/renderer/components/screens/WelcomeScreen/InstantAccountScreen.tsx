import React, { useContext, useEffect, useState } from 'react'

import Button from '../../Button'
import Callout from '../../Callout'
import ClickableLink from '../../helpers/ClickableLink'
import Icon from '../../Icon'
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
import { runtime } from '../../../runtime'

import styles from './styles.module.scss'

type Props = {
  onCancel: () => void
  selectedAccountId: number
}

// URL of page listing chatmail instances
// @TODO: Insert correct URL
const INSTANCE_LIST_URL = 'https://delta.chat/'

export default function InstantAccountScreen({
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
      <DialogHeader
        onClickBack={onCancel}
        title={tx('instant_onboarding_title')}
      />
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
          <p>{tx('set_name_and_avatar_explain')}</p>
          <div className={styles.welcomeScreenButtonGroup}>
            <Button
              className={styles.welcomeScreenButton}
              disabled={displayName.length === 0}
              type='primary'
              onClick={onConfirm}
            >
              {tx('instant_onboarding_create')}
            </Button>
          </div>
        </DialogContent>
        <ChatmailInstanceInfo accountId={selectedAccountId} />
      </DialogBody>
    </>
  )
}

function ChatmailInstanceInfo(props: { accountId: number }) {
  const tx = useTranslationFunction()
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
      <Callout className={styles.instantOnboardingCallout}>
        <p>
          {tx('instant_onboarding_default_info')} <HelpButton />
        </p>
        <p>
          <ClickableLink href={INSTANCE_LIST_URL}>
            {tx('instant_onboarding_show_more_instances')}
          </ClickableLink>
        </p>
      </Callout>
    )
  }

  if (welcomeQr.qr.kind === 'account') {
    return (
      <Callout className={styles.instantOnboardingCallout}>
        <p>
          {tx('instant_onboarding_instance_info')} <HelpButton />
        </p>
        <p>
          <i>{welcomeQr.qr.domain}</i>
        </p>
        <p>
          <ClickableLink href={INSTANCE_LIST_URL}>
            {tx('instant_onboarding_show_more_instances')}
          </ClickableLink>
        </p>
      </Callout>
    )
  } else if (welcomeQr.qr.kind === 'askVerifyGroup') {
    return (
      <Callout className={styles.instantOnboardingCallout}>
        <p>
          {tx('instant_onboarding_group_info', welcomeQr.qr.grpname)}{' '}
          <HelpButton />
        </p>
      </Callout>
    )
  } else if (welcomeQr.qr.kind === 'askVerifyContact') {
    return (
      <Callout className={styles.instantOnboardingCallout}>
        <p>
          {tx('instant_onboarding_contact_info', contactAddress)} <HelpButton />
        </p>
      </Callout>
    )
  }

  return null
}

function HelpButton() {
  const handleClick = () => {
    // @TODO: Specify anchor for instant onboarding help chapter
    runtime.openHelpWindow()
  }

  return (
    <button onClick={handleClick} className={styles.instantOnboardingHelp}>
      <Icon className={styles.instantOnboardingHelpIcon} icon='info' />
    </button>
  )
}
