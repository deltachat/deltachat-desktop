import { Card, Elevation } from '@blueprintjs/core'
import React, { useState, useContext } from 'react'
import { useTranslationFunction, ScreenContext } from '../../contexts'

import { avatarInitial, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { DeltaInput, DeltaTextarea } from '../Login-Styles'
import {
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
  DeltaDialogBase,
  DeltaDialogHeader,
} from './DeltaDialog'
import { SettingsButton } from './Settings'
import { runtime } from '../../runtime'
import { DialogProps } from './DialogController'
import SettingsAccountDialog from './Settings-Account'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

export default function SettingsProfile({
  settingsStore,
}: {
  settingsStore: SettingsStoreState
  onClose: any
}) {
  const { openDialog } = useContext(ScreenContext)

  const initial = avatarInitial(
    settingsStore.selfContact.displayName || '',
    settingsStore.selfContact.address
  )

  const tx = useTranslationFunction()
  const profileBlobUrl = runtime.transformBlobURL(
    settingsStore.selfContact.profileImage || ''
  )
  return (
    <>
      <div className='profile-image-username' style={{ marginBottom: '20px' }}>
        <div className='profile-image-selector'>
          {profileBlobUrl ? (
            <ClickForFullscreenAvatarWrapper filename={profileBlobUrl}>
              <img src={profileBlobUrl} alt={tx('pref_profile_photo')} />
            </ClickForFullscreenAvatarWrapper>
          ) : (
            <span style={{ backgroundColor: settingsStore.selfContact.color }}>
              {initial}
            </span>
          )}
        </div>
        <div className='profile-displayname-addr'>
          <div className='displayname'>
            {settingsStore.settings.displayname}
          </div>
          <div className='addr'>{settingsStore.selfContact.address}</div>
        </div>
      </div>
      <SettingsButton
        onClick={() =>
          openDialog(SettingsProfileDialog, {
            settingsStore,
          })
        }
      >
        {tx('pref_edit_profile')}
      </SettingsButton>
      <SettingsButton
        onClick={() =>
          openDialog(SettingsAccountDialog, {
            settingsStore,
          })
        }
      >
        {tx('pref_password_and_account_settings')}
      </SettingsButton>
    </>
  )
}

export function ProfileImageSelector({
  displayName,
  addr,
  color,
  profilePicture,
  setProfilePicture,
}: {
  displayName: string
  addr: string
  color: string
  profilePicture: string | null
  setProfilePicture: (path: string) => void
  hideDeleteButton?: boolean
}) {
  const tx = window.static_translate

  const onClickSelectPicture = async () => {
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: ['jpg', 'png', 'gif', 'jpeg', 'jpe'],
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('pictures'),
    })
    if (file) setProfilePicture(file)
  }

  const onClickRemovePicture = () => setProfilePicture('')

  const initial = avatarInitial(displayName, addr)

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profilePicture ? (
        <img src={'file://' + profilePicture} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <>
        <button
          aria-label={tx('profile_image_select')}
          onClick={onClickSelectPicture}
          className={'delta-button-round'}
        >
          {tx('profile_image_select')}
        </button>
        <button
          aria-label={tx('profile_image_delete')}
          onClick={onClickRemovePicture}
          className={'delta-button-round'}
          disabled={!profilePicture}
        >
          {tx('profile_image_delete')}
        </button>
      </>
    </div>
  )
}

export function SettingsEditProfileDialogInner({
  onClose,
  settingsStore,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  onClose: DialogProps['onClose']
  settingsStore: SettingsStoreState
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
}) {
  const tx = useTranslationFunction()
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
  const onOk = async () => {
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
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            <ProfileImageSelector
              displayName={settingsStore.settings['displayname']}
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
          {firstSetup ? (
            <p className='bp4-callout'>
              {tx('qraccount_success_enter_name', [
                settingsStore.selfContact.address,
              ])}
            </p>
          ) : null}
          {firstSetup ? null : (
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
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onOk={onOk}
      />
    </>
  )
}

export function SettingsProfileDialog({
  onClose,
  isOpen,
  settingsStore,
  title,
  cancelLabel,
  confirmLabel,
  firstSetup = false,
}: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  settingsStore: SettingsStoreState
  title?: string
  cancelLabel?: string
  confirmLabel?: string
  firstSetup?: boolean
}) {
  const tx = useTranslationFunction()
  title = title || tx('pref_edit_profile')
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        maxHeight: 'calc(100% - 100px)',
        width: '500px',
      }}
    >
      <DeltaDialogHeader title={title} />
      {SettingsEditProfileDialogInner({
        settingsStore,
        onClose,
        cancelLabel,
        confirmLabel,
        firstSetup,
      })}
    </DeltaDialogBase>
  )
}
