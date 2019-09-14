import React from 'react'
import styled from 'styled-components'
import { AvatarBubble, QRAvatar } from '../helpers/Contact'
import { PseudoContactListItem } from '../helpers/ContactList'

export const CreateChatContactListWrapper = styled.div`
  margin: -20px;
  background-color: var(--bp3DialogBgPrimary);
`

export const CreateChatSearchInput = styled.input`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  -webkit-box-flex: 1;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  margin: 0;
  line-height: inherit;
  border: 0px;
  font-size: 18px;
  background-color: transparent;
`

export const NoSearchResultsAvatarBubble = styled(AvatarBubble)`
  transform: rotate(45deg); 
  line-height: 46px;
  letter-spacing: 1px;
  &::after {
    content: ':-(';
  }
`

export const PseudoContactListItemNoSearchResults = ({ queryStr }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='addmember'
      text={tx('search_no_result_for_x', queryStr)}
    >
      <NoSearchResultsAvatarBubble />
    </PseudoContactListItem>
  )
}

export const PseudoContactListItemShowQrCode = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='showqrcode'
      text={tx('qrshow_title')}
      onClick={onClick}
    >
      <QRAvatar />
    </PseudoContactListItem>
  )
}

export const PseudoContactListItemAddMember = ({ onClick }) => {
  const tx = window.translate
  return (
    <PseudoContactListItem
      id='addmember'
      cutoff='+'
      text={tx('group_add_members')}
      onClick={onClick}
    />
  )
}
