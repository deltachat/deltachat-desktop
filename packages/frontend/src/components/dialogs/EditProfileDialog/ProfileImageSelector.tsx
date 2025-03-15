import React from 'react'

import ImageSelector from '../../ImageSelector'
import ImageCropper from '../../ImageCropper'

import { LastUsedSlot } from '../../../utils/lastUsedPaths'
import { avatarInitial } from '../../Avatar'
import useDialog from '../../../hooks/dialog/useDialog'
import { BackendRemote } from '../../../backend-com'

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
        console.log("onchange: ", filepath);
        if (!filepath) {
          setProfilePicture(null)
        } else {
          let acc = await BackendRemote.rpc.getSelectedAccountId()
          if (acc === null) {
            console.error("No account selected")
            return
          }
          const blob_path = await BackendRemote.rpc.copyToBlobdir(acc, filepath)

          console.log("blob_path: ", blob_path)
          openDialog(ImageCropper, {
            filepath: blob_path,
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
