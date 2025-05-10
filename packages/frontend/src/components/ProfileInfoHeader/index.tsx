import React from 'react'

import { Avatar, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { InlineVerifiedIcon } from '../VerifiedIcon'

import styles from './styles.module.scss'

type Props = {
  address?: string
  avatarPath?: string
  color?: string
  displayName: string
  isVerified: boolean
  isPgpContact?: boolean // not relevant for groups
  wasSeenRecently?: boolean // not relevant for groups
}

export default function ProfileInfoHeader({
  avatarPath,
  color,
  displayName,
  isVerified,
  isPgpContact,
  wasSeenRecently = false,
}: Props) {
  const tx = window.static_translate
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
        <p className={styles.displayName}>
          {displayName}
          <span className={styles.verifiedIconWrapper}>
            {isVerified && <InlineVerifiedIcon />}
          </span>
          {isPgpContact === false && (
            <div className='mail_icon' aria-label={tx('email_address')} />
          )}
        </p>
      </div>
    </div>
  )
}
