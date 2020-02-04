import React, { useState, useEffect } from 'react'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogFooter, DeltaDialogContent, DeltaDialogContentTextSeperator } from './DeltaDialog'
import { Avatar } from '../contact/Contact'
import { integerToHexColor } from '../../../shared/util'
import styled from 'styled-components'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { callDcMethodAsync } from '../../ipc'
import {
  PseudoListItemAddMember
} from '../helpers/PseudoListItem'
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
  .actions {
    display: flex;
    align-items: center;

    .open-dm-chat {
      font-size: 16px;
      color: #404092;
      border: 1px solid #545eaf;
      padding: 4px;
      border-radius: 4px;
      user-select: none;
      cursor: pointer;
      &:hover {
        color: var(--chatListItemSelectedText);
        background-color: var(--chatListItemSelectedBg);
        font-weight: bold;
      }
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

export function useStateAsync (initial, cb, dependencies) {
  const [value, setValue] = useState(initial)
  useEffectAsync(async () => {
    setValue(await cb())
  }, dependencies)
  return [value, setValue]
}

export default function ViewProfile (props) {
  const { isOpen, onClose, contact } = props

  const { chatListIds } = useChatListIds('', 0, contact.id)
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(chatListIds)

  const [dmChatId, _setDmChatId] = useStateAsync(
    false,
    callDcMethodAsync('contacts.getDMChatId', [contact.id]),
    [contact.id]
  )

  console.log(dmChatId)

  const tx = window.translate

  const onChatClick = chatId => {
    selectChat(chatId)
    onClose()
  }
  const onNewChat = () => onChatClick(dmChatId)

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
            <div className='actions'>
              <div className='open-dm-chat' role='button' onClick={onNewChat}>
                {tx('profile_action_direct_message')}
              </div>
            </div>
          </ProfileInfoContainer>
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')} />
          <div className='mutual-chats' ref={scrollRef} onScroll={onChatListScroll}>
            <PseudoListItemAddMember onClick={onNewChat} />
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
