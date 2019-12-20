import React, { useState, useEffect } from 'react'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent, DeltaDialogContentTextSeperator } from './DeltaDialog'
import { DeltaButtonPrimary } from './SmallDialog'
import { Avatar } from '../contact/Contact'
import { integerToHexColor } from '../../../main/deltachat/util'
import styled from 'styled-components'
import { callDcMethodAsync } from '../../ipc'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'

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

export const ProfileInfoName = ({name, address}) => {
  return (
    <div className='profile-info-name-container'>
      <div className='name'>{name}</div>
      <div className='address'>{address}</div>
    </div>
  )
}


export const ProfileInfoAvatar = ContactAvatar

export function ContactAvatar({contact}) {
  const { displayName, profileImage } = contact
  const color = Number.isInteger(contact.color) ?
    integerToHexColor(contact.color) :
    contact.color
  return Avatar({
    avatarPath: profileImage,
    color,
    displayName
  })
}

export default function ViewProfile (props) { 
  const { isOpen, onClose, contact } = props
  const [viewMode, setViewMode] = useState('main')

  const { chatListIds, setQueryStr, setListFlags } = useChatListIds('', 0, contact.id)
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)

  const tx = window.translate

  console.log(contact)

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
              <ProfileInfoAvatar contact={contact}/>
              <ProfileInfoName name={contact.displayName} address={contact.address}/>
          </ProfileInfoContainer>
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')}/>
          <div className='mutual-chats' ref={scrollRef}>
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
      <DeltaDialogFooter>
      </DeltaDialogFooter>
    </DeltaDialogBase>
  )
}
