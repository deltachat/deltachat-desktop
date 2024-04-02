import React, { useCallback, useEffect, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import ChatListItem from '../chat/ChatListItem'
import { useContactSearch, AddMemberInnerDialog } from './CreateChat'
import { QrCodeShowQrInner } from './QrCode'
import { useThemeCssVar } from '../../ThemeManager'
import { ContactList, useContactsMap } from '../contact/ContactList'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import {
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import ViewProfile from './ViewProfile'
import { avatarInitial } from '../Avatar'
import { DeltaInput } from '../Login-Styles'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useSettingsStore } from '../../stores/settings'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useChat from '../../hooks/useChat'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot } from '../../utils/lastUsedPaths'
import ProfileInfoHeader from '../ProfileInfoHeader'
import ImageSelector from '../ImageSelector'
import { modifyGroup } from '../../backend/group'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../contexts/DialogContext'

export default function ViewGroup(
  props: {
    chat: T.FullChat
    isBroadcast: boolean
  } & DialogProps
) {
  const { onClose, isBroadcast, chat } = props

  return (
    <Dialog width={400} onClose={onClose} fixed>
      <ViewGroupInner onClose={onClose} chat={chat} isBroadcast={isBroadcast} />
    </Dialog>
  )
}

export const useGroup = (accountId: number, chat: T.FullChat) => {
  const [groupName, setGroupName] = useState(chat.name)
  const [groupMembers, setGroupMembers] = useState(
    chat.contacts?.map(({ id }) => id)
  )
  const [groupImage, setGroupImage] = useState(chat.profileImage)

  useEffect(() => {
    modifyGroup(accountId, chat.id, groupName, groupImage, groupMembers)
  }, [groupName, groupImage, groupMembers, chat.id, accountId])

  const removeGroupMember = (contactId: number) =>
    setGroupMembers(members => members.filter(mId => mId !== contactId))

  const addGroupMembers = async (newGroupMembers: number[]) => {
    setGroupMembers(members => [...members, ...newGroupMembers])
  }

  return {
    groupName,
    setGroupName,
    groupMembers,
    setGroupMembers,
    addGroupMembers,
    removeGroupMember,
    groupImage,
    setGroupImage,
  }
}

function ViewGroupInner(
  props: {
    chat: T.FullChat
    isBroadcast: boolean
  } & DialogProps
) {
  const { onClose, chat, isBroadcast } = props
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()
  const { selectChat } = useChat()
  const [settings] = useSettingsStore()
  const [chatListIds, setChatListIds] = useState<number[]>([])
  const isRelatedChatsEnabled =
    settings?.desktopSettings.enableRelatedChats || false

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
    addGroupMembers,
    removeGroupMember,
    groupImage,
    setGroupImage,
  } = useGroup(accountId, chat)

  const showRemoveGroupMemberConfirmationDialog = useCallback(
    async (contact: T.Contact) => {
      const confirmed = await openConfirmationDialog({
        message: !isBroadcast
          ? tx('ask_remove_members', contact.nameAndAddr)
          : tx('ask_remove_from_broadcast', contact.nameAndAddr),
        confirmLabel: tx('delete'),
      })

      if (confirmed) {
        removeGroupMember(contact.id)
      }
    },
    [isBroadcast, openConfirmationDialog, removeGroupMember, tx]
  )

  const onClickEdit = () => {
    openDialog(EditGroupNameDialog, {
      groupName,
      groupImage: groupImage ? groupImage : undefined,
      groupColor: chat.color,
      onOk: (groupName: string, groupImage?: string) => {
        if (groupName.length > 1) {
          setGroupName(groupName)
        }

        if (groupImage) {
          setGroupImage(groupImage)
        }
      },
      isBroadcast: isBroadcast,
    })
  }

  const listFlags = C.DC_GCL_ADD_SELF

  const showAddMemberDialog = () => {
    openDialog(AddMemberDialog, {
      listFlags,
      groupMembers,
      onOk: addGroupMembers,
      isBroadcast: isBroadcast,
      isVerificationRequired: chat.isProtected,
    })
  }

  const showQRDialog = async () => {
    const [qrCode, svg] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(
      accountId,
      chat.id
    )

    openDialog(ShowQRDialog, {
      qrCode,
      qrCodeSVG: svg,
      groupName,
    })
  }

  const [profileContact, setProfileContact] = useState<T.Contact | null>(null)

  const onChatClick = (chatId: number) => {
    selectChat(accountId, chatId)
    onClose()
  }

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <>
      {!profileContact && (
        <>
          <DialogHeader
            title={!isBroadcast ? tx('tab_group') : tx('broadcast_list')}
            onClickEdit={onClickEdit}
            onClose={onClose}
          />
          <DialogBody>
            <DialogContent paddingBottom>
              <ProfileInfoHeader
                avatarPath={groupImage ? groupImage : undefined}
                color={chat.color}
                displayName={groupName}
                isVerified={chat.isProtected}
              />
            </DialogContent>
            {isRelatedChatsEnabled && (
              <>
                <div className='group-separator'>{tx('related_chats')}</div>
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
                    <PseudoListItemShowQrCode onClick={() => showQRDialog()} />
                  )}
                </>
              )}
              <ContactList
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
          </DialogBody>
        </>
      )}
      {profileContact && (
        <ViewProfile
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
  onOk,
  groupMembers,
  listFlags,
  isBroadcast = false,
  isVerificationRequired = false,
}: {
  onOk: (members: number[]) => void
  groupMembers: number[]
  listFlags: number
  isBroadcast?: boolean
  isVerificationRequired?: boolean
} & DialogProps) {
  const [searchContacts, updateSearchContacts] = useContactsMap(listFlags, '')
  const [queryStr, onSearchChange, _, refreshContacts] =
    useContactSearch(updateSearchContacts)
  return (
    <Dialog canOutsideClickClose={false} fixed onClose={onClose}>
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
        refreshContacts,
        groupMembers,
        isBroadcast,
        isVerificationRequired,
      })}
    </Dialog>
  )
}

export function ShowQRDialog({
  qrCode,
  groupName,
  qrCodeSVG,
  onClose,
}: { qrCode: string; groupName: string; qrCodeSVG?: string } & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose} canOutsideClickClose={false} fixed>
      <DialogHeader title={tx('qrshow_title')} onClose={onClose} />
      <QrCodeShowQrInner
        qrCode={qrCode}
        qrCodeSVG={qrCodeSVG}
        description={tx('qrshow_join_group_hint', [groupName])}
      />
    </Dialog>
  )
}

export function EditGroupNameDialog({
  onClose,
  onOk,
  isBroadcast,
  groupName: initialGroupName,
  groupColor,
  groupImage: initialGroupImage,
}: {
  onOk: (groupName: string, groupImage?: string) => void
  groupName: string
  groupImage?: string
  groupColor: string
  isBroadcast?: boolean
} & DialogProps) {
  const [groupName, setGroupName] = useState(initialGroupName)
  const [groupImage, setGroupImage] = useState(initialGroupImage)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
  }

  const onClickOk = () => {
    onClose()
    onOk(groupName, groupImage)
  }

  return (
    <Dialog onClose={onClose} canOutsideClickClose={false} fixed>
      <DialogHeader
        title={
          !isBroadcast
            ? tx('menu_group_name_and_image')
            : tx('menu_broadcast_list_name')
        }
      />
      <DialogBody>
        <DialogContent>
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
                : tx('please_enter_broadcast_list_name')}
            </p>
          )}
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction onCancel={onClickCancel} onOk={onClickOk} />
    </Dialog>
  )
}

export function GroupImageSelector(props: {
  groupName: string
  groupColor: string
  groupImage?: string
  setGroupImage: (groupImage: string) => void
}) {
  const tx = useTranslationFunction()
  const initials = avatarInitial(props.groupName, '')

  return (
    <ImageSelector
      color={props.groupColor}
      filePath={props.groupImage}
      initials={initials}
      lastUsedSlot={LastUsedSlot.GroupImage}
      onChange={props.setGroupImage}
      removeLabel={tx('remove_group_image')}
      selectLabel={tx('change_group_image')}
    />
  )
}
