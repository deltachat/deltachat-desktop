import React from 'react'

import ImageSelector from '../../ImageSelector'
import { LastUsedSlot } from '../../../utils/lastUsedPaths'
import { avatarInitial } from '../../Avatar'

type Props = {
  addr: string
  color: string
  displayName: string
  hideDeleteButton?: boolean
  profilePicture?: string
  setProfilePicture: (path: string) => void
}

export default function ProfileImageSelector({
  addr,
  color,
  displayName,
  profilePicture,
  setProfilePicture,
}: Props) {
  const initials = avatarInitial(displayName, addr)

  return (
    <ImageSelector
      color={color}
      filePath={profilePicture}
      initials={initials}
      lastUsedSlot={LastUsedSlot.ProfileImage}
      onChange={setProfilePicture}
    />
  )
}
