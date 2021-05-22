import { Card, Elevation } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'

import { DeltaBackend } from '../../delta-remote'
import { avatarInitial } from '../Avatar'
import { DeltaInput } from '../Login-Styles'
import { DeltaDialogBody, DeltaDialogOkCancelFooter } from './DeltaDialog'
import { SettingsButton } from './Settings'
import { runtime } from '../../runtime'

export default function SettingsProfile({
  setShow,
  account,
  state,
}: {
  show: string
  setShow: (show: string) => void
  onClose: any
  account: DeltaChatAccount
  state: any
}) {
  const [profileImagePreview, setProfileImagePreview] = useState('')

  const initial = avatarInitial(account.displayname, account.addr)
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  }, [profileImagePreview])
  const tx = useTranslationFunction()
  return (
    <>
      <Card elevation={Elevation.ONE} style={{ paddingTop: '0px' }}>
        <div
          className='profile-image-username'
          style={{ marginBottom: '10px' }}
        >
          <div className='profile-image-selector'>
            {profileImagePreview ? (
              <img
                src={runtime.transformBlobURL(profileImagePreview)}
                alt={tx('pref_profile_photo')}
              />
            ) : (
              <span style={{ backgroundColor: state.selfContact.color }}>
                {initial}
              </span>
            )}
          </div>
          <div className='profile-displayname-addr'>
            <div className='displayname'>{state.settings.displayname}</div>
            <div className='addr'>{account.addr}</div>
          </div>
        </div>
        <SettingsButton onClick={() => setShow('edit-profile')}>
          {tx('pref_edit_profile')}
        </SettingsButton>
        <SettingsButton onClick={() => setShow('login')}>
          {tx('pref_password_and_account_settings')}
        </SettingsButton>
      </Card>
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
  profilePicture: string
  setProfilePicture: (path: string) => void
}) {
  const tx = window.static_translate

  const onClickSelectPicture = async () => {
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [{ name: tx('images'), extensions: ['jpg', 'png', 'gif'] }],
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

export function SettingsEditProfile({
  setShow,
  state,
  handleDeltaSettingsChange,
}: {
  show: string
  setShow: (show: string) => void
  onClose: any
  state: any
  handleDeltaSettingsChange: (key: string, value: string) => void
}) {
  const tx = useTranslationFunction()
  const [displayname, setDisplayname] = useState(state.settings.displayname)
  const [selfstatus, setSelfstatus] = useState(state.settings.selfstatus)

  const [profilePicture, setProfilePicture] = useState('')
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfilePicture)
  }, [])

  const onCancel = () => setShow('main')
  const onOk = async () => {
    await DeltaBackend.call('setProfilePicture', profilePicture)
    handleDeltaSettingsChange('displayname', displayname)
    handleDeltaSettingsChange('selfstatus', selfstatus)
    setShow('main')
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
              displayName={state.settings['displayname']}
              addr={state.selfContact.address}
              color={state.selfContact.color}
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
          <DeltaInput
            key='status'
            id='status'
            placeholder={tx('pref_default_status_label')}
            value={selfstatus}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setSelfstatus(event.target.value)
            }}
          />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onCancel} onOk={onOk} />
    </>
  )
}
