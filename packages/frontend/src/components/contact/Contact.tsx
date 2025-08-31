import React, { type PropsWithChildren } from 'react'
import { Avatar } from '../Avatar'

function ContactName(props: {
  displayName: string
  address: string
  isKeyContact?: boolean
  isBlocked?: boolean
}) {
  return (
    <div className='contact-name'>
      <div className='display-name'>
        <span className='truncated'>{props.displayName}</span>
        {props.isBlocked && (
          <i className='material-svg-icon material-icon-blocked' />
        )}
      </div>
      {!props.isKeyContact && <div className='email'>{props.address}</div>}
    </div>
  )
}

export default function Contact(props: {
  contact: {
    profileImage: string | null
    color: string
    displayName: string
    address: string
    isKeyContact: boolean
    wasSeenRecently: boolean
    isBlocked?: boolean
  }
}) {
  const {
    profileImage,
    color,
    displayName,
    address,
    isKeyContact,
    wasSeenRecently,
    isBlocked,
  } = props.contact
  return (
    <div className='contact'>
      <Avatar
        {...{
          avatarPath: profileImage,
          color,
          displayName,
          addr: address,
          wasSeenRecently,
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the contact name below.
          'aria-hidden': true,
        }}
      />
      <ContactName
        displayName={displayName}
        address={address}
        isKeyContact={isKeyContact}
        isBlocked={isBlocked}
      />
    </div>
  )
}

export function PseudoContact(
  props: PropsWithChildren<{ cutoff?: string; text: string; subText?: string }>
) {
  const { cutoff, text, subText } = props
  return (
    <div className='contact'>
      {props.children ? (
        props.children
      ) : (
        <Avatar
          avatarPath={undefined}
          color={'#505050'}
          displayName={cutoff || ''}
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the "contact name" below.
          aria-hidden={true}
        />
      )}
      {!subText && (
        <div className='contact-name'>
          <div className='pseudo-contact-text'>{text}</div>
        </div>
      )}
      {subText && <ContactName displayName={text} address={subText} />}
    </div>
  )
}
