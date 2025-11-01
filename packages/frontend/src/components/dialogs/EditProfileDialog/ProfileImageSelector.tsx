import React from 'react'

import ImageSelector from '../../ImageSelector'
import ImageCropper from '../../ImageCropper'

import { LastUsedSlot } from '../../../utils/lastUsedPaths'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import useDialog from '../../../hooks/dialog/useDialog'
import { copyToBlobDir } from '../../../utils/copyToBlobDir'

type Props = {
  addr?: string
  color?: string
  displayName: string
  hideDeleteButton?: boolean
  profilePicture: string | null
  setProfilePicture: (path: string | null) => void
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
      onChange={async filepath => {
        if (!filepath) {
          setProfilePicture(null)
        } else {
          openDialog(ImageCropper, {
            filepath: await copyToBlobDir(filepath),
            shape: 'circle',
            onResult: setProfilePicture,
            onCancel: () => {},
            desiredWidth: 256,
            desiredHeight: 256,
          })
        }
      }}
    />
  )
}
