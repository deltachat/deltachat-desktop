import React from 'react'

import { avatarInitial } from '../Avatar'
import { runtime } from '../../runtime'
import { SettingsStoreState } from '../../stores/settings'
import LargeProfileImage from '../LargeProfileImage'

import styles from './styles.module.scss'

export default function Profile({
  settingsStore,
}: {
  settingsStore: SettingsStoreState
}) {
  const initials = avatarInitial(
    settingsStore.selfContact.displayName || '',
    settingsStore.selfContact.address
  )

  const profileImageUrl = runtime.transformBlobURL(
    settingsStore.selfContact.profileImage || ''
  )

  return (
    <div className={styles.profile}>
      <LargeProfileImage
        initials={initials}
        color={settingsStore.selfContact.color}
        imageUrl={profileImageUrl}
      />
      <div className={styles.profileDetails}>
        <div className={styles.profileDisplayName}>
          {settingsStore.settings.displayname}
        </div>
        <div className={styles.profileAddress}>
          {settingsStore.selfContact.address}
        </div>
      </div>
    </div>
  )
}
