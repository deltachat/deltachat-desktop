import React from 'react'

import FullscreenAvatar from './dialogs/FullscreenAvatar'
import useContextMenu from '../hooks/useContextMenu'
import useDialog from '../hooks/dialog/useDialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import { Avatar } from './Avatar'

type Props = {
  groupImage?: string | null
  onSetGroupImage: () => void
  onUnsetGroupImage: () => void
  style?: React.CSSProperties
  groupName?: string
  color?: string
}

export default function GroupImage(props: Props) {
  const tx = useTranslationFunction()

  const {
    groupImage,
    onSetGroupImage,
    onUnsetGroupImage,
    style,
    groupName,
    color,
  } = props

  const { openDialog } = useDialog()

  const showAvatarFullscreen = () =>
    groupImage &&
    openDialog(FullscreenAvatar, {
      imagePath: groupImage,
    })

  const openContextMenu = useContextMenu([
    { label: tx('select_group_image_desktop'), action: onSetGroupImage },
    typeof groupImage === 'string' && {
      label: tx('remove_group_image'),
      action: onUnsetGroupImage,
    },
  ])

  const AvatarTag = groupImage ? 'button' : 'div'
  return (
    <div className='group-image-wrapper'>
      <AvatarTag
        className='group-image'
        onClick={() => groupImage && showAvatarFullscreen()}
      >
        <Avatar
          displayName={groupName || ''}
          avatarPath={groupImage || undefined}
          color={color}
          style={{ ...style, cursor: 'pointer' }}
          large
        />
      </AvatarTag>
      <button
        type='button'
        className='group-image-edit-button'
        data-testid='group-image-edit-button'
        onClick={openContextMenu}
        aria-label={tx('change_group_image')}
      >
        <div />
      </button>
    </div>
  )
}
