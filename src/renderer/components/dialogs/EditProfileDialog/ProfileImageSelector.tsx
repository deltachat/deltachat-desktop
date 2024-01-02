import React from 'react'

import { runtime } from '../../../runtime'
import { avatarInitial } from '../../Avatar'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/cachedLastUsedPath'
import { dirname } from 'path'

export default function ProfileImageSelector({
  displayName,
  addr,
  color,
  profilePicture,
  setProfilePicture,
}: {
  displayName: string
  addr: string
  color: string
  profilePicture: string | null
  setProfilePicture: (path: string) => void
  hideDeleteButton?: boolean
}) {
  const tx = useTranslationFunction()

  const onClickSelectPicture = async () => {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.ProfileImage
    )
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: ['jpg', 'png', 'gif', 'jpeg', 'jpe'],
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

  const onClickRemovePicture = () => setProfilePicture('')

  const initial = avatarInitial(displayName, addr)

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profilePicture ? (
        <img src={'file://' + profilePicture} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <>
        <button
          aria-label={tx('profile_image_select')}
          onClick={onClickSelectPicture}
          className={'delta-button-round'}
        >
          {tx('profile_image_select')}
        </button>
        <button
          aria-label={tx('profile_image_delete')}
          onClick={onClickRemovePicture}
          className={'delta-button-round'}
          disabled={!profilePicture}
        >
          {tx('profile_image_delete')}
        </button>
      </>
    </div>
  )
}
