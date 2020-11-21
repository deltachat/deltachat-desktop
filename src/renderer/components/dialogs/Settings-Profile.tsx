import { Card, Elevation } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'

import { DeltaBackend } from '../../delta-remote'
import { DeltaInput } from '../Login-Styles'
import { DeltaDialogBody, DeltaDialogOkCancelFooter } from './DeltaDialog'
import { SettingsButton } from './Settings'

const { remote } = window.electron_functions

export default function SettingsProfile({
  setShow,
  account,
  state
}: {
  show: string
  setShow: (show: string) => void
  onClose: any,
  account: DeltaChatAccount,
  state: any
}) {
  const [profileImagePreview, setProfileImagePreview] = useState('')

  const codepoint = account.displayname && account.displayname.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  }, [profileImagePreview])
  const tx = useTranslationFunction()
  return (
    <>
      <Card elevation={Elevation.ONE} style={{paddingTop: '0px'}}>
        <div className='profile-image-username' style={{marginBottom: '10px'}}>
          <div className='profile-image-selector'>
            {/* TODO: show anything else when there is no profile image, like the letter avatar */}
            {profileImagePreview ? (
              <img src={profileImagePreview} alt={tx('pref_profile_photo')} />
            ) : (
              <span style={{ backgroundColor: state.selfContact.color }}>{initial}</span>
            )}
          </div>
          <div className='profile-displayname-addr'>
            <div className='displayname'>{account.displayname}</div>
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

export function ProfileImageSelector(props: any) {
  const { displayName, color } = props
  const tx = window.static_translate
  const [profileImagePreview, setProfileImagePreview] = useState('')
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  }, [profileImagePreview])

  const changeProfilePicture = async (picture: string) => {
    await DeltaBackend.call('setProfilePicture', picture)
    setProfileImagePreview(await DeltaBackend.call('getProfilePicture'))
  }

  const openSelectionDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: tx('select_your_new_profile_image'),
        filters: [{ name: tx('images'), extensions: ['jpg', 'png', 'gif'] }],
        properties: ['openFile'],
      },
      async (files: string[]) => {
        if (Array.isArray(files) && files.length > 0) {
          changeProfilePicture(files[0])
        }
      }
    )
  }

  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profileImagePreview ? (
        <img src={profileImagePreview} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <>
        <button
          aria-label={tx('pref_set_profile_photo')}
          onClick={openSelectionDialog}
          className={'bp3-button'}
        >
          {tx('pref_set_profile_photo')}
        </button>
        <button
          aria-label={tx('pref_remove_profile_photo')}
          onClick={changeProfilePicture.bind(null, '')}
          className={'bp3-button'}
          disabled={!profileImagePreview}
        >
          {tx('pref_remove_profile_photo')}
        </button>
      </>
    </div>
  )
}

export function SettingsEditProfile({
  setShow,
  account,
  state
}: {
  show: string
  setShow: (show: string) => void
  onClose: any,
  account: DeltaChatAccount,
  state: any
}) {
  const tx = useTranslationFunction()
  const [displayname, setDisplayname] = useState(account.displayname)
  console.log(state)
  const [selfstatus, setSelfstatus] = useState(state.settings.selfstatus)
  console.log('asd', displayname, selfstatus)
  const onUpdate = () => {}
  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          <div className='profile-image-username center' style={{marginBottom: '30px'}}>
            <ProfileImageSelector
              displayName={
                state.settings['displayname'] || state.selfContact.address
              }
              color={state.selfContact.color}
            />
          </div>
          <DeltaInput
            key='displayname'
            id='displayname'
            placeholder={tx('pref_your_name')}
            value={displayname}
            onChange={(event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>) => { setDisplayname(event.target.value)}}
          />
          <DeltaInput
            key='status'
            id='status'
            placeholder={tx('pref_default_status_label')}
            value={selfstatus}
            onChange={(event: React.FormEvent<HTMLElement> & React.ChangeEvent<HTMLInputElement>) => { setSelfstatus(event.target.value)}}
          />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter
        onCancel={() => setShow('main')}
        onOk={onUpdate}
      />
    </>
  )
}
