import React from 'react'

import { avatarInitial } from '../Avatar'
import { runtime } from '../../runtime'
import LargeProfileImage from '../LargeProfileImage'

import type { SettingsStoreState } from '../../stores/settings'

import styles from './styles.module.scss'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Profile({ settingsStore }: Props) {
  const initials = avatarInitial(
    settingsStore.settings.displayname || '',
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
