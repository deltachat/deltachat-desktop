import React, { useState, useEffect, useContext } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogContentTextSeperator,
} from './DeltaDialog'
import { integerToHexColor } from '../../../shared/util'
import ChatListItem from '../chat/ChatListItem'
import { useChatListIds, useLazyChatListItems } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { Button } from '@blueprintjs/core'
import { JsonContact } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext } from '../../contexts'
import { Avatar } from '../Avatar'

const ProfileInfoName = ({ contactId }: { contactId: number }) => {
  const [contact, setContact] = useState<{
    displayName: string
    address: string
  }>({ displayName: '', address: '' })

  const loadContact = async (contactId: number) => {
    setContact(await DeltaBackend.call('contacts.getContact', contactId))
  }

  useEffect(() => {
    loadContact(contactId)
  }, [contactId])

  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newName = ev.target.value
    await DeltaBackend.call('contacts.changeNickname', contactId, newName)
    setContact({ ...contact, displayName: newName })
  }

  return (
    <div className='profile-info-name-container'>
      <div>
        <input
          className='group-name-input'
          placeholder={contact.displayName}
          value={contact.displayName}
          onChange={onChange}
          disabled={contactId === C.DC_CONTACT_ID_SELF}
          autoFocus
          style={{ marginLeft: '0px', marginBottom: '10px' }}
        />
      </div>
      <div className='address'>{contact.address}</div>
    </div>
  )
}

const ProfileInfoAvatar = ContactAvatar

function ContactAvatar({ contact }: { contact: JsonContact }) {
  const { displayName, profileImage } = contact
  const color = Number.isInteger(contact.color)
    ? integerToHexColor(contact.color)
    : ((contact.color as unknown) as string)
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

  const { chatListIds } = useChatListIds(0, '', contact.id)
  // const [ chatItems, onChatListScroll, scrollRef ] = [ {}, () => {}, null ]
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(
    chatListIds
  )

  const tx = window.translate

  const onChatClick = (chatId: number) => {
    selectChat(chatId)
    onClose()
  }
  const onSendMessage = async () => {
    const dmChatId = await DeltaBackend.call('contacts.getDMChatId', contact.id)
    onChatClick(dmChatId)
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
            <ProfileInfoName contactId={contact.id} />
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
    </DeltaDialogBase>
  )
}
