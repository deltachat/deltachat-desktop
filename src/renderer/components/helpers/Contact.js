import React from 'react'
import classNames from 'classnames'
import { ContactName as ContactNameConversations } from '../conversations'
import styled from 'styled-components'

export function renderAvatar(avatarPath, color, displayName) {
  if (avatarPath) {
    return (
      <img
        className='module-conversation-list-item__avatar'
        src={avatarPath}
      />
    )
  }

  const codepoint = displayName.codePointAt(0)
  const initial = codepoint ? String.fromCodePoint(codepoint).toUpperCase() : '#'

  return (
    <div
      style={{ backgroundColor: color }}
      className={classNames(
        'module-conversation-list-item__avatar',
        'module-conversation-list-item__default-avatar'
      )}
    >
      {initial}
    </div>
  )
}
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
  margin-left: 20px;
`

const ContactNameDisplayName = styled.p`
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 3px;
`

const ContactNameEmail = styled.p`
  color: var(--contactEmailColor);
  margin-bottom: 3px;
  margin-top: 3px;
`

export function ContactName (displayName, address, isVerified) {
  return (
    <ContactNameWrapper>
      <ContactNameDisplayName>
        {displayName}
        {isVerified && <VerifiedIcon style={{marginLeft:'4px'}}/>}
      </ContactNameDisplayName>
      <ContactNameEmail>{address}</ContactNameEmail>
   </ContactNameWrapper>
  )
}

const ContactWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
export default function Contact(props) {
  const { id, avatarPath, color, displayName, address, isVerified } = props.contact
  return (
    <ContactWrapper>
      {renderAvatar(avatarPath, color, displayName)}
      {ContactName(displayName, address, isVerified)}
    </ContactWrapper>
  )
}

const PseudoContactText = styled.p`
  font-weight: bold;
`
export function PseudoContact(props) {
  const { cutoff, text } = props
  return (
    <ContactWrapper>
      {renderAvatar(false, false, cutoff)}
      <ContactNameWrapper>
        <PseudoContactText>{text}</PseudoContactText>
      </ContactNameWrapper>
    </ContactWrapper>
  )
}
