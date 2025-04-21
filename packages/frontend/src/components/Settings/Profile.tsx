import React from 'react'

import { avatarInitial } from '../Avatar'
import { runtime } from '@deltachat-desktop/runtime-interface'
import LargeProfileImage from '../LargeProfileImage'

import type { SettingsStoreState } from '../../stores/settings'

import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  settingsStore: SettingsStoreState
}

export default function Profile({ settingsStore }: Props) {
  const tx = useTranslationFunction()

  const initials = avatarInitial(
    settingsStore.settings?.displayname || '',
    settingsStore.selfContact.address
  )

  const profileImageUrl = runtime.transformBlobURL(
    settingsStore.selfContact.profileImage || ''
  )

  const profileName =
    settingsStore.settings.displayname !== ''
      ? settingsStore.settings.displayname
      : tx('pref_profile_info_headline')

  return (
    <div className={styles.profile}>
      <LargeProfileImage
        initials={initials}
        color={settingsStore.selfContact.color}
        imageUrl={profileImageUrl}
      />
      <div className={styles.profileDetails}>
        <div className={styles.profileDisplayName}>{profileName}</div>
        <div className={styles.profileBio}>
          {settingsStore.settings.selfstatus?.replace('\n', ' ') ||
            tx('pref_default_status_label')}
        </div>
      </div>
    </div>
  )
}
