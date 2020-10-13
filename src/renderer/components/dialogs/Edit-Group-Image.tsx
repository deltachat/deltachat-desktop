import React, { useContext } from 'react'
import { ScreenContext } from '../../contexts'
import { Avatar } from '../Avatar'
import { useContextMenu } from '../ContextMenu'

export const GroupImage = (props: {
  groupImage: string
  onSetGroupImage: () => void
  onUnsetGroupImage: () => void
  style?: React.CSSProperties
  groupName?: string
  isVerified?: boolean
  color: string
}) => {
  const tx = window.static_translate
  const {
    groupImage,
    onSetGroupImage,
    onUnsetGroupImage,
    style,
    groupName,
    isVerified,
    color,
  } = props

  const { openDialog } = useContext(ScreenContext)

  const showAvatarFullscreen = () =>
    openDialog('FullscreenMedia', {
      msg: {
        attachment: {
          url: groupImage,
          contentType: 'image/x',
        },
        file: groupImage,
      },
    })

  const openContextMenu = useContextMenu([
    { label: tx('set_group_avatar'), action: onSetGroupImage },
    groupImage && {
      label: tx('remove_group_avatar'),
      action: onUnsetGroupImage,
    },
  ])

  return (
    <div className='group-image-wrapper'>
      <div onClick={groupImage && showAvatarFullscreen}>
        <Avatar
          displayName={groupName}
          avatarPath={groupImage}
          isVerified={isVerified}
          color={color}
          style={{ ...style, cursor: 'pointer' }}
          large
        />
      </div>
      <div
        className='group-image-edit-button'
        onClick={openContextMenu}
        aria-label={tx('a11y_change_group_image')}
      >
        <div />
      </div>
    </div>
  )
}
