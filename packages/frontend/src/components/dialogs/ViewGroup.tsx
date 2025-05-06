import React, { useCallback, useEffect, useState, useRef } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { QrCodeShowQrInner } from './QrCode'
import { useThemeCssVar } from '../../ThemeManager'
import { ContactList } from '../contact/ContactList'
import { useLogicVirtualChatList, ChatListPart } from '../chat/ChatList'
import {
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import ViewProfile from './ViewProfile'
import { avatarInitial } from '../Avatar'
import { DeltaInput } from '../Login-Styles'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { useSettingsStore } from '../../stores/settings'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useChat from '../../hooks/chat/useChat'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot } from '../../utils/lastUsedPaths'
import ProfileInfoHeader from '../ProfileInfoHeader'
import ImageSelector from '../ImageSelector'
import { modifyGroup } from '../../backend/group'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../contexts/DialogContext'
import ImageCropper from '../ImageCropper'
import { AddMemberDialog } from './AddMember/AddMemberDialog'
import { RovingTabindexProvider } from '../../contexts/RovingTabindex'
import { ChatListItemRowChat } from '../chat/ChatListItemRow'
import { copyToBlobDir } from '../../utils/copyToBlobDir'

export default function ViewGroup(
  props: {
    chat: T.FullChat
  } & DialogProps
) {
  const { chat, onClose } = props
  return (
    <Dialog width={400} onClose={onClose} fixed dataTestid='view-group-dialog'>
      <ViewGroupInner onClose={onClose} chat={chat} />
    </Dialog>
  )
}

export const useGroup = (accountId: number, chat: T.FullChat) => {
  const [group, setGroup] = useState(chat)
  const [groupName, setGroupName] = useState(chat.name)
  const [groupMembers, setGroupMembers] = useState(chat.contactIds)
  const [groupImage, setGroupImage] = useState(chat.profileImage)
  const firstLoad = useRef(true)

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
    } else {
      modifyGroup(accountId, chat.id, groupName, groupImage, groupMembers).then(
        (chat: T.FullChat) => {
          // we have to refresh the local group since the current edited group chat
          // might not be the current selected chat in chatContext
          // (when editGroup was opened via chat list context menu)
          setGroup(chat)
        }
      )
    }
  }, [groupName, groupImage, groupMembers, chat.id, accountId])

  const removeGroupMember = (contactId: number) =>
    setGroupMembers(members => members.filter(mId => mId !== contactId))

  const addGroupMembers = async (newGroupMembers: number[]) => {
    setGroupMembers(members => [...members, ...newGroupMembers])
  }

  const reloadGroupContacts = async () => {
    BackendRemote.rpc
      .getContactsByIds(accountId, group.contactIds)
      .then(contacts => {
        // update contacts in case a contact changed
        // while this dialog is open (e.g. contact got blocked)
        setGroup(group => ({
          ...group,
          contacts: group.contactIds.map(id => contacts[id]),
        }))
      })
  }

  useEffect(() => {
    return onDCEvent(accountId, 'ChatModified', ({ chatId }) => {
      if (chatId === group.id) {
        BackendRemote.rpc.getFullChatById(accountId, group.id).then(setGroup)
      }
    })
  })

  return {
    group,
    groupName,
    setGroupName,
    groupMembers,
    setGroupMembers,
    addGroupMembers,
    removeGroupMember,
    groupImage,
    setGroupImage,
    reloadGroupContacts,
  }
}

function ViewGroupInner(
  props: {
    chat: T.FullChat
  } & DialogProps
) {
  const { chat, onClose } = props
  const isBroadcast = chat.chatType === C.DC_CHAT_TYPE_BROADCAST
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

  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  const chatDisabled = !chat.canSend

  const groupMemberContactListWrapperRef = useRef<HTMLDivElement>(null)
  const groupPastMemberContactListWrapperRef = useRef<HTMLDivElement>(null)
  const relatedChatsListWrapperRef = useRef<HTMLDivElement>(null)

  const {
    group,
    groupName,
    setGroupName,
    groupMembers,
    addGroupMembers,
    removeGroupMember,
    groupImage,
    setGroupImage,
    reloadGroupContacts,
  } = useGroup(accountId, chat)

  const [pastContacts, setPastContacts] = useState<T.Contact[]>([])

  useEffect(() => {
    BackendRemote.rpc
      .getContactsByIds(accountId, group.pastContactIds)
      .then(pastContacts => {
        setPastContacts(group.pastContactIds.map(id => pastContacts[id]))
      })
  }, [accountId, group.pastContactIds])

  useEffect(() => {
    return onDCEvent(accountId, 'ContactsChanged', () => {
      reloadGroupContacts()
      BackendRemote.rpc
        .getContactsByIds(accountId, group.pastContactIds)
        .then(pastContacts => {
          setPastContacts(group.pastContactIds.map(id => pastContacts[id]))
        })
    })
  }, [accountId, group, reloadGroupContacts])

  const showRemoveGroupMemberConfirmationDialog = useCallback(
    async (contact: T.Contact) => {
      const confirmed = await openConfirmationDialog({
        message: !isBroadcast
          ? tx('ask_remove_members', contact.displayName)
          : tx('ask_remove_from_broadcast', contact.displayName),
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
      groupImage,
      groupColor: chat.color,
      onOk: (groupName: string, groupImage: string | null) => {
        //(treefit): TODO this check should be way earlier, you should not be able to "OK" the dialog if there is no group name
        if (groupName.length > 1) {
          setGroupName(groupName)
        }

        setGroupImage(groupImage)
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
            dataTestid='view-group-dialog-header'
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
                <div
                  id='view-group-related-chats-title'
                  className='group-separator'
                >
                  {tx('related_chats')}
                </div>
                <div
                  ref={relatedChatsListWrapperRef}
                  className='group-related-chats-list-wrapper'
                >
                  <RovingTabindexProvider
                    wrapperElementRef={relatedChatsListWrapperRef}
                  >
                    <ChatListPart
                      olElementAttrs={{
                        'aria-labelledby': 'view-group-related-chats-title',
                      }}
                      isRowLoaded={isChatLoaded}
                      loadMoreRows={loadChats}
                      rowCount={chatListIds.length}
                      width={'100%'}
                      height={CHATLISTITEM_CHAT_HEIGHT * chatListIds.length}
                      itemKey={index => 'key' + chatListIds[index]}
                      itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                      itemData={{
                        chatCache,
                        chatListIds,
                        onChatClick,

                        selectedChatId: null,
                        activeContextMenuChatId: null,
                        openContextMenu: async () => {},
                      }}
                    >
                      {ChatListItemRowChat}
                    </ChatListPart>
                  </RovingTabindexProvider>
                </div>
              </>
            )}
            <div
              id='view-group-members-recipients-title'
              className='group-separator'
            >
              {!isBroadcast
                ? tx('n_members', groupMembers.length.toString(), {
                    quantity: groupMembers.length,
                  })
                : tx('n_recipients', groupMembers.length.toString(), {
                    quantity: groupMembers.length,
                  })}
            </div>
            <div
              className='group-member-contact-list-wrapper'
              ref={groupMemberContactListWrapperRef}
            >
              <RovingTabindexProvider
                wrapperElementRef={groupMemberContactListWrapperRef}
              >
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
                <ContactList
                  contacts={group.contacts}
                  showRemove={!chatDisabled}
                  onClick={contact => {
                    if (contact.id === C.DC_CONTACT_ID_SELF) {
                      return
                    }
                    setProfileContact(contact)
                  }}
                  onRemoveClick={showRemoveGroupMemberConfirmationDialog}
                  olElementAttrs={{
                    'aria-labelledby': 'view-group-members-recipients-title',
                  }}
                />
              </RovingTabindexProvider>
            </div>
            {pastContacts.length > 0 && (
              <>
                <div
                  id='view-group-past-members-title'
                  className='group-separator'
                >
                  {tx('past_members')}
                </div>
                <div
                  className='group-member-contact-list-wrapper'
                  ref={groupPastMemberContactListWrapperRef}
                >
                  <RovingTabindexProvider
                    wrapperElementRef={groupPastMemberContactListWrapperRef}
                  >
                    <ContactList
                      contacts={pastContacts}
                      showRemove={false}
                      onClick={contact => {
                        if (contact.id === C.DC_CONTACT_ID_SELF) {
                          return
                        }
                        setProfileContact(contact)
                      }}
                      olElementAttrs={{
                        'aria-labelledby': 'view-group-past-members-title',
                      }}
                    />
                  </RovingTabindexProvider>
                </div>
              </>
            )}
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

export function ShowQRDialog({
  qrCode,
  groupName,
  qrCodeSVG,
  onClose,
}: { qrCode: string; groupName: string; qrCodeSVG?: string } & DialogProps) {
  const tx = useTranslationFunction()

  return (
    <Dialog
      onClose={onClose}
      canOutsideClickClose={false}
      fixed
      dataTestid='group-invite-qr'
    >
      <DialogHeader title={tx('qrshow_title')} onClose={onClose} />
      <QrCodeShowQrInner
        qrCode={qrCode}
        qrCodeSVG={qrCodeSVG}
        onClose={onClose}
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
  onOk: (groupName: string, groupImage: string | null) => void
  groupName: string
  groupImage: string | null
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
            : tx('broadcast_list_name')
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
              !isBroadcast ? tx('group_name') : tx('broadcast_list_name')
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
  groupImage: string | null
  setGroupImage: (groupImage: string | null) => void
}) {
  const tx = useTranslationFunction()
  const initials = avatarInitial(props.groupName, '')
  const { openDialog } = useDialog()

  return (
    <ImageSelector
      color={props.groupColor}
      filePath={props.groupImage}
      initials={initials}
      lastUsedSlot={LastUsedSlot.GroupImage}
      onChange={async filepath => {
        if (!filepath) {
          props.setGroupImage(null)
        } else {
          openDialog(ImageCropper, {
            filepath: await copyToBlobDir(filepath),
            shape: 'circle',
            onResult: props.setGroupImage,
            onCancel: () => {},
            desiredWidth: 256,
            desiredHeight: 256,
          })
        }
      }}
      removeLabel={tx('remove_group_image')}
      selectLabel={tx('change_group_image')}
    />
  )
}
