import React, { useState, useContext } from 'react'
import moment from 'moment'
import formatRelativeTime from '../conversations/formatRelativeTime'
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
import { DeltaBackend } from '../../delta-remote'
import { JsonContact } from '../../../shared/shared-types'
import { C } from 'deltachat-node/node/dist/constants'
import {
  MessagesDisplayContext,
  ScreenContext,
  useTranslationFunction,
} from '../../contexts'
import { Avatar, ClickForFullscreenAvatarWrapper } from '../Avatar'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import AutoSizer from 'react-virtualized-auto-sizer'
import MessageBody from '../message/MessageBody'
import { useThemeCssVar } from '../../ThemeManager'
import { DialogProps } from './DialogController'
import { Card, Elevation } from '@blueprintjs/core'
import { DeltaInput } from '../Login-Styles'
import { selectChat } from '../helpers/ChatMethods'

const ProfileInfoName = ({
  name,
  address,
  lastSeen,
}: {
  name: string
  address: string
  lastSeen: number
}) => {
  const tx = useTranslationFunction()
  let lastSeenString = ''

  // Dates from 1970 mean that contact has never been seen
  if (lastSeen == 0) {
    lastSeenString = tx('last_seen_unknown')
  } else {
    const date = formatRelativeTime(lastSeen * 1000, { extended: false })
    lastSeenString = tx('last_seen_at', date)
  }

  return (
    <div className='profile-info-name-container'>
      <div>
        <p className='group-name'>{name}</p>
      </div>
      <div className='address'>{address}</div>
      <div className='last-seen'>{lastSeenString}</div>
    </div>
  )
}

function ProfileInfoAvatar({ contact }: { contact: JsonContact }) {
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
  const { isOpen, onClose } = props

  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)
  const [contact, setContact] = useState<JsonContact>(props.contact)
  const isDeviceMessage = contact.id === C.DC_CONTACT_ID_DEVICE

  const onClickEdit = () => {
    openDialog(EditContactNameDialog, {
      contactName: contact.name,
      onOk: async (contactName: string) => {
        await DeltaBackend.call(
          'contacts.changeNickname',
          contact.id,
          contactName
        )
        setContact({ ...contact, name: contactName })
      },
    })
  }

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader
        title={tx('menu_view_profile')}
        onClickEdit={onClickEdit}
        showEditButton={!isDeviceMessage}
        showCloseButton={true}
        onClose={onClose}
      />
      <DeltaDialogBody noFooter>
        <DeltaDialogContent noPadding>
          <ViewProfileInner contact={contact} onClose={onClose} />
        </DeltaDialogContent>
      </DeltaDialogBody>
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
  const { chatListIds } = useChatList(0, '', contact.id)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )
  const isDeviceMessage = contact.id === C.DC_CONTACT_ID_DEVICE

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
            <ClickForFullscreenAvatarWrapper filename={contact.profileImage}>
              <ProfileInfoAvatar contact={contact} />
            </ClickForFullscreenAvatarWrapper>
            <ProfileInfoName
              name={contact.displayName}
              address={
                isDeviceMessage ? tx('device_talk_subtitle') : contact.address
              }
              lastSeen={contact.lastSeen}
            />
          </div>
          <div
            style={{
              display: 'flex',
              margin: '20px 0px',
              justifyContent: 'center',
            }}
          >
            {!isDeviceMessage && (
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
                <MessagesDisplayContext.Provider
                  value={{
                    context: 'contact_profile_status',
                    contact_id: contact.id,
                    closeProfileDialog: onClose,
                  }}
                >
                  <MessageBody text={contact.status} />
                </MessagesDisplayContext.Provider>
              </div>
            </>
          )}
        </div>
        {!isDeviceMessage && (
          <>
            <DeltaDialogContentTextSeperator
              text={tx('profile_shared_chats')}
            />
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
          </>
        )}
      </div>
    </>
  )
}

export function EditContactNameDialog({
  isOpen,
  onClose,
  onOk,
  onCancel,
  contactName: initialGroupName,
}: DialogProps) {
  const [contactName, setContactName] = useState(initialGroupName)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
    onCancel && onCancel()
  }
  const onClickOk = () => {
    onClose()
    onOk(contactName)
  }
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        top: '15vh',
        width: '500px',
        maxHeight: '70vh',
        height: 'auto',
      }}
      fixed
    >
      <DeltaDialogHeader title={tx('menu_edit_name')} />
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
          <DeltaInput
            key='contactname'
            id='contactname'
            placeholder={tx('name_desktop')}
            value={contactName}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setContactName(event.target.value)
            }}
          />
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}
