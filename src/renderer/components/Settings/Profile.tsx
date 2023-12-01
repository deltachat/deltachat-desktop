import React, { useContext } from 'react'

import { useTranslationFunction, ScreenContext } from '../../contexts'
import { avatarInitial, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { runtime } from '../../runtime'
import { SettingsStoreState } from '../../stores/settings'
import SettingsButton from './SettingsButton'
import EditProfileDialog from '../dialogs/EditProfileDialog'
import EditAccountAndPasswordDialog from '../dialogs/EditAccountAndPasswordDialog'

export default function Profile({
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
          openDialog(EditProfileDialog, {
            settingsStore,
          })
        }
      >
        {tx('pref_edit_profile')}
      </SettingsButton>
      <SettingsButton
        onClick={() =>
          openDialog(EditAccountAndPasswordDialog, {
            settingsStore,
          })
        }
      >
        {tx('pref_password_and_account_settings')}
      </SettingsButton>
    </>
  )
}
