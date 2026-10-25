import React from 'react'
import { dirname } from 'path'
import classNames from 'classnames'

import Icon from '../Icon'
import LargeProfileImage from '../LargeProfileImage'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'
import { IMAGE_EXTENSIONS } from '@deltachat-desktop/shared/constants'

type Props = {
  color?: string
  filePath: string | null
  initials: string
  lastUsedSlot: LastUsedSlot
  onChange: (path: string | null) => void
  removeLabel?: string
  selectLabel?: string
  titleLabel?: string
}

export default function ImageSelector({
  color,
  filePath,
  initials,
  lastUsedSlot,
  onChange,
  removeLabel,
  selectLabel,
  titleLabel,
}: Props) {
  const tx = useTranslationFunction()

  const handleSelect = async () => {
    const { defaultPath, setLastPath } =
      await rememberLastUsedPath(lastUsedSlot)

    const [file] = await runtime.showOpenFileDialog({
      title: titleLabel ? titleLabel : tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: IMAGE_EXTENSIONS,
        },
      ],
      properties: ['openFile'],
      defaultPath,
    })

    if (file) {
      onChange(file)
      setLastPath(dirname(file))
    }
  }

  const handleRemove = () => onChange(null)

  const selectLabelText = selectLabel ? selectLabel : tx('profile_image_select')

  return (
    <div className={styles.imageSelectorContainer}>
      <div className={styles.imageSelector}>
        <button
          type='button'
          title={selectLabelText}
          aria-label={selectLabelText}
          className={styles.imageSelectorAvatarButton}
          onClick={handleSelect}
        >
          <LargeProfileImage
            color={color}
            imagePath={filePath || undefined}
            initials={initials}
            disableFullscreen={true}
          />
        </button>
        {!filePath && (
          // same action as clicking the avatar, so hide it from assistive tech
          <button
            type='button'
            title={selectLabelText}
            aria-hidden
            tabIndex={-1}
            className={styles.imageSelectorButton}
            onClick={handleSelect}
          >
            <Icon className={styles.imageSelectorIcon} icon='image' />
          </button>
        )}
        {filePath && (
          <button
            type='button'
            title={removeLabel ? removeLabel : tx('profile_image_delete')}
            aria-label={removeLabel ? removeLabel : tx('profile_image_delete')}
            className={classNames(
              styles.imageSelectorButton,
              styles.imageSelectorRemoveButton
            )}
            onClick={handleRemove}
          >
            <Icon className={styles.imageSelectorIcon} icon='cross' />
          </button>
        )}
      </div>
    </div>
  )
}
