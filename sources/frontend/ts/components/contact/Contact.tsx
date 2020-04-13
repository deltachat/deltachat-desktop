import React, { CSSProperties, PropsWithChildren } from 'react'
import { C } from 'deltachat-node/dist/constants'
import classNames from 'classnames'
import { ContactJSON } from '../../../../shared/shared-types'

export function convertContactProps(contact: ContactJSON) {
  return {
    name: contact.name,
    email: contact.address,
    avatarPath: contact.profileImage,
    profileName: contact.displayName,
    isMe: contact.id === C.DC_CONTACT_ID_SELF,
    verified: contact.isVerified,
  }
}

export function renderAvatar(
  avatarPath: string,
  color: string,
  displayName: string
) {
  return (
    <Avatar avatarPath={avatarPath} color={color} displayName={displayName} />
  )
}

export function isValidEmail(email: string) {
  // empty string is not allowed
  if (email === '') return false
  const parts = email.split('@')
  // missing @ character or more than one @ character
  if (parts.length !== 2) return false
  const [local, domain] = parts
  // empty string is not valid for local part
  if (local === '') return false
  // domain is too short
  if (domain.length <= 3) return false
  const dot = domain.indexOf('.')
  // invalid domain without a dot
  if (dot === -1) return false
  // invalid domain if dot is (second) last character
  if (dot >= domain.length - 2) return false

  return true
}

export function Avatar(props: {
  avatarPath?: string
  color?: string
  displayName: string
  large?: boolean
}) {
  const { avatarPath, color, displayName, large } = props
  if (avatarPath) return AvatarImage({ large, avatarPath })
  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'

  return (
    <div
      className={classNames('AvatarBubble', { large })}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}

export function AvatarImage({
  avatarPath,
  large,
  ...otherProps
}: {
  avatarPath: string
  large?: boolean
  [key: string]: any /* todo remove the [key:string]:any type here */
}) {
  return (
    <img
      className={classNames('AvatarImage', { large })}
      src={avatarPath}
      {...otherProps}
    />
  )
}

export function QRAvatar() {
  return (
    <div className='AvatarBubble'>
      <img
        className='avatar-qr-code-img sharp-pixel-image'
        src='../images/qr_icon.png'
      />
    </div>
  )
}

export const VerifiedIcon = (props: { style?: CSSProperties }) => (
  <img
    className='verified-icon'
    src='../images/verified.png'
    style={props.style}
  />
)

export function ContactName(
  displayName: string,
  address: string,
  isVerified: boolean
) {
  return (
    <div className='contact-name'>
      <div className='display-name'>
        {displayName}
        {isVerified && <VerifiedIcon style={{ marginLeft: '4px' }} />}
      </div>
      <div className='email'>{address}</div>
    </div>
  )
}

export default function Contact(props: {
  contact: {
    profileImage: string
    color: string
    displayName: string
    address: string
    isVerified: boolean
  }
}) {
  const {
    profileImage,
    color,
    displayName,
    address,
    isVerified,
  } = props.contact
  return (
    <div className='contact'>
      <Avatar {...{ avatarPath: profileImage, color, displayName }} />
      {ContactName(displayName, address, isVerified)}
    </div>
  )
}

export function PseudoContact(
  props: PropsWithChildren<{ cutoff: string; text: string; subText?: string }>
) {
  const { cutoff, text, subText } = props
  return (
    <div className='contact'>
      {props.children ? props.children : renderAvatar(null, '#505050', cutoff)}
      {!subText && (
        <div className='contact-name'>
          <div className='pseudo-contact-text'>{text}</div>
        </div>
      )}
      {subText && ContactName(text, subText, false)}
    </div>
  )
}

export function AvatarBubble(
  props: PropsWithChildren<{
    className?: string
    noSearchResults?: boolean
    [key: string]: any
  } /* todo remove the [key:string]:any type here */>
) {
  return (
    <div
      className={classNames(
        'AvatarBubble',
        { 'AvatarBubble--NoSearchResults': props.noSearchResults },
        props.className
      )}
      {...props}
    >
      {props.children}
    </div>
  )
}
