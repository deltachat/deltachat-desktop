import React from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/dialog/useDialog'
import FullscreenAvatar from '../dialogs/FullscreenAvatar'

import type { Type } from '../../backend-com'
import { get_first_emoji } from '@deltachat/message_parser_wasm'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'

export function QRAvatar() {
  return (
    <div className='avatar'>
      <div className='content'>
        <img className='avatar-qr-code-img' src='./images/icons/qr.svg' />
      </div>
    </div>
  )
}

export function avatarInitial(name: string, addr?: string) {
  const firstEmoji = name && get_first_emoji(name)
  if (firstEmoji) {
    return firstEmoji
  } else {
    const nameOrAddr = name || addr
    const codepoint = nameOrAddr && nameOrAddr.codePointAt(0)
    return codepoint ? String.fromCodePoint(codepoint).toUpperCase() : ''
  }
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
  tabIndex?: -1 | 0
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
    tabIndex,
    className,
  } = props

  const content = avatarPath ? (
    <img className='content' src={runtime.transformBlobURL(avatarPath)} />
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
      tabIndex={tabIndex}
    >
      {content}
    </div>
  )
}

export function AvatarFromContact(
  props: {
    contact: Type.Contact
    onClick?: (contact: Type.Contact) => void
    tabIndex?: -1 | 0
  },
  large?: boolean,
  small?: boolean
) {
  const { contact, onClick, tabIndex } = props
  return (
    <Avatar
      avatarPath={contact.profileImage || undefined}
      color={contact.color}
      displayName={contact.displayName}
      addr={contact.address}
      large={large === true}
      small={small === true}
      onClick={() => onClick && onClick(contact)}
      tabIndex={tabIndex}
    />
  )
}

export function ClickForFullscreenAvatarWrapper(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    filename?: string
  }
) {
  const { openDialog } = useDialog()

  const { children, filename } = props

  return filename ? (
    <button
      className={styles.avatarButton}
      onClick={() => {
        openDialog(FullscreenAvatar, {
          imagePath: filename!,
        })
      }}
      {...props}
    >
      {children}
    </button>
  ) : (
    <div>{children}</div>
  )
}
