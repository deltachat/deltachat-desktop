import React from 'react'

import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import LargeProfileImage from '../LargeProfileImage'

import type { SettingsStoreState } from '../../stores/settings'

import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'

type Props = {
  settingsStore: SettingsStoreState
  onStatusClick?: () => void
}

export default function Profile({ settingsStore, onStatusClick }: Props) {
  const tx = useTranslationFunction()

  const initials = avatarInitial(
    settingsStore.settings?.displayname || '',
    settingsStore.selfContact.address
  )

  const profileImagePath = settingsStore.selfContact.profileImage || ''

  const profileName =
    settingsStore.settings.displayname !== ''
      ? settingsStore.settings.displayname
      : tx('pref_profile_info_headline')

  return (
    <div className={styles.profile}>
      <LargeProfileImage
        initials={initials}
        color={settingsStore.selfContact.color}
        imagePath={profileImagePath}
        disableFullscreen={false}
      />
      <div className={styles.profileDetails}>
        <div className={styles.profileDisplayName}>{profileName}</div>
        <div
          className={styles.profileBio}
          style={
            !settingsStore.settings.selfstatus
              ? { fontStyle: 'italic', cursor: 'pointer', opacity: 0.6 }
              : undefined
          }
          onClick={onStatusClick}
        >
          {settingsStore.settings.selfstatus?.replace('\n', ' ') ||
            tx('pref_default_status_label')}
        </div>
      </div>
    </div>
  )
}
