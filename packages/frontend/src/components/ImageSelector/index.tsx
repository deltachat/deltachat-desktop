import React from 'react'
import { dirname } from 'path'

import Icon from '../Icon'
import LargeProfileImage from '../LargeProfileImage'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'

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
          extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'],
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

  return (
    <div className={styles.imageSelectorContainer}>
      <div className={styles.imageSelector}>
        <LargeProfileImage
          color={color}
          imagePath={filePath || undefined}
          initials={initials}
          disableFullscreen={false}
        />
        {!filePath && (
          <button
            type='button'
            title={selectLabel ? selectLabel : tx('profile_image_select')}
            aria-label={selectLabel ? selectLabel : tx('profile_image_select')}
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
            className={styles.imageSelectorButton}
            onClick={handleRemove}
          >
            <Icon className={styles.imageSelectorIcon} icon='cross' />
          </button>
        )}
      </div>
    </div>
  )
}
