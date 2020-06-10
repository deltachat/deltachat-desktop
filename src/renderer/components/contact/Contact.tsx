import React, { CSSProperties, PropsWithChildren } from 'react'
import { C } from 'deltachat-node/dist/constants'
import { ContactJSON } from '../../../shared/shared-types'
import { Avatar } from '../Avatar'

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
      {props.children ? (
        props.children
      ) : (
        <Avatar avatarPath={null} color={'#505050'} displayName={cutoff} />
      )}
      {!subText && (
        <div className='contact-name'>
          <div className='pseudo-contact-text'>{text}</div>
        </div>
      )}
      {subText && ContactName(text, subText, false)}
    </div>
  )
}
