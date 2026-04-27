import React from 'react'

import { Avatar, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { parseAndRenderMessage } from '../message/MessageParser'

import styles from './styles.module.scss'

type Props = {
  address?: string
  avatarPath?: string
  color?: string
  displayName: string
  wasSeenRecently?: boolean
  description?: string
} & Pick<
  Parameters<typeof ClickForFullscreenAvatarWrapper>[0],
  'disableFullscreen'
>

export default function ProfileInfoHeader({
  avatarPath,
  color,
  displayName,
  wasSeenRecently = false,
  description = '',
  disableFullscreen,
}: Props) {
  return (
    <div className={styles.profileInfoHeader}>
      <ClickForFullscreenAvatarWrapper
        filename={avatarPath}
        disableFullscreen={disableFullscreen}
      >
        <Avatar
          displayName={displayName}
          avatarPath={avatarPath}
          color={color}
          wasSeenRecently={wasSeenRecently}
          className='very-large'
        />
      </ClickForFullscreenAvatarWrapper>
      <div className={styles.infoContainer}>
        <p className={styles.displayName} data-testid='profile-display-name'>
          {displayName}
        </p>
        {description && (
          <p className={styles.description} data-testid='profile-description'>
            {parseAndRenderMessage(description, false, 0)}
          </p>
        )}
      </div>
    </div>
  )
}
