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
import { JsonContact } from '../../../shared/shared-types'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext } from '../../contexts'
import { Avatar } from '../Avatar'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import AutoSizer from 'react-virtualized-auto-sizer'
import MessageBody from '../message/MessageBody'
import { useThemeCssVar } from '../../ThemeManager'

const ProfileInfoName = ({
  name,
  authName,
  setName,
  address,
  disabled,
}: {
  name: string
  authName: string
  setName: (name: string) => void
  address: string
  disabled: boolean
}) => {
  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newName = ev.target.value
    setName(newName)
  }

  return (
    <div className='profile-info-name-container'>
      <div>
        <input
          className='group-name-input'
          placeholder={authName}
          value={name}
          onChange={onChange}
          disabled={disabled}
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

  const tx = window.static_translate

  const onUpdateContact = async () => {
    await DeltaBackend.call('contacts.changeNickname', contact.id, name)
    onClose()
  }

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader title={tx('menu_view_profile')} />
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <ViewProfileInner contact={contact} onClose={onClose} />
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClose} onOk={onUpdateContact} />
    </DeltaDialogBase>
  )
}

export function ViewProfileInner({
  contact,
  onClose,
}: {
  contact: JsonContact
  onClose: () => void
}) {
  const { openDialog } = useContext(ScreenContext)

  const [name, setName] = useState<string>(contact.name)

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
    const dmChatId = await DeltaBackend.call(
      'contacts.createChatByContactId',
      contact.id
    )
    onChatClick(dmChatId)
  }

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
          <div className='profile-info-container'>
            <div
              onClick={() => {
                openDialog('FullscreenMedia', {
                  msg: {
                    file_mime: 'image/x',
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
              disabled={
                contact.id === C.DC_CONTACT_ID_SELF ||
                contact.id === C.DC_CONTACT_ID_DEVICE
              }
              authName={contact.authName}
              name={name}
              setName={setName}
              address={contact.address}
            />
          </div>
          <div
            style={{
              display: 'flex',
              margin: '20px 0px',
              justifyContent: 'center',
            }}
          >
            {contact.id !== C.DC_CONTACT_ID_DEVICE && (
              <button
                aria-label={tx('send_message')}
                onClick={onSendMessage}
                className={'delta-button-round'}
                style={{ marginTop: '0px' }}
              >
                {tx('send_message')}
              </button>
            )}
          </div>
          {contact.status != '' && (
            <>
              <DeltaDialogContentTextSeperator
                text={tx('pref_default_status_label')}
              />
              <div className='status-text'>
                {MessageBody({ text: contact.status })}
              </div>
            </>
          )}
          <DeltaDialogContentTextSeperator text={tx('profile_shared_chats')} />
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
                itemKey={index => 'key' + chatListIds[index]}
                itemHeight={CHATLISTITEM_CHAT_HEIGHT}
              >
                {({ index, style }) => {
                  const [chatId] = chatListIds[index]
                  return (
                    <div style={style}>
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
    </>
  )
}
