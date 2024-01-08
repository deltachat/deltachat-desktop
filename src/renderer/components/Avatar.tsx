import React from 'react'
import classNames from 'classnames'
import { T } from '@deltachat/jsonrpc-client'

import { Type } from '../backend-com'
import FullscreenMedia, {
  NeighboringMediaMode,
} from './dialogs/FullscreenMedia'
import useDialog from '../hooks/useDialog'

import type { PropsWithChildren } from 'react'

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
        openDialog(FullscreenMedia, {
          msg: {
            fileMime: 'image/x',
            file: props.filename,
          } as T.Message,
          neighboringMedia: NeighboringMediaMode.Off,
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
