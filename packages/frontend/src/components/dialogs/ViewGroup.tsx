import React, { useCallback, useEffect, useState, useRef } from 'react'
import { C } from '@deltachat/jsonrpc-client'
import type { T } from '@deltachat/jsonrpc-client'

import { QrCodeShowQrInner } from './QrCode'
import { ContactList } from '../contact/ContactList'
import {
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import ViewProfile from './ViewProfile'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { shouldDisableClickForFullscreen as shouldDisableFullscreenAvatar } from '../Avatar'
import { DeltaInput } from '../Login-Styles'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../Dialog'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import useDialog from '../../hooks/dialog/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { LastUsedSlot } from '../../utils/lastUsedPaths'
import ProfileInfoHeader from '../ProfileInfoHeader'
import ImageSelector from '../ImageSelector'
import { modifyGroup } from '../../backend/group'

import type { DialogProps } from '../../contexts/DialogContext'
import ImageCropper from '../ImageCropper'
import { AddMemberDialog } from './AddMember/AddMemberDialog'
import { RovingTabindexProvider } from '../../contexts/RovingTabindex'
import { copyToBlobDir } from '../../utils/copyToBlobDir'
import AlertDialog from './AlertDialog'
import { unknownErrorToString } from '../helpers/unknownErrorToString'
import { getLogger } from '@deltachat-desktop/shared/logger'
const log = getLogger('ViewGroup')

/**
 * This dialog is used to for groups of various types:
 * - encrypted groups
 * - non encrypted groups (email groups)
 * - channels if the current account is the sender (chatType == "OutBroadcast")
 *
 * Mailinglists and channels (receiver side) have an own dialog
 * since you don't see other receivers in those chats
 * (see MailingListProfile)
 */
export default function ViewGroup(
  props: {
    chat: Parameters<typeof ViewGroupInner>[0]['chat']
  } & DialogProps
) {
  const { chat, onClose } = props
  return (
    <Dialog width={400} onClose={onClose} fixed dataTestid='view-group-dialog'>
      <ViewGroupInner onClose={onClose} chat={chat} />
    </Dialog>
  )
}

/**
 * manages changes to the group name, image and members
 * and updates the group in the backend
 */
export const useGroup = (accountId: number, chat: T.FullChat) => {
  const [group, setGroup] = useState(chat)
  const [groupName, setGroupName] = useState(chat.name)
  const [groupImage, setGroupImage] = useState(chat.profileImage)
  const firstLoad = useRef(true)
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
    } else {
      modifyGroup(accountId, chat.id, groupName, groupImage)
    }
  }, [groupName, groupImage, chat.id, accountId])

  const addMembers = useCallback(
    async (members: number[]) => {
      if (!members || members.length === 0) {
        return
      }

      try {
        await Promise.all(
          members.map(id =>
            BackendRemote.rpc.addContactToChat(accountId, chat.id, id)
          )
        )
      } catch (error) {
        openDialog(AlertDialog, {
          title: tx('error'),
          message: tx(
            'error_x',
            `Failed to modify group members: ${unknownErrorToString(error)}`
          ),
        })
        return
      }

      log.info(
        `Account ${accountId} added ${members.length} members to group ${chat.id} (${members.join(
          ', '
        )})`
      )
    },
    [tx, openDialog, chat.id, accountId]
  )

  const removeMember = useCallback(
    async (userId: number) => {
      try {
        await BackendRemote.rpc.removeContactFromChat(
          accountId,
          chat.id,
          userId
        )
      } catch (error) {
        openDialog(AlertDialog, {
          title: tx('error'),
          message: tx(
            'error_x',
            `Failed to modify group members: ${unknownErrorToString(error)}`
          ),
        })
        return
      }

      log.info(
        `Account ${accountId} removed member ${userId} from group ${chat.id})`
      )
    },
    [tx, openDialog, chat.id, accountId]
  )

  type GroupContacts = typeof group.contacts
  /**
   * setGroupContacts is only called after changes from "outside" triggered by
   * DCEvent "ContactsChanged" to update the group contacts in local state
   *
   * It takes a "setter" argument to make sure, the update always happens
   * on the latest group state
   */
  const setGroupContacts = useCallback(
    (setter: (oldContacts: GroupContacts) => GroupContacts) => {
      setGroup((group: T.FullChat) => {
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
    groupImage,
    setGroupName,
    addMembers,
    removeMember,
    setGroupImage,
    setGroupContacts,
  }
}

function ViewGroupInner(
  props: {
    chat: T.FullChat & {
      chatType: 'Group' | 'OutBroadcast'
    }
  } & DialogProps
) {
  const { chat, onClose } = props
  const isBroadcast = chat.chatType === 'OutBroadcast'
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const chatDisabled = !chat.canSend

  const groupMemberContactListWrapperRef = useRef<HTMLDivElement>(null)
  const groupPastMemberContactListWrapperRef = useRef<HTMLDivElement>(null)

  const {
    group,
    groupName,
    groupImage,
    setGroupName,
    addMembers,
    removeMember,
    setGroupImage,
    setGroupContacts,
  } = useGroup(accountId, chat)

  const [pastContacts, setPastContacts] = useState<T.Contact[]>([])

  useEffect(() => {
    BackendRemote.rpc
      .getContactsByIds(accountId, group.pastContactIds)
      .then((pastContacts: { [id: number]: T.Contact }) => {
        setPastContacts(
          group.pastContactIds.map((id: number) => pastContacts[id])
        )
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
          .then((contactsToUpdate: { [id: string]: T.Contact }) => {
            // Making sure to only update the contacts
            // that are already present in the lists,
            // because we're doing it in an async way.
            setGroupContacts(groupContacts =>
              groupContacts.map(
                (oldContact: T.Contact) =>
                  contactsToUpdate[oldContact.id] ?? oldContact
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
          : tx('ask_remove_from_channel', contact.displayName),
        confirmLabel: tx('delete'),
        dataTestid: 'remove-group-member-dialog',
      })

      if (confirmed) {
        removeMember(contact.id)
      }
    },
    [isBroadcast, openConfirmationDialog, removeMember, tx]
  )

  const onClickEdit = () => {
    openDialog(EditGroupNameDialog, {
      groupName,
      groupImage,
      groupColor: chat.color,
      onOk: (groupName: string, groupImage: string | null) => {
        // TODO this check should be way earlier, you should not be able to "OK" the dialog if there is no group name
        if (groupName.length > 1) {
          setGroupName(groupName)
        }

        setGroupImage(groupImage)
      },
      isBroadcast,
    })
  }

  const listFlags = C.DC_GCL_ADD_SELF

  // Note that we are not checking `chat.isEncrypted`,
  // unlike in "New E-Mail" dialog.
  // See https://github.com/deltachat/deltachat-desktop/issues/5294
  // > the chat itself picks up "group wording"
  const membersOrRecipients = isBroadcast ? 'recipients' : 'members'

  // We don't allow editing of non encryped groups (email groups)
  // i.e. changing name, avatar or recipients
  // since it cannot be guaranteed that the recipients will adapt
  // these changes (image is not shown at all in MTAs, group name is
  // just the subject and recipients are basically just an email
  // distribution list)
  const allowEdit = !chatDisabled && group.isEncrypted

  const showAddMemberDialog = () => {
    openDialog(AddMemberDialog, {
      listFlags,
      groupMembers: group.contactIds,
      onOk: addMembers,
      titleMembersOrRecipients: membersOrRecipients,
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

  return (
    <>
      {!profileContact && (
        <>
          {allowEdit && (
            <DialogHeader
              title={!isBroadcast ? tx('tab_group') : tx('channel')}
              onClickEdit={onClickEdit}
              onClose={onClose}
              dataTestid='view-group-dialog-header'
            />
          )}
          {!allowEdit && (
            <DialogHeader
              title={tx('tab_group')}
              onClose={onClose}
              dataTestid='view-group-dialog-header'
            />
          )}
          <DialogBody>
            <DialogContent paddingBottom>
              <ProfileInfoHeader
                avatarPath={groupImage ? groupImage : undefined}
                color={chat.color}
                displayName={groupName}
                disableFullscreen={shouldDisableFullscreenAvatar(chat)}
              />
              <div className='group-profile-subtitle'>
                {!isBroadcast
                  ? group.contactIds.length > 1 || group.selfInGroup
                    ? tx('n_members', group.contactIds.length.toString(), {
                        quantity: group.contactIds.length,
                      })
                    : ''
                  : tx('n_recipients', group.contactIds.length.toString(), {
                      quantity: group.contactIds.length,
                    })}
              </div>
            </DialogContent>
            <div
              className='group-member-contact-list-wrapper'
              ref={groupMemberContactListWrapperRef}
              data-testid='group-member-list'
            >
              <RovingTabindexProvider
                wrapperElementRef={groupMemberContactListWrapperRef}
              >
                {!chatDisabled && group.isEncrypted && (
                  <>
                    {!isBroadcast && (
                      <PseudoListItemAddMember
                        onClick={() => showAddMemberDialog()}
                        labelMembersOrRecipients={membersOrRecipients}
                      />
                    )}
                    <PseudoListItemShowQrCode onClick={() => showQRDialog()} />
                  </>
                )}
                <ContactList
                  contacts={group.contacts}
                  showRemove={!chatDisabled && group.isEncrypted}
                  onClick={contact => {
                    if (contact.id === C.DC_CONTACT_ID_SELF) {
                      return
                    }
                    setProfileContact(contact)
                  }}
                  onRemoveClick={showRemoveGroupMemberConfirmationDialog}
                  olElementAttrs={{
                    'aria-labelledby': 'group-profile-subtitle',
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
      canOutsideClickClose={true}
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

  const haveUnsavedChanges =
    groupName !== initialGroupName || groupImage !== initialGroupImage

  return (
    <Dialog onClose={onClose} canOutsideClickClose={!haveUnsavedChanges} fixed>
      <DialogHeader
        title={
          !isBroadcast ? tx('menu_group_name_and_image') : tx('channel_name')
        }
      />
      <DialogBody>
        <DialogContent>
          <div
            className='profile-image-username center'
            style={{ marginBottom: '30px' }}
          >
            <GroupImageSelector
              groupName={groupName}
              groupColor={groupColor}
              groupImage={groupImage}
              setGroupImage={setGroupImage}
            />
          </div>
          <DeltaInput
            key='groupname'
            id='groupname'
            placeholder={!isBroadcast ? tx('group_name') : tx('channel_name')}
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
                : tx('please_enter_channel_name')}
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
