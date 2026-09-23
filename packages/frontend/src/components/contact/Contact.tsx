import React, { type PropsWithChildren } from 'react'
import type { T } from '@deltachat/jsonrpc-client'

import { Avatar } from '../Avatar'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { lastSeenLongAgoText } from '../../utils/contactFreshness'

function ContactName(props: {
  displayName: string
  subtitle?: string
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
      {props.subtitle && <div className='subtitle'>{props.subtitle}</div>}
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
    freshness: T.ContactFreshness
    lastSeen: number
    isBlocked?: boolean
  }
}) {
  const tx = useTranslationFunction()

  const {
    profileImage,
    color,
    displayName,
    address,
    isKeyContact,
    freshness,
    lastSeen,
    isBlocked,
  } = props.contact

  // Contacts we have not heard of for a long time are more likely to not
  // receive our messages, so tell the user about it.
  const subtitle =
    freshness === 'Old'
      ? lastSeenLongAgoText(lastSeen, tx)
      : isKeyContact
        ? undefined
        : address

  return (
    <div className='contact'>
      <Avatar
        {...{
          avatarPath: profileImage,
          color,
          displayName,
          addr: address,
          freshness,
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the contact name below.
          'aria-hidden': true,
        }}
      />
      <ContactName
        displayName={displayName}
        subtitle={subtitle}
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
      {subText && <ContactName displayName={text} subtitle={subText} />}
    </div>
  )
}
