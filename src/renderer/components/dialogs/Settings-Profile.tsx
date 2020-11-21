import { Card, Elevation, H5 } from '@blueprintjs/core'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { useTranslationFunction } from '../../contexts'

import { DeltaBackend } from '../../delta-remote'
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
  const tx = useTranslationFunction()
  return (
    <>
      <Card elevation={Elevation.ONE} style={{paddingTop: '0px'}}>
        <div className='profile-image-username'>
          <ProfileImageSelector
            displayName={
              state.settings['displayname'] || state.selfContact.address
            }
            color={state.selfContact.color}
          />
          <div className='profile-displayname-addr'>
            <div className='displayname'>{account.displayname}</div>
            <div className='addr'>{account.addr}</div>
          </div>
        </div>
      </Card>
      <Card elevation={Elevation.ONE}>
        <H5>{tx('pref_profile_info_headline')}</H5>
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
  const [showPartCircle, setShowPartCircle] = useState(false)
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
    <div className='profile-image-selector' onMouseOver={() => { setShowPartCircle(true)}} onMouseOut={() => { setShowPartCircle(false)}}>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profileImagePreview ? (
        <img src={profileImagePreview} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <>
        {/* TODO: replace the text by icons that get described by aria-label */}
        <div className={classNames('part-circle', { 'visible': showPartCircle})} aria-label={tx('profile_image_delete')} onClick={openSelectionDialog}>
          <div className='circle'>
            <div className='camera-icon' />
          </div>
        </div>
        {profileImagePreview && (
          <button
            aria-label={tx('profile_image_delete')}
            onClick={changeProfilePicture.bind(null, '')}
            className={'bp3-button'}
          >
            {tx('remove_desktop')}
          </button>
        )}
      </>
    </div>
  )
}

export function SettingsEditProfile({
  setShow,
  state
}: {
  show: string
  setShow: (show: string) => void
  onClose: any,
  account: DeltaChatAccount,
  state: any
}) {
  const onUpdate = () => {}
  return (
    <>
      <DeltaDialogBody noFooter>
        <Card elevation={Elevation.ONE}>
          <div className='profile-image-username center'>
            <ProfileImageSelector
              displayName={
                state.settings['displayname'] || state.selfContact.address
              }
              color={state.selfContact.color}
            />
          </div>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter
        onCancel={() => setShow('main')}
        onOk={onUpdate}
      />
    </>
  )
}
