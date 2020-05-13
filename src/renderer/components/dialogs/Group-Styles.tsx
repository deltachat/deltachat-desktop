import React from 'react'
import { AvatarBubble, AvatarImage } from '../contact/Contact'

const GroupImageUnsetButton = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className='group-image-unset-button-wrapper' {...props}>
      <span />
      <span />
    </div>
  )
}

export const GroupImage = (props: {
  groupImage: string
  onSetGroupImage: (event: React.SyntheticEvent) => void
  onUnsetGroupImage: (event: React.SyntheticEvent) => void
  style?: React.CSSProperties
}) => {
  const { groupImage, onSetGroupImage, onUnsetGroupImage, style } = props
  return (
    <div className='group-image-wrapper'>
      {groupImage && (
        <AvatarImage
          avatarPath={groupImage}
          onClick={onSetGroupImage}
          style={style}
          large
        />
      )}
      {!groupImage && (
        <AvatarBubble onClick={onSetGroupImage} style={style} large>
          G
        </AvatarBubble>
      )}
      <GroupImageUnsetButton
        style={{ visibility: groupImage ? 'visible' : 'hidden' }}
        onClick={onUnsetGroupImage}
      />
    </div>
  )
}
