import React, { CSSProperties } from 'react'
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

interface CssWithAvatarColor extends CSSProperties {
  '--local-avatar-color': string
}

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
  /**
   * Consider setting this to `true` if the name
   * of whoever the avatar belongs to is displayed somewhere near.
   * Has no effect when `onClick` is set.
   */
  'aria-hidden'?: boolean
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
    <div
      className='content'
      style={{ '--local-avatar-color': color } as CssWithAvatarColor}
    >
      {avatarInitial(displayName, addr)}
    </div>
  )

  return (
    <div
      className={classNames(
        'avatar',
        // Since `wasSeenRecently` is not exposed to accessibility API,
        // it is safe to apply aria-hidden to the entire component.
        // If at some point we make `wasSeenRecently` accessible,
        // we should only apply `aria-hidden` to the avatar / initial itself
        // (and perhaps rename the prop).
        { large, small, wasSeenRecently },
        className
      )}
      onClick={onClick}
      aria-hidden={onClick ? undefined : props['aria-hidden']}
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
    /**
     * @see {@link Avatar}'s aria-hidden prop.
     */
    'aria-hidden'?: boolean
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
