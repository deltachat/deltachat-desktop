import React, { useState, useEffect } from 'react'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogContent, DeltaDialogContentSeperator, DeltaDialogContentTextSeperator, DeltaDialogButton } from './DeltaDialog'
import { Avatar } from '../contact/Contact'
import { integerToHexColor } from '../../../shared/util'
import styled from 'styled-components'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { callDcMethodAsync } from '../../ipc'
import { PseudoListItem } from '../helpers/PseudoListItem'
import { Button } from '@blueprintjs/core'

export const ProfileInfoContainer = styled.div`
  margin-left: 10px;
  display: flex;
  width: calc(100% - 27px);
  .profile-info-name-container {
    margin: auto 17px;
    flex-grow: 1;
    .name {
      font-size: medium;
      font-weight: bold;
    }
    .address {
      color: #565656;
    }
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
    displayName,
    large: true
  })
}

export function useEffectAsync (cb, dependencies) {
  useEffect(() => { cb() }, dependencies)
}

export function useStateAsync (initial, cb) {
  const [value, setValue] = useState(initial)
  useEffectAsync(async () => {
    setValue(await Promise.resolve(cb))
  }, [])
  return [value, setValue]
}

export default function ViewProfile (props) {
  const { isOpen, onClose, contact } = props

  const { chatListIds } = useChatListIds('', 0, contact.id)
  // const [ chatItems, onChatListScroll, scrollRef ] = [ {}, () => {}, null ]
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)

  const tx = window.translate

  const onChatClick = chatId => {
    selectChat(chatId)
    onClose()
  }
  const onSendMessage = async () => {
    const dmChatId = await callDcMethodAsync('contacts.getDMChatId', [contact.id])
    onChatClick(dmChatId)
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
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <ProfileInfoContainer>
            <ProfileInfoAvatar contact={contact} />
            <ProfileInfoName name={contact.displayName} address={contact.address} />
          </ProfileInfoContainer>
          <Button style={{ marginLeft: '90px', marginBottom: '30px' }} onClick={onSendMessage}>{tx('send_message')}</Button>
          <DeltaDialogContentTextSeperator style={{margin: '10px 0px'}} text={tx('profile_shared_chats')} />
          <div className='mutual-chats' ref={scrollRef} onScroll={onChatListScroll}>
            {
              chatListIds.map(chatId => <ChatListItem key={chatId} chatListItem={chatItems[chatId]} onClick={onChatClick.bind(null, chatId)} />
              )
            }
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
    </DeltaDialogBase>
  )
}
