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

  type GroupContacts = typeof group.contacts
  /**
   * Why setGroupContacts & setGroupMembers?
   * setGroupMembers triggers a modifiyGroup in the backend and is called after
   * changes triggered by the user while setGroupContacts is only called after
   * changes from "outside" (not on this client) after DCEvent "ContactsChanged"
   * to update the group in local state
   *
   * It takes a "setter" argument to make sure, the update always happens
   * on the latest group state
   */
  const setGroupContacts = useCallback(
    (setter: (oldContacts: GroupContacts) => GroupContacts) => {
      setGroup(group => {
        const newContacts = setter(group.contacts)
        return { ...group, contacts: newContacts }
      })
    },
    []
  )

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
    setGroupContacts,
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
    setGroupContacts,
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
    return onDCEvent(
      accountId,
      'ContactsChanged',
      ({ contactId: changedContactId }) => {
        // update contacts in case a contact changed
        // while this dialog is open (e.g. contact got blocked)
        //
        // Loading the initial `pastContacts`
        // and `group.contacts` is taken care of in different places.

        let contactIdsToReload: Array<T.Contact['id']>
        if (changedContactId == null) {
          contactIdsToReload = [...group.pastContactIds, ...group.contactIds]
        } else {
          if (
            !group.pastContactIds.includes(changedContactId) &&
            !group.contactIds.includes(changedContactId)
          ) {
            // No need to do anything, the contact has nothing to do
            // with this group. For performance.
            return
          }

          contactIdsToReload = [changedContactId]
        }

        BackendRemote.rpc
          .getContactsByIds(accountId, contactIdsToReload)
          .then(contactsToUpdate => {
            // Making sure to only update the contacts
            // that are already present in the lists,
            // because we're doing it in an async way.
            setGroupContacts(groupContacts =>
              groupContacts.map(
                oldContact => contactsToUpdate[oldContact.id] ?? oldContact
              )
            )
            setPastContacts(pastContacts =>
              pastContacts.map(
                oldContact => contactsToUpdate[oldContact.id] ?? oldContact
              )
            )
          })
      }
    )
  }, [accountId, group, setGroupContacts])

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
            {isRelatedChatsEnabled && chatListIds.length > 0 && (
              <>
                <div className='group-separator'>{tx('related_chats')}</div>
                <div
                  ref={relatedChatsListWrapperRef}
                  className='group-related-chats-list-wrapper'
                >
                  <RovingTabindexProvider
                    wrapperElementRef={relatedChatsListWrapperRef}
                  >
                    <ChatListPart
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
            <div className='group-separator'>
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
                />
              </RovingTabindexProvider>
            </div>
            {pastContacts.length > 0 && (
              <>
                <div className='group-separator'>{tx('past_members')}</div>
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
