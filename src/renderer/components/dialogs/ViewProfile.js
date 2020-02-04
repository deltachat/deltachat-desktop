import React, { useState, useEffect } from 'react'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent, DeltaDialogContentTextSeperator } from './DeltaDialog'
import { Avatar } from '../contact/Contact'
import { integerToHexColor } from '../../../shared/util'
import styled from 'styled-components'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { callDcMethodAsync } from '../../ipc'
import { PseudoListItem } from '../helpers/PseudoListItem'
import { C } from 'deltachat-node/constants.enum'
export const ProfileInfoContainer = styled.div`
  margin-left: 10px;
  display: flex;
  width: calc(100% - 20px);
  .profile-info-name-container {
    margin: auto 10px;
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
    displayName
  })
}

export function useEffectAsync(cb, dependencies) {
  useEffect(() => {cb()}, dependencies)
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
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)

  const [dmChatId, _setDmChatId] = useStateAsync(false, callDcMethodAsync('contacts.getChatIdByContactId', [contact.id]))

  console.log(dmChatId, chatItems[dmChatId])
  const tx = window.translate

  const onChatClick = chatId => {
    selectChat(chatId)
    onClose()
  }
  const onNewChat = async () => {
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
      <DeltaDialogBody>
        <DeltaDialogContent noPadding>
          <ProfileInfoContainer>
            <ProfileInfoAvatar contact={contact} />
            <ProfileInfoName name={contact.displayName} address={contact.address} />
          </ProfileInfoContainer>
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')} />
          <div className='mutual-chats' ref={scrollRef} onScroll={onChatListScroll}>
            { dmChatId === 0 && <PseudoListItem id='addmember' cutoff='+' text={tx('menu_new_chat')} onClick={onNewChat} style={{paddingLeft: '10px'}}/>}
            { dmChatId > 0 && <ChatListItem key={dmChatId} chatListItem={chatItems[dmChatId]} onClick={onChatClick.bind(null, dmChatId)} />}
            {chatListIds.map(chatId => {
              if (chatId === dmChatId ) return
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
