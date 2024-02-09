import React from 'react'
import { dirname } from 'path'

import { runtime } from '../../../runtime'
import { avatarInitial } from '../../Avatar'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import LargeProfileImage from '../../LargeProfileImage'
import Icon from '../../Icon'

import styles from './styles.module.scss'

type Props = {
  addr: string
  color: string
  displayName: string
  hideDeleteButton?: boolean
  profilePicture: string | null
  setProfilePicture: (path: string) => void
}

export default function ProfileImageSelector({
  addr,
  color,
  displayName,
  profilePicture,
  setProfilePicture,
}: Props) {
  const tx = useTranslationFunction()

  const handleSelect = async () => {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.ProfileImage
    )

    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: ['jpg', 'png', 'gif', 'jpeg'],
        },
      ],
      properties: ['openFile'],
      defaultPath,
    })

    if (file) {
      setProfilePicture(file)
      setLastPath(dirname(file))
    }
  }

  const handleRemove = () => setProfilePicture('')

  const imageUrl = profilePicture ? `file://${profilePicture}` : undefined
  const initials = avatarInitial(displayName, addr)

  return (
    <div className={styles.profileImageSelector}>
      <LargeProfileImage
        color={color}
        imageUrl={imageUrl}
        initials={initials}
      />
      {!imageUrl && (
        <button
          title={tx('profile_image_select')}
          className={styles.profileImageSelectorButton}
          onClick={handleSelect}
        >
          <Icon className={styles.profileImageSelectorIcon} icon='image' />
        </button>
      )}
      {imageUrl && (
        <button
          title={tx('profile_image_delete')}
          className={styles.profileImageSelectorButton}
          onClick={handleRemove}
        >
          <Icon className={styles.profileImageSelectorIcon} icon='cross' />
        </button>
      )}
    </div>
  )
}
