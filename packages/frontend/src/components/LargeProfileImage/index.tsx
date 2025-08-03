import React, { CSSProperties } from 'react'

import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ClickForFullscreenAvatarWrapper } from '../Avatar'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'

type Props = {
  color?: string
  imagePath?: string
  initials: string
} & Pick<
  Parameters<typeof ClickForFullscreenAvatarWrapper>[0],
  'disableFullscreen'
>

interface CssWithAvatarColor extends CSSProperties {
  '--local-avatar-color': string
}

export default function LargeProfileImage({
  color,
  imagePath,
  initials,
  disableFullscreen,
}: Props) {
  const tx = useTranslationFunction()

  return (
    <div className={styles.largeProfileImage}>
      {imagePath ? (
        <ClickForFullscreenAvatarWrapper
          filename={imagePath}
          disableFullscreen={disableFullscreen}
        >
          <img
            className={styles.largeProfileImageArea}
            src={runtime.transformBlobURL(imagePath)}
            alt={tx('pref_profile_photo')}
          />
        </ClickForFullscreenAvatarWrapper>
      ) : (
        <span
          className={styles.largeProfileImageArea}
          style={{ '--local-avatar-color': color } as CssWithAvatarColor}
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
