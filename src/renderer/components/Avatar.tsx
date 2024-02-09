import React from 'react'
import classNames from 'classnames'

import useDialog from '../hooks/useDialog'
import FullscreenAvatar from './dialogs/FullscreenAvatar'

import type { Type } from '../backend-com'
import type { PropsWithChildren } from 'react'

export function QRAvatar() {
  return (
    <div className='avatar'>
      <div className='content'>
        <img className='avatar-qr-code-img' src='../images/icons/qr.svg' />
      </div>
    </div>
  )
}

export function avatarInitial(name: string, addr?: string) {
  const nameOrAddr = name || addr
  const codepoint = nameOrAddr && nameOrAddr.codePointAt(0)
  return codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'
}

type htmlDivProps = React.HTMLAttributes<HTMLDivElement>

export function Avatar(props: {
  avatarPath?: string | null
  color?: string
  displayName: string
  addr?: string
  large?: boolean
  small?: boolean
  wasSeenRecently?: boolean
  style?: htmlDivProps['style']
  onClick?: () => void
  className?: string
}) {
  const {
    avatarPath,
    color,
    displayName,
    addr,
    large,
    small,
    wasSeenRecently,
    onClick,
    className,
  } = props

  const content = avatarPath ? (
    <img className='content' src={'file://' + avatarPath} />
  ) : (
    <div className='content' style={{ backgroundColor: color }}>
      {avatarInitial(displayName, addr)}
    </div>
  )

  return (
    <div
      className={classNames(
        'avatar',
        { large, small, wasSeenRecently },
        className
      )}
      onClick={onClick}
    >
      {content}
    </div>
  )
}

export function AvatarFromContact(
  props: { contact: Type.Contact; onClick?: (contact: Type.Contact) => void },
  large?: boolean,
  small?: boolean
) {
  const { contact, onClick } = props
  return (
    <Avatar
      avatarPath={contact.profileImage || undefined}
      color={contact.color}
      displayName={contact.displayName}
      addr={contact.address}
      large={large === true}
      small={small === true}
      onClick={() => onClick && onClick(contact)}
    />
  )
}

export function ClickForFullscreenAvatarWrapper(
  props: PropsWithChildren<{
    filename?: string
  }>
) {
  const { openDialog } = useDialog()

  return (
    <div
      onClick={() => {
        if (!props.filename) {
          return
        }
        openDialog(FullscreenAvatar, {
          imagePath: props.filename,
        })
      }}
      style={{
        cursor: props.filename ? 'pointer' : 'default',
      }}
    >
      {props.children}
    </div>
  )
}
