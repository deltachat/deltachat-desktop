import React, { useState, useEffect, useContext } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogContentTextSeperator,
  DeltaDialogFooter,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { Button, Classes } from '@blueprintjs/core'
import { JsonContact } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext } from '../../contexts'
import { Avatar } from '../Avatar'

const ProfileInfoName = ({ contactId, displayName, setDisplayName, address }: { contactId: Number, displayName: string, setDisplayName: (displayName: string) => void, address: string }) => {
  const [contact, setContact] = useState<{
    displayName: string
    address: string
  }>({ displayName: '', address: '' })

  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newName = ev.target.value
    setDisplayName(newName)
  }

  return (
    <div className='profile-info-name-container'>
      <div>
        <input
          className='group-name-input'
          placeholder={displayName}
          value={displayName}
          onChange={onChange}
          disabled={contactId === C.DC_CONTACT_ID_SELF}
          autoFocus
          style={{ marginLeft: '0px', marginBottom: '10px' }}
        />
      </div>
      <div className='address'>{address}</div>
    </div>
  )
}

const ProfileInfoAvatar = ContactAvatar

function ContactAvatar({ contact }: { contact: JsonContact }) {
  const { displayName, profileImage } = contact
  const color = contact.color
  return Avatar({
    avatarPath: profileImage,
    color,
    displayName,
    large: true,
  })
}

export default function ViewProfile(props: {
  isOpen: boolean
  onClose: () => void
  contact: JsonContact
}) {
  const { isOpen, onClose, contact } = props
  const { openDialog } = useContext(ScreenContext)

  const [displayName, setDisplayName] = useState<string>(props.contact.displayName)

  const { chatListIds } = useChatListIds(0, '', contact.id)
  // const [ chatItems, onChatListScroll, scrollRef ] = [ {}, () => {}, null ]
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(
    chatListIds
  )

  const tx = window.static_translate

  const onChatClick = (chatId: number) => {
    selectChat(chatId)
    onClose()
  }
  const onSendMessage = async () => {
    const dmChatId = await DeltaBackend.call('contacts.getDMChatId', contact.id)
    onChatClick(dmChatId)
  }


  const onUpdateContact = async () => {
    await DeltaBackend.call('contacts.changeNickname', contact.id, displayName)
    onClose()
  }

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader title={tx('menu_view_profile')} onClose={onClose} />
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <div className='profile-info-container'>
            <div
              onClick={() => {
                openDialog('FullscreenMedia', {
                  msg: {
                    attachment: {
                      url: contact.profileImage,
                      contentType: 'image/x',
                    },
                    file: contact.profileImage,
                  },
                })
              }}
              style={{ cursor: contact.profileImage ? 'pointer' : 'default' }}
            >
              <ProfileInfoAvatar contact={contact} />
            </div>
            <ProfileInfoName contactId={contact.id} displayName={displayName} setDisplayName={setDisplayName} address={contact.address} />
          </div>
          <Button
            style={{ marginLeft: '100px', marginBottom: '30px' }}
            onClick={onSendMessage}
          >
            {tx('send_message')}
          </Button>
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')} />
          <div
            className='mutual-chats'
            ref={scrollRef}
            onScroll={onChatListScroll}
          >
            {chatListIds.map(chatId => (
              <ChatListItem
                key={chatId}
                chatListItem={chatItems[chatId]}
                onClick={onChatClick.bind(null, chatId)}
              />
            ))}
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClose} onOk={onUpdateContact} />
    </DeltaDialogBase>
  )
}
