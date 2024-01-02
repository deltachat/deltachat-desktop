import { T } from '@deltachat/jsonrpc-client'
import React from 'react'

import useDialog from '../hooks/useDialog'
import { Avatar } from './Avatar'
import useTranslationFunction from '../hooks/useTranslationFunction'
import FullscreenMedia, {
  NeighboringMediaMode,
} from './dialogs/FullscreenMedia'
import useContextMenu from '../hooks/useContextMenu'

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
    openDialog(FullscreenMedia, {
      msg: {
        fileMime: 'image/x',
        file: groupImage,
      } as T.Message,
      neighboringMedia: NeighboringMediaMode.Off,
    })

  const openContextMenu = useContextMenu([
    { label: tx('select_group_image_desktop'), action: onSetGroupImage },
    typeof groupImage === 'string' && {
      label: tx('remove_group_image'),
      action: onUnsetGroupImage,
    },
  ])

  return (
    <div className='group-image-wrapper'>
      <div onClick={() => groupImage && showAvatarFullscreen()}>
        <Avatar
          displayName={groupName || ''}
          avatarPath={groupImage || undefined}
          color={color}
          style={{ ...style, cursor: 'pointer' }}
          large
        />
      </div>
      <div
        className='group-image-edit-button'
        onClick={openContextMenu}
        aria-label={tx('change_group_image')}
      >
        <div />
      </div>
    </div>
  )
}
