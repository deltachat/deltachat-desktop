import React from 'react'
import styled from 'styled-components'
import { PseudoContact, AvatarBubble, QRAvatar } from './Contact'
import { ContactListItemWrapper } from './ContactListItem'

export function PseudoListItem (props) {
  const { id, cutoff, text, subText, onClick, avatar } = props
  return (
    <ContactListItemWrapper
      key={id}
      onClick={onClick}
    >
      <PseudoContact cutoff={cutoff} text={text} subText={subText} avatar={avatar}>
        {props.children}
      </PseudoContact>
    </ContactListItemWrapper>
  )
}

export const NoSearchResultsAvatarBubble = styled(AvatarBubble)`
  transform: rotate(45deg); 
  line-height: 46px;
  letter-spacing: 1px;
  &::after {
    content: ':-(';
  }
`

export const PseudoListItemNoSearchResults = ({ queryStr }) => {
  const tx = window.translate
  return (
    <PseudoListItem
      id='addmember'
      text={tx('search_no_result_for_x', queryStr)}
    >
      <NoSearchResultsAvatarBubble />
    </PseudoListItem>
  )
}

export const PseudoListItemShowQrCode = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoListItem
      id='showqrcode'
      text={tx('qrshow_title')}
      onClick={onClick}
    >
      <QRAvatar />
    </PseudoListItem>
  )
}

export const PseudoListItemAddMember = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoListItem
      id='addmember'
      cutoff='+'
      text={tx('group_add_members')}
      onClick={onClick}
    />
  )
}

export const PseudoListItemAddContact = ({ queryStr, queryStrIsEmail, onClick }) => {
  const tx = window.translate
  return (
    <PseudoListItem
      id='newcontact'
      cutoff='+'
      text={tx('menu_new_contact')}
      subText={queryStrIsEmail ? queryStr + ' ...' : tx('contacts_type_email_above')}
      onClick={onClick}
    />
  )
}
