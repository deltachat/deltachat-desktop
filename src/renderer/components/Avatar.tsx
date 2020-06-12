import React from 'react'
import classNames from 'classnames'

export function QRAvatar() {
  return (
    <div className='avatar'>
      <div className='content'>
        <img
          className='avatar-qr-code-img sharp-pixel-image'
          src='../images/qr_icon.png'
        />
      </div>
    </div>
  )
}

function nameToInitial(name: string) {
  const codepoint = name && name.codePointAt(0)
  return codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'
}

type htmlDivProps = React.HTMLAttributes<HTMLDivElement>

export function Avatar(props: {
  avatarPath?: string
  color?: string
  displayName: string
  large?: boolean
  small?: boolean
  isVerified?: boolean
  onClick?: htmlDivProps['onClick']
  style?: htmlDivProps['style']
}) {
  const { avatarPath, color, displayName, isVerified, large, small } = props

  const content = avatarPath ? (
    <img className='content' src={avatarPath} {...props} />
  ) : (
    <div className='content' {...props} style={{ backgroundColor: color }}>
      {nameToInitial(displayName)}
    </div>
  )

  return (
    <div className={classNames('avatar', { large, small })}>
      {content}
      {isVerified && (
        <img className='verified-icon' src='../images/verified.png' />
      )}
    </div>
  )
}
