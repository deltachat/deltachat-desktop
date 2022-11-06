import React, { CSSProperties, PropsWithChildren } from 'react'
import { Avatar } from '../Avatar'

const VerifiedIcon = (props: { style?: CSSProperties }) => (
  <img
    className='verified-icon'
    src='../images/verified.png'
    style={props.style}
  />
)

function ContactName(
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
    profileImage: string | null
    color: string
    displayName: string
    address: string
    isVerified: boolean
    wasSeenRecently: boolean
  }
}) {
  const {
    profileImage,
    color,
    displayName,
    address,
    isVerified,
    wasSeenRecently,
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
        }}
      />
      {ContactName(displayName, address, isVerified)}
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
        />
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
