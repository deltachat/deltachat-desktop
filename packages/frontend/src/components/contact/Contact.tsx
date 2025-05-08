import React, { type PropsWithChildren } from 'react'
import { Avatar } from '../Avatar'
import { InlineVerifiedIcon } from '../VerifiedIcon'

function ContactName(props: {
  displayName: string
  address: string
  isVerified?: boolean
  isBlocked?: boolean
  isPgpContact?: boolean
}) {
  const tx = window.static_translate
  return (
    <div className='contact-name'>
      <div className='display-name'>
        <span className='truncated'>{props.displayName}</span>
        {props.isVerified && <InlineVerifiedIcon />}
        {!props.isPgpContact && (
          <div className='mail_icon' aria-label={tx('email_address')} />
        )}
        {props.isBlocked && (
          <i className='material-svg-icon material-icon-blocked' />
        )}
      </div>
      {!props.isVerified && <div className='email'>{props.address}</div>}
    </div>
  )
}

export default function Contact(props: {
  contact: {
    profileImage: string | null
    color: string
    displayName: string
    address: string
    isVerified: boolean
    wasSeenRecently: boolean
    isBlocked?: boolean
    isPgpContact?: boolean
  }
}) {
  const {
    profileImage,
    color,
    displayName,
    address,
    isVerified,
    wasSeenRecently,
    isBlocked,
    isPgpContact,
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
        isVerified={isVerified}
        isBlocked={isBlocked}
        isPgpContact={isPgpContact}
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
