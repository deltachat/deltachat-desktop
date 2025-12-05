import React, { CSSProperties } from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/dialog/useDialog'
import FullscreenAvatar from '../dialogs/FullscreenAvatar'

import type { Type } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'
import type { T } from '@deltachat/jsonrpc-client'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'

export function QRAvatar() {
  return (
    <div className='avatar'>
      <div className='content'>
        <img className='avatar-qr-code-img' src='./images/icons/qr.svg' />
      </div>
    </div>
  )
}

type htmlDivProps = React.HTMLAttributes<HTMLDivElement>

export interface CssWithAvatarColor extends CSSProperties {
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
    disableFullscreen: boolean
  }
) {
  const { openDialog } = useDialog()

  const { children, filename, disableFullscreen, ...buttonProps } = props

  return filename && !disableFullscreen ? (
    <button
      type='button'
      className={styles.avatarButton}
      onClick={() => {
        openDialog(FullscreenAvatar, {
          imagePath: filename!,
        })
      }}
      {...buttonProps}
    >
      {children}
    </button>
  ) : (
    <div>{children}</div>
  )
}

type ChatSubset = Pick<T.BasicChat, 'isEncrypted'>
type ContactSubset = Pick<T.Contact, 'isKeyContact'>

/**
 * Note that this function does not apply to all possible avatars.
 * It's only handy in places where we usually want to make it possible
 * to enlarge the avatar, except some somewhat special cases.
 */
export function shouldDisableClickForFullscreen<
  T extends ChatSubset | ContactSubset,
>(chatOrContact: T): boolean {
  const isContact = 'isKeyContact' in chatOrContact
  if (isContact) {
    const _assert: ContactSubset = chatOrContact
  } else {
    const _assert: ChatSubset = chatOrContact
  }

  // It's just an "envelope" icon, there is no need to view it in full screen.
  // See https://github.com/deltachat/deltachat-desktop/issues/5365.
  const isAvatarADummyImage = isContact
    ? !chatOrContact.isKeyContact
    : !chatOrContact.isEncrypted

  return isAvatarADummyImage
}
