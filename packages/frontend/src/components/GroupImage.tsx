import React from 'react'

import useContextMenu from '../hooks/useContextMenu'
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

  const openContextMenu = useContextMenu([
    { label: tx('select_group_image_desktop'), action: onSetGroupImage },
    typeof groupImage === 'string' && {
      label: tx('remove_group_image'),
      action: onUnsetGroupImage,
    },
  ])

  return (
    <div className='group-image-wrapper'>
      <button
        type='button'
        className='group-image'
        onClick={onSetGroupImage}
        aria-label={tx('select_group_image_desktop')}
        title={tx('select_group_image_desktop')}
      >
        <Avatar
          displayName={groupName || ''}
          avatarPath={groupImage || undefined}
          color={color}
          style={{ ...style, cursor: 'pointer' }}
          large
          aria-hidden={true}
        />
      </button>
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
