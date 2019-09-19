import React from 'react'
import styled, { css } from 'styled-components'

export function renderAvatar (avatarPath, color, displayName) {
  return (
    <Avatar avatarPath={avatarPath} color={color} displayName={displayName} />
  )
}

export function isValidEmail (email) {
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

export function Avatar (props) {
  const { avatarPath, color, displayName } = props
  if (avatarPath) {
    return (
      <AvatarImage src={avatarPath} />
    )
  }
  const codepoint = displayName.codePointAt(0)
  const initial = codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'

  return (
    <AvatarBubble color={color}>
      {initial}
    </AvatarBubble>
  )
}

export function QRAvatar () {
  return (
    <AvatarBubble>
      <QRAvatarQRCodeImg src='../images/qr_icon.png'
        className='sharp-pixel-image'
      />
    </AvatarBubble>
  )
}

const QRAvatarQRCodeImg = styled.img`
  width: 22px;
  height: 22px;
  margin-top: calc((48px - 22px) / 2);
`
export const AvatarMixin = css`
  position: relative;
  z-index: 2;
  object-fit: cover;
  height: 48px;
  width: 48px;
  min-width: 48px;
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 24px;
`

export const AvatarImage = styled.img`
  ${AvatarMixin}
`

export const AvatarBubble = styled.div`
  ${AvatarMixin}
  background-color: ${({ color }) => color || '#505050'};
  color: var(--avatarLabelColor);
  font-size: 26px;
  line-height: 48px;
  text-align: center;
`

export const VerifiedIconImg = styled.img`
  width: 0.75em;
  height: 0.75em;
  margin-right: 2px;
`
export const VerifiedIcon = props => <VerifiedIconImg src='../images/verified.png' style={props.style} />

const ContactNameWrapper = styled.div`
  display: inline-block;
  width: calc(100% - 64px);
  height: 54px;
  margin-left: 20px;
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

export function ContactName (displayName, address, isVerified) {
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
`
export default function Contact (props) {
  const { avatarPath, color, displayName, address, isVerified } = props.contact
  return (
    <ContactWrapper>
      <Avatar {...{ avatarPath, color, displayName }} />
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
export function PseudoContact (props) {
  const { cutoff, text, subText } = props
  return (
    <ContactWrapper>
      {props.children ? props.children : renderAvatar(false, '#505050', cutoff)}
      { !subText && <ContactNameWrapper><PseudoContactText>{text}</PseudoContactText></ContactNameWrapper> }
      { subText && ContactName(text, subText, false) }
    </ContactWrapper>
  )
}
