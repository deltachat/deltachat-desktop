import React, { useState, useContext } from 'react'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogContentTextSeperator,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { useChatList } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { Button } from '@blueprintjs/core'
import { JsonContact } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext } from '../../contexts'
import { Avatar } from '../Avatar'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import { AutoSizer } from 'react-virtualized'

const ProfileInfoName = ({
  contactId,
  displayName,
  setDisplayName,
  address,
}: {
  contactId: Number
  displayName: string
  setDisplayName: (displayName: string) => void
  address: string
}) => {
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

  const [displayName, setDisplayName] = useState<string>(
    props.contact.displayName
  )

  const { chatListIds } = useChatList(0, '', contact.id)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
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
      <DeltaDialogHeader title={tx('menu_view_profile')} />
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div>
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
                  style={{
                    cursor: contact.profileImage ? 'pointer' : 'default',
                  }}
                >
                  <ProfileInfoAvatar contact={contact} />
                </div>
                <ProfileInfoName
                  contactId={contact.id}
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  address={contact.address}
                />
              </div>
              <Button
                style={{ marginLeft: '100px', marginBottom: '30px' }}
                onClick={onSendMessage}
              >
                {tx('send_message')}
              </Button>
              <DeltaDialogContentTextSeperator
                text={tx('profile_shared_chats')}
              />
            </div>
            <div className='mutual-chats' style={{ flexGrow: 1 }}>
              <AutoSizer>
                {({ width, height }) => (
                  <ChatListPart
                    isRowLoaded={isChatLoaded}
                    loadMoreRows={loadChats}
                    rowCount={chatListIds.length}
                    width={width}
                    height={height}
                  >
                    {({ index, key, style }) => {
                      const [chatId] = chatListIds[index]
                      return (
                        <div style={style} key={key}>
                          <ChatListItem
                            chatListItem={chatCache[chatId] || undefined}
                            onClick={onChatClick.bind(null, chatId)}
                          />
                        </div>
                      )
                    }}
                  </ChatListPart>
                )}
              </AutoSizer>
            </div>
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClose} onOk={onUpdateContact} />
    </DeltaDialogBase>
  )
}
