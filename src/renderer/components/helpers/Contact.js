import React from 'react'
import classNames from 'classnames'
import { ContactName as ContactNameConversations } from '../conversations'
import styled from 'styled-components'

export function renderAvatar (avatarPath, color, displayName) {
  return (
    <Avatar avatarPath={avatarPath} color={color} displayName={displayName} />
  )
}

export function Avatar(props) {
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

export const AvatarImage = styled.img`
  margin-top: 8px;
  margin-bottom: 8px;
  height: 48px;
  width: 48px;
  border-radius: 24px;
  min-width: 48px;
  object-fit: cover;
`

export const AvatarBubble = styled.div`
  object-fit: cover;
  height: 48px;
  width: 48px;
  min-width: 48px;
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 24px;
  background-color: ${({color}) => color ? color : '#505050'};
  color: var(--avatarLabelColor);
  font-size: 26px;
  line-height: 48px;
  text-align: center;
`

export function VerifiedIcon (props) {
  return (
    <img
      className='module-conversation-list-item__is-verified'
      src='../images/verified.png'
      style={props.style}
    />
  )
}

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
  width: 320px;
`
export default function Contact (props) {
  const { id, avatarPath, color, displayName, address, isVerified } = props.contact
  return (
    <ContactWrapper>
      {renderAvatar(avatarPath, color, displayName)}
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
      {props.children ? props.children : renderAvatar(false, false, cutoff)}
      { !subText && <ContactNameWrapper><PseudoContactText>{text}</PseudoContactText></ContactNameWrapper> }
      { subText && ContactName(text, subText, false) }
    </ContactWrapper>
  )
}
