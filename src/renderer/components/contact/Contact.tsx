import React, { CSSProperties, PropsWithChildren } from 'react'
import styled from 'styled-components'
import { ContactListItem } from '../conversations'
import { C } from 'deltachat-node/dist/constants'
import classNames from 'classnames'
import { ContactJSON } from '../../../shared/shared-types'

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

export function RenderContact(props: {
  contact: ContactJSON
  color: string
  onClick?: (contact: ContactJSON) => void
}) {
  const { contact, color } = props

  const oldOnClick = props.onClick
  const onClick = function(event: MouseEvent) {
    if (oldOnClick) oldOnClick(contact)
  }

  return (
    <ContactListItem
      color={color}
      onClick={onClick}
      {...convertContactProps(contact)}
    />
  )
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
  const codepoint = displayName.codePointAt(0)
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
      <QRAvatarQRCodeImg
        src='../images/qr_icon.png'
        className='sharp-pixel-image'
      />
    </div>
  )
}

const QRAvatarQRCodeImg = styled.img`
  width: 22px;
  height: 22px;
  margin-top: calc((48px - 22px) / 2);
`

export const VerifiedIconImg = styled.img`
  width: 0.75em;
  height: 0.75em;
  margin-right: 2px;
`
export const VerifiedIcon = (props: { style?: CSSProperties }) => (
  <VerifiedIconImg src='../images/verified.png' style={props.style} />
)

const ContactNameWrapper = styled.div`
  display: inline-block;
  width: calc(100% - 64px);
  height: 54px;
  margin-left: 10px;
  .chat-list & {
    width: calc(100% - 84px);
  }
`

const ContactNameDisplayName = styled.p`
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ContactNameEmail = styled.p`
  color: var(--contactEmailColor);
  margin-bottom: 3px;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export function ContactName(
  displayName: string,
  address: string,
  isVerified: boolean
) {
  return (
    <ContactNameWrapper>
      <ContactNameDisplayName>
        {displayName}
        {isVerified && <VerifiedIcon style={{ marginLeft: '4px' }} />}
      </ContactNameDisplayName>
      <ContactNameEmail>{address}</ContactNameEmail>
    </ContactNameWrapper>
  )
}

const ContactWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 300px;
  .chat-list & {
    width: 30vw;
    padding: 0px 10px;
  }
`
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
    <ContactWrapper>
      <Avatar {...{ avatarPath: profileImage, color, displayName }} />
      {ContactName(displayName, address, isVerified)}
    </ContactWrapper>
  )
}

const PseudoContactText = styled.p`
  padding-top: calc((54px - 18px) / 2);
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
export function PseudoContact(
  props: PropsWithChildren<{ cutoff: string; text: string; subText?: string }>
) {
  const { cutoff, text, subText } = props
  return (
    <ContactWrapper>
      {props.children ? props.children : renderAvatar(null, '#505050', cutoff)}
      {!subText && (
        <ContactNameWrapper>
          <PseudoContactText>{text}</PseudoContactText>
        </ContactNameWrapper>
      )}
      {subText && ContactName(text, subText, false)}
    </ContactWrapper>
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
