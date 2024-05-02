import React from 'react'

import ImageSelector from '../../ImageSelector'
import ImageCropper from '../../ImageCropper'

import { LastUsedSlot } from '../../../utils/lastUsedPaths'
import { avatarInitial } from '../../Avatar'
import useDialog from '../../../hooks/dialog/useDialog'

type Props = {
  addr?: string
  color?: string
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

  const { openDialog } = useDialog()

  return (
    <ImageSelector
      color={color}
      filePath={profilePicture}
      initials={initials}
      lastUsedSlot={LastUsedSlot.ProfileImage}
      onChange={filepath => {
        if (!filepath) {
          setProfilePicture('')
        } else {
          openDialog(ImageCropper, {
            filepath,
            shape: 'circle',
            setProfilePicture,
            onCancel: () => {},
            targetWidth: 256,
            targetHeight: 256,
          })
        }
      }}
    />
  )
}
