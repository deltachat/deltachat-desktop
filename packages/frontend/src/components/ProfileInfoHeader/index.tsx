import React from 'react'

import { Avatar, ClickForFullscreenAvatarWrapper } from '../Avatar'

import styles from './styles.module.scss'

type Props = {
  address?: string
  avatarPath?: string
  color?: string
  displayName: string
  wasSeenRecently?: boolean
}

export default function ProfileInfoHeader({
  avatarPath,
  color,
  displayName,
  wasSeenRecently = false,
}: Props) {
  return (
    <div className={styles.profileInfoHeader}>
      <ClickForFullscreenAvatarWrapper filename={avatarPath}>
        <Avatar
          displayName={displayName}
          avatarPath={avatarPath}
          color={color}
          wasSeenRecently={wasSeenRecently}
          className='very-large'
        />
      </ClickForFullscreenAvatarWrapper>
      <div className={styles.infoContainer}>
        <p className={styles.displayName} data-test-id='profile-display-name'>
          {displayName}
        </p>
      </div>
    </div>
  )
}
