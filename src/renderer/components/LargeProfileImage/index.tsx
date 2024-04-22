import React from 'react'

import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ClickForFullscreenAvatarWrapper } from '../Avatar'

import styles from './styles.module.scss'

type Props = {
  color?: string
  imageUrl?: string
  initials: string
}

export default function LargeProfileImage({
  color,
  imageUrl,
  initials,
}: Props) {
  const tx = useTranslationFunction()

  return (
    <div className={styles.largeProfileImage}>
      {imageUrl ? (
        <ClickForFullscreenAvatarWrapper filename={imageUrl}>
          <img
            className={styles.largeProfileImageArea}
            src={imageUrl}
            alt={tx('pref_profile_photo')}
          />
        </ClickForFullscreenAvatarWrapper>
      ) : (
        <span
          className={styles.largeProfileImageArea}
          style={{ backgroundColor: color }}
        >
          {initials ? (
            initials
          ) : (
            <Icon
              className={styles.largeProfileImageDefaultIcon}
              icon='person-filled'
              size={70}
            />
          )}
        </span>
      )}
    </div>
  )
}
