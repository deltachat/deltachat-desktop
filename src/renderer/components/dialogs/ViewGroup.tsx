import { C } from '@deltachat/jsonrpc-client'
import { Card, Classes, Elevation } from '@blueprintjs/core'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
} from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { useContactSearch, AddMemberInnerDialog } from './CreateChat'
import { QrCodeShowQrInner } from './QrCode'
import { selectChat } from '../helpers/ChatMethods'
import { useThemeCssVar } from '../../ThemeManager'
import { ContactList2, useContactsMap } from '../contact/ContactList'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import {
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import { DialogProps } from './DialogController'
import ViewProfile from './ViewProfile'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { useState, useContext, useEffect, useCallback, useMemo } from 'react'
import React from 'react'
import {
  Avatar,
  avatarInitial,
  ClickForFullscreenAvatarWrapper,
} from '../Avatar'
import { runtime } from '../../runtime'
import { DeltaInput } from '../Login-Styles'
import { getLogger } from '../../../shared/logger'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { modifyGroup } from '../helpers/ChatMethods'
import { DcEventType } from '@deltachat/jsonrpc-client'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import { useSettingsStore } from '../../stores/settings'

const log = getLogger('renderer/ViewGroup')

export function useChat(initialChat: Type.FullChat): Type.FullChat {
  const [chat, setChat] = useState(initialChat)

  const accountId = selectedAccountId()
  const updateChat = useCallback(async () => {
    const chat = await BackendRemote.rpc.getFullChatById(
      accountId,
      initialChat.id
    )

    if (!chat) {
      log.error('chat not defined')
      return
    }
    setChat(chat)
  }, [initialChat.id, accountId])

  const onChatModified = useMemo(
    () => async ({ chatId }: DcEventType<'ChatModified'>) => {
      if (chatId !== chat.id) return
      updateChat()
    },
    [chat.id, updateChat]
  )

  useEffect(() => {
    updateChat()
  }, [initialChat, updateChat])
  useEffect(() => {
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ChatModified', onChatModified)
    return () => {
      emitter.on('ChatModified', onChatModified)
    }
  }, [onChatModified, accountId])
  return chat
}

export default function ViewGroup(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  chat: Type.FullChat
  isBroadcast: boolean
}) {
  const { isOpen, onClose, isBroadcast } = props

  const chat = useChat(props.chat)

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
      style={{
        maxHeight: 'unset',
        height: 'calc(100vh - 50px)',
      }}
    >
      <ViewGroupInner onClose={onClose} chat={chat} isBroadcast={isBroadcast} />
    </DeltaDialogBase>
  )
}

export const useGroup = (chat: Type.FullChat) => {
  const [groupName, setGroupName] = useState(chat.name)
  const [groupMembers, setGroupMembers] = useState(
    chat.contacts?.map(({ id }) => id)
  )
  const [groupImage, setGroupImage] = useState(chat.profileImage)

  useEffect(() => {
    ;(async () => {
      modifyGroup(chat.id, groupName, groupImage, groupMembers)
    })()
  }, [groupName, groupImage, groupMembers, chat.id])

  const removeGroupMember = (contactId: number) =>
    setGroupMembers(members => members.filter(mId => mId !== contactId))
  const addGroupMember = (contactId: number) =>
    setGroupMembers(members => [...members, contactId])

  return {
    groupName,
    setGroupName,
    groupMembers,
    setGroupMembers,
    addGroupMember,
    removeGroupMember,
    groupImage,
    setGroupImage,
  }
}

function ViewGroupInner(props: {
  onClose: DialogProps['onClose']
  chat: Type.FullChat
  isBroadcast: boolean
}) {
  const { openDialog } = useContext(ScreenContext)
  const { onClose, chat, isBroadcast } = props
  const tx = useTranslationFunction()
  const [settings] = useSettingsStore()
  const isRelatedChatsEnabled =
    settings?.desktopSettings.EnableRelatedChats || false

  const [chatListIds, setChatListIds] = useState<number[]>([])

  useEffect(() => {
    if (isRelatedChatsEnabled)
      BackendRemote.rpc
        .getSimilarChatIds(selectedAccountId(), chat.id)
        .then(chatIds => setChatListIds(chatIds))
  }, [chat.id, isRelatedChatsEnabled])

  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    null
  )

  const chatDisabled = !chat.canSend

  const {
    groupName,
    setGroupName,
    groupMembers,
    addGroupMember,
    removeGroupMember,
    groupImage,
    setGroupImage,
  } = useGroup(chat)

  const showRemoveGroupMemberConfirmationDialog = (contact: Type.Contact) => {
    openDialog('ConfirmationDialog', {
      message: !isBroadcast
        ? tx('ask_remove_members', contact.nameAndAddr)
        : tx('ask_remove_from_broadcast', contact.nameAndAddr),
      confirmLabel: tx('delete'),
      cb: (yes: boolean) => {
        if (yes) {
          removeGroupMember(contact.id)
        }
      },
    })
  }

  const onClickEdit = () => {
    openDialog(EditGroupNameDialog, {
      groupName,
      groupImage,
      groupColor: chat.color,
      onOk: (groupName: string, groupImage: string) => {
        groupName.length > 1 && setGroupName(groupName)
        setGroupImage(groupImage)
      },
      isBroadcast: isBroadcast,
    })
  }

  const listFlags = chat.isProtected
    ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF
    : C.DC_GCL_ADD_SELF

  const showAddMemberDialog = () => {
    openDialog(AddMemberDialog, {
      listFlags,
      groupMembers,
      onOk: (members: number[]) => {
        members.forEach(addGroupMember)
      },
      isBroadcast: isBroadcast,
    })
  }

  const showQRDialog = async () => {
    const [qrCode, svg] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(
      selectedAccountId(),
      chat.id
    )

    openDialog(ShowQRDialog, {
      qrCode,
      qrCodeSVG: svg,
      groupName,
    })
  }

  const [profileContact, setProfileContact] = useState<Type.Contact | null>(
    null
  )

  const onChatClick = (chatId: number) => {
    selectChat(chatId)
    onClose()
  }

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <>
      {!profileContact && (
        <>
          <DeltaDialogHeader
            title={
              !isBroadcast
                ? tx('menu_edit_group')
                : tx('menu_edit_broadcast_list')
            }
            onClickEdit={onClickEdit}
            showEditButton={!chatDisabled}
            showCloseButton={true}
            onClose={onClose}
          />
          <div className={Classes.DIALOG_BODY}>
            <Card>
              <div className='group-settings-container'>
                <ClickForFullscreenAvatarWrapper filename={groupImage}>
                  <Avatar
                    displayName={groupName}
                    avatarPath={groupImage}
                    color={chat.color}
                    wasSeenRecently={chat.wasSeenRecently}
                    large
                  />
                </ClickForFullscreenAvatarWrapper>
                <p className='group-name' style={{ marginLeft: '17px' }}>
                  {groupName} {chat.isProtected && <InlineVerifiedIcon />}
                </p>
              </div>
              {isRelatedChatsEnabled && (
                <>
                  <div className='group-separator'>
                    {tx('group_related_chats')}
                  </div>
                  <div className='group-related-chats-list-wrapper'>
                    <ChatListPart
                      isRowLoaded={isChatLoaded}
                      loadMoreRows={loadChats}
                      rowCount={chatListIds.length}
                      width={400}
                      height={CHATLISTITEM_CHAT_HEIGHT * chatListIds.length}
                      itemKey={index => 'key' + chatListIds[index]}
                      itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                    >
                      {({ index, style }) => {
                        const chatId = chatListIds[index]
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
                  </div>
                </>
              )}
              <div className='group-separator'>
                {!isBroadcast
                  ? tx(
                      'n_members',
                      groupMembers.length.toString(),
                      groupMembers.length == 1 ? 'one' : 'other'
                    )
                  : tx(
                      'n_recipients',
                      groupMembers.length.toString(),
                      groupMembers.length == 1 ? 'one' : 'other'
                    )}
              </div>
              <div className='group-member-contact-list-wrapper'>
                {!chatDisabled && (
                  <>
                    <PseudoListItemAddMember
                      onClick={() => showAddMemberDialog()}
                      isBroadcast={isBroadcast}
                    />
                    {!isBroadcast && (
                      <PseudoListItemShowQrCode
                        onClick={() => showQRDialog()}
                      />
                    )}
                  </>
                )}
                <ContactList2
                  contacts={chat.contacts}
                  showRemove={!chatDisabled}
                  onClick={contact => {
                    if (contact.id === C.DC_CONTACT_ID_SELF) {
                      return
                    }
                    setProfileContact(contact)
                  }}
                  onRemoveClick={showRemoveGroupMemberConfirmationDialog}
                />
              </div>
            </Card>
          </div>
        </>
      )}
      {profileContact && (
        <ViewProfile
          isOpen
          onBack={() => setProfileContact(null)}
          onClose={onClose}
          contact={profileContact}
        />
      )}
    </>
  )
}

export function AddMemberDialog({
  onClose,
  isOpen,
  listFlags,
  groupMembers,
  onOk,
  isBroadcast,
}: DialogProps) {
  const [searchContacts, updateSearchContacts] = useContactsMap(listFlags, '')
  const [queryStr, onSearchChange] = useContactSearch(updateSearchContacts)
  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        top: '15vh',
        width: '500px',
        maxHeight: '70vh',
      }}
      fixed
    >
      {AddMemberInnerDialog({
        onOk: addMembers => {
          onOk(addMembers)
          onClose()
        },
        onCancel: () => {
          onClose()
        },
        onSearchChange,
        queryStr,
        searchContacts,
        groupMembers,
        isBroadcast: isBroadcast,
      })}
    </DeltaDialogBase>
  )
}

export function ShowQRDialog({
  onClose,
  isOpen,
  qrCode,
  groupName,
  qrCodeSVG,
}: { qrCode: string; groupName: string; qrCodeSVG?: string } & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <DeltaDialogBase
      onClose={onClose}
      isOpen={isOpen}
      canOutsideClickClose={false}
      style={{
        top: '15vh',
        width: '500px',
        maxHeight: '70vh',
      }}
      fixed
    >
      <DeltaDialogHeader title={tx('qrshow_title')} onClose={onClose} />
      <QrCodeShowQrInner
        qrCode={qrCode}
        qrCodeSVG={qrCodeSVG}
        description={tx('qrshow_join_group_hint', [groupName])}
      />
    </DeltaDialogBase>
  )
}

export function EditGroupNameDialog({
  onClose,
  onOk,
  onCancel,
  isOpen,
  isBroadcast,
  groupName: initialGroupName,
  groupColor,
  groupImage: initialGroupImage,
}: DialogProps) {
  const [groupName, setGroupName] = useState(initialGroupName)
  const [groupImage, setGroupImage] = useState(initialGroupImage)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
    onCancel && onCancel()
  }
  const onClickOk = () => {
    onClose()
    onOk(groupName, groupImage)
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
      <DeltaDialogHeader
        title={
          !isBroadcast
            ? tx('menu_group_name_and_image')
            : tx('menu_broadcast_list_name')
        }
      />
      <DeltaDialogBody>
        <Card elevation={Elevation.ONE}>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            {!isBroadcast && (
              <GroupImageSelector
                groupName={groupName}
                groupColor={groupColor}
                groupImage={groupImage}
                setGroupImage={setGroupImage}
              />
            )}
          </div>
          <DeltaInput
            key='groupname'
            id='groupname'
            placeholder={
              !isBroadcast ? tx('group_name') : tx('menu_broadcast_list_name')
            }
            value={groupName}
            onChange={(
              event: React.FormEvent<HTMLElement> &
                React.ChangeEvent<HTMLInputElement>
            ) => {
              setGroupName(event.target.value)
            }}
          />
          {groupName === '' && (
            <p
              style={{
                color: 'var(--colorDanger)',
                marginLeft: '80px',
                position: 'relative',
                top: '-10px',
                marginBottom: '-18px',
              }}
            >
              {!isBroadcast
                ? tx('group_please_enter_group_name')
                : tx('broadcast_please_enter_broadcast_list_name')}
            </p>
          )}
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onClickCancel} onOk={onClickOk} />
    </DeltaDialogBase>
  )
}

export function GroupImageSelector({
  groupName,
  groupColor,
  groupImage,
  setGroupImage,
}: {
  groupName: string
  groupColor: string
  groupImage: string
  setGroupImage: (groupImage: string) => void
}) {
  const tx = window.static_translate

  const onClickSelectGroupImage = async () => {
    const file = await runtime.showOpenFileDialog({
      title: tx('select_your_new_profile_image'),
      filters: [
        {
          name: tx('images'),
          extensions: ['jpg', 'png', 'gif', 'jpeg', 'jpe'],
        },
      ],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('pictures'),
    })
    if (file) setGroupImage(file)
  }

  const onClickRemoveGroupImage = () => setGroupImage('')

  const initial = avatarInitial(groupName, '')

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {groupImage ? (
        <img src={'file://' + groupImage} alt={tx('pref_profile_photo')} />
      ) : (
        <span style={{ backgroundColor: groupColor }}>{initial}</span>
      )}
      <>
        <button
          aria-label={tx('change_group_image')}
          onClick={onClickSelectGroupImage}
          className={'delta-button-round'}
        >
          {tx('change_group_image')}
        </button>
        <button
          aria-label={tx('remove_group_image')}
          onClick={onClickRemoveGroupImage}
          className={'delta-button-round'}
          disabled={groupImage === '' || groupImage === null}
        >
          {tx('remove_group_image')}
        </button>
      </>
    </div>
  )
}
