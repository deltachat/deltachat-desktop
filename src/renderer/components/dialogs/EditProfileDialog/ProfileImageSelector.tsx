import React from 'react'

import { runtime } from '../../../runtime'
import { avatarInitial } from '../../Avatar'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Button from '../../ui/Button'

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
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: ['jpg', 'png', 'gif', 'jpeg', 'jpe'],
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('pictures'),
    })
    if (file) setProfilePicture(file)
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
        <Button
          aria-label={tx('profile_image_select')}
          onClick={onClickSelectPicture}
          round
        >
          {tx('profile_image_select')}
        </Button>
        <Button
          aria-label={tx('profile_image_delete')}
          onClick={onClickRemovePicture}
          round
          disabled={!profilePicture}
        >
          {tx('profile_image_delete')}
        </Button>
      </>
    </div>
  )
}
