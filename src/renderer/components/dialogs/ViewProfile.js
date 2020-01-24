import React from 'react'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent, DeltaDialogContentTextSeperator } from './DeltaDialog'
import { Avatar } from '../contact/Contact'
import { integerToHexColor } from '../../../shared/util'
import styled from 'styled-components'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { callDcMethodAsync } from '../../ipc'

export const ProfileInfoContainer = styled.div`
  margin-left: 10px;
  display: inline-grid;
  grid-template-columns: auto auto;
  .profile-info-name-container {
    margin: auto 10px;
    .name {
      font-size: medium;
      font-weight: bold;
    }
    .address {
      color: #565656;
    }
  }
`

export const OpenChatButton = styled.div`
  width: 100%;
  padding-left: 20px;
  line-height: 40px;
  font-size: 17px;
  padding-top: 5px;
  padding-bottom: 5px;
  color: black;
  &:hover {
    color: var(--chatListItemSelectedText);
    background-color: var(--chatListItemSelectedBg);
    font-weight: bold;
  }
`

export const ProfileInfoName = ({ name, address }) => {
  return (
    <div className='profile-info-name-container'>
      <div className='name'>{name}</div>
      <div className='address'>{address}</div>
    </div>
  )
}

export const ProfileInfoAvatar = ContactAvatar

export function ContactAvatar ({ contact }) {
  const { displayName, profileImage } = contact
  const color = Number.isInteger(contact.color)
    ? integerToHexColor(contact.color)
    : contact.color
  return Avatar({
    avatarPath: profileImage,
    color,
    displayName
  })
}

export default function ViewProfile (props) {
  const { isOpen, onClose, contact } = props

  const { chatListIds } = useChatListIds('', 0, contact.id)
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)

  const tx = window.translate

  const onChatClick = chatId => {
    selectChat(chatId)
    onClose()
  }

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
    >
      <DeltaDialogHeader
        title={tx('menu_view_profile')}
        onClose={onClose}
        borderBottom
      />
      <DeltaDialogBody>
        <DeltaDialogContent noPadding>
          <ProfileInfoContainer>
            <ProfileInfoAvatar contact={contact} />
            <ProfileInfoName name={contact.displayName} address={contact.address} />
          </ProfileInfoContainer>
          <DeltaDialogContentTextSeperator text={tx('profile_actions')} />
          <OpenChatButton role='button' onClick={() => {
            callDcMethodAsync('contacts.getDMChatId', [contact.id]).then((chatId) => onChatClick(chatId))
          }}>
            {tx('profile_action_direct_message')}
          </OpenChatButton>
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')} />
          <div className='mutual-chats' ref={scrollRef} onScroll={onChatListScroll}>
            {chatListIds.map(chatId => {
              return (
                <ChatListItem
                  key={chatId}
                  chatListItem={chatItems[chatId]}
                  onClick={onChatClick.bind(null, chatId)}
                />
              )
            })}
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter />
    </DeltaDialogBase>
  )
}
