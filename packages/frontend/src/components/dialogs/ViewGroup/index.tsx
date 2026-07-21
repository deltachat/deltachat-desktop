import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useEffectEvent,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'
import type { T } from '@deltachat/jsonrpc-client'

import { QrCodeShowQrInner } from '../QrCode'
import { ContactList } from '../../contact/ContactList'
import {
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../../helpers/PseudoListItem'
import ViewProfile from '../ViewProfile'
import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { shouldDisableClickForFullscreen as shouldDisableFullscreenAvatar } from '../../Avatar'
import { DeltaInput, DeltaTextarea } from '../../Login-Styles'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  OkCancelFooterAction,
} from '../../Dialog'
import HeaderButton from '../../Dialog/HeaderButton'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { LastUsedSlot } from '../../../utils/lastUsedPaths'
import ProfileInfoHeader from '../../ProfileInfoHeader'
import ImageSelector from '../../ImageSelector'

import type { DialogProps } from '../../../contexts/DialogContext'
import ImageCropper from '../../ImageCropper'
import { AddMemberDialog } from '../AddMember/AddMemberDialog'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'
import { copyToBlobDir } from '../../../utils/copyToBlobDir'
import AlertDialog from '../AlertDialog'
import GroupSearchInput from './GroupSearchInput'
import useViewGroupMenu from './ViewGroupMenu'
import { matchesLetterShortcut } from '../../../keybindings'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { unknownErrorToString } from '@deltachat-desktop/shared/unknownErrorToString'
import { getLogger } from '@deltachat-desktop/shared/logger'
import styles from './styles.module.scss'
import { useFetch, useRpcFetch } from '../../../hooks/useFetch'
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
    chat: Parameters<typeof ViewGroupInner>[0]['initialGroupState']
  } & DialogProps
) {
  const { chat: initialGroupState, onClose } = props

  // While the member filter is open we pin the dialog to its maximum height so
  // it doesn't resize as the filtered member list changes length.
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <Dialog
      width={400}
      height={searchOpen ? 'calc(100% - 50px)' : undefined}
      className={styles.topAlignedDialog}
      onClose={onClose}
      fixed
      dataTestid='view-group-dialog'
    >
      <ViewGroupInner
        onClose={onClose}
        initialGroupState={initialGroupState}
        onSearchOpenChange={setSearchOpen}
      />
    </Dialog>
  )
}

/**
 * manages changes to the group name, image and members
 * and updates the group in the backend
 *
 * @param initialGroupState Expected not to be getting updated by the caller
 * as the group changes on the backend.
 */
const useGroup = (accountId: number, initialGroupState: T.FullChat) => {
  const firstLoad = useRef(true)
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  const groupFetch = useFetch(
    useCallback(
      async (...args: Parameters<typeof BackendRemote.rpc.getFullChatById>) => {
        if (firstLoad.current) {
          firstLoad.current = false
          /**
           * Just use {@linkcode initialGroupState} instead,
           * no need to re-fetch.
           */
          return { type: 'useInitial' } as const
        }
        return {
          type: 'refetched',
          group: await BackendRemote.rpc.getFullChatById(...args),
        } as const
      },
      []
    ),
    [accountId, initialGroupState.id]
  )
  const group: T.FullChat =
    // TODO don't ignore errors and loading state.
    !groupFetch.lingeringResult?.ok ||
    groupFetch.lingeringResult.value.type === 'useInitial'
      ? initialGroupState
      : groupFetch.lingeringResult.value.group

  const groupDescriptionFetch = useRpcFetch(
    BackendRemote.rpc.getChatDescription,
    [accountId, initialGroupState.id]
  )
  // TODO don't ignore errors and loading state.
  const groupDescription = groupDescriptionFetch.lingeringResult?.ok
    ? groupDescriptionFetch.lingeringResult.value
    : null

  const addMembers = useCallback(
    async (members: number[]) => {
      if (!members || members.length === 0) {
        return
      }

      try {
        await Promise.all(
          members.map(id =>
            BackendRemote.rpc.addContactToChat(
              accountId,
              initialGroupState.id,
              id
            )
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
        `Account ${accountId} added ${members.length} members to group ${initialGroupState.id} (${members.join(
          ', '
        )})`
      )
    },
    [tx, openDialog, initialGroupState.id, accountId]
  )

  const removeMember = useCallback(
    async (userId: number) => {
      try {
        await BackendRemote.rpc.removeContactFromChat(
          accountId,
          initialGroupState.id,
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
        `Account ${accountId} removed member ${userId} from group ${initialGroupState.id})`
      )
    },
    [tx, openDialog, initialGroupState.id, accountId]
  )

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

  const [groupContacts, setGroupContacts] = useState<T.Contact[]>([])

  useEffect(() => {
    BackendRemote.rpc
      .getContactsByIds(accountId, group.contactIds)
      .then((groupContacts: { [id: number]: T.Contact }) => {
        setGroupContacts(
          group.contactIds.map((id: number) => groupContacts[id])
        )
      })
  }, [accountId, group.contactIds])

  useEffect(() => {
    return onDCEvent(
      accountId,
      'ContactsChanged',
      ({ contactId: changedContactId }) => {
        // update contacts in case a contact changed
        // while this dialog is open (e.g. contact got blocked)
        //
        // Loading the initial `pastContacts`
        // and `groupContacts` is taken care of in different places.

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
  }, [accountId, group])

  const groupFetchRefresh = useEffectEvent(groupFetch.refresh)
  const groupDescriptionFetchRefresh = useEffectEvent(
    groupDescriptionFetch.refresh
  )
  useEffect(() => {
    return onDCEvent(accountId, 'ChatModified', ({ chatId }) => {
      if (chatId === group.id) {
        groupFetchRefresh()
        groupDescriptionFetchRefresh()
      }
    })
  }, [accountId, group.id])

  return {
    group,
    groupDescription,
    groupContacts,
    addMembers,
    removeMember,
    pastContacts,
  }
}

function ViewGroupInner(
  props: {
    initialGroupState: T.FullChat & {
      chatType: 'Group' | 'OutBroadcast'
    }
    /** Notifies the parent when the member filter is shown/hidden, so it can
     * adjust the dialog height. */
    onSearchOpenChange: (open: boolean) => void
  } & DialogProps
) {
  const { initialGroupState, onClose, onSearchOpenChange } = props
  const isBroadcast = initialGroupState.chatType === 'OutBroadcast'
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const chatDisabled = !initialGroupState.canSend

  const groupMemberContactListWrapperRef = useRef<HTMLDivElement>(null)
  const groupPastMemberContactListWrapperRef = useRef<HTMLDivElement>(null)

  const [memberFilter, setMemberFilter] = useState('')

  const {
    group,
    groupDescription,
    groupContacts,
    pastContacts,
    addMembers,
    removeMember,
  } = useGroup(accountId, initialGroupState)

  const [showMemberFilter, setShowMemberFilter] = useState(false)

  useEffect(() => {
    onSearchOpenChange(showMemberFilter)
  }, [showMemberFilter, onSearchOpenChange])

  // Open the member filter with Ctrl+F (Cmd+F on macOS)
  // The global keybinding handler is disabled while a dialog is open
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      // copied from `keybindings.ts`
      const { isMac } = runtime.getRuntimeInfo()
      const modifierPressed = isMac ? ev.metaKey && !ev.ctrlKey : ev.ctrlKey
      if (
        ev.repeat ||
        ev.isComposing ||
        ev.shiftKey ||
        !modifierPressed ||
        !matchesLetterShortcut(ev, 'f')
      ) {
        return
      }

      // to be specific, only react when this
      // dialog is the topmost modal dialog
      const dialogEl =
        groupMemberContactListWrapperRef.current?.closest('dialog')
      const modals = document.querySelectorAll('dialog:modal')
      if (!dialogEl || modals[modals.length - 1] !== dialogEl) {
        return
      }

      ev.preventDefault()
      setShowMemberFilter(true)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

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
    if (groupDescription === null) {
      // just in case the group description is not yet loaded
      // (it defaults to an empty string)
      return
    }
    openDialog(EditGroupNameDialog, {
      groupName: group.name,
      groupDescription,
      groupImage: group.profileImage,
      groupColor: initialGroupState.color,
      onOk: async (
        groupName: string,
        groupDescription: string,
        groupImage: string | null
      ) => {
        const chatId = initialGroupState.id
        const chat = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)

        await BackendRemote.rpc.setChatName(accountId, chatId, groupName)
        await BackendRemote.rpc.setChatDescription(
          accountId,
          chatId,
          groupDescription
        )

        if (chat.profileImage !== groupImage) {
          await BackendRemote.rpc.setChatProfileImage(
            accountId,
            chatId,
            groupImage || null
          )
        }
      },
      isBroadcast,
    })
  }

  const listFlags = C.DC_GCL_ADD_SELF

  // We don't allow editing of non encrypted groups (email groups)
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
    })
  }

  const showQRDialog = async () => {
    const [qrCode, svg] = await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(
      accountId,
      initialGroupState.id
    )

    openDialog(ShowQRDialog, {
      qrCode,
      qrCodeSVG: svg,
      groupName: group.name,
    })
  }

  const showViewContactDialog = useCallback(
    (contact: T.Contact) => {
      openDialog(ViewProfile, {
        contact,
        // On "Send Message" click and such.
        onAction: onClose,
      })
    },
    [onClose, openDialog]
  )

  const onClickViewGroupMenu = useViewGroupMenu({
    chat: initialGroupState,
    allowEdit,
    isBroadcast,
    onClickEdit,
    showMemberFilter,
    onShowMemberFilter: () => setShowMemberFilter(true),
  })

  const filterContacts = useCallback(
    (contacts: T.Contact[]) => {
      if (!showMemberFilter || memberFilter === '') {
        return contacts
      }
      const needle = memberFilter.toLowerCase()
      return contacts.filter(
        contact =>
          contact.displayName.toLowerCase().includes(needle) ||
          contact.address.toLowerCase().includes(needle)
      )
    },
    [showMemberFilter, memberFilter]
  )

  return (
    <>
      <DialogHeader
        title={!isBroadcast ? tx('tab_group') : tx('channel')}
        onClose={onClose}
        dataTestid='view-group-dialog-header'
      >
        <HeaderButton
          id='view-group-menu'
          data-testid='view-group-menu'
          onClick={onClickViewGroupMenu}
          icon='more_vert'
          iconSize={24}
          aria-label={tx('menu_more_options')}
        />
      </DialogHeader>
      <DialogBody>
        <DialogContent>
          <ProfileInfoHeader
            avatarPath={group.profileImage ? group.profileImage : undefined}
            color={initialGroupState.color}
            displayName={group.name}
            disableFullscreen={shouldDisableFullscreenAvatar(initialGroupState)}
            subtitle={
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
            }
            description={groupDescription ?? undefined}
          />
        </DialogContent>
        {showMemberFilter && (
          <div className='group-member-filter'>
            <GroupSearchInput
              id='group-member-filter'
              onChange={setMemberFilter}
              value={memberFilter}
              onCollapse={() => {
                setShowMemberFilter(false)
                setMemberFilter('')
              }}
            />
          </div>
        )}
        {filterContacts(groupContacts).length === 0 && memberFilter !== '' && (
          <div className='group-member-filter-no-result'>
            {tx('search_no_result_for_x', memberFilter)}
          </div>
        )}
        <div
          className='group-member-contact-list-wrapper'
          ref={groupMemberContactListWrapperRef}
          data-testid='group-member-list'
        >
          <RovingTabindexProvider
            wrapperElementRef={groupMemberContactListWrapperRef}
          >
            {!chatDisabled && group.isEncrypted && memberFilter === '' && (
              <>
                {!isBroadcast && (
                  <PseudoListItemAddMember
                    onClick={() => showAddMemberDialog()}
                  />
                )}
                <PseudoListItemShowQrCode onClick={() => showQRDialog()} />
              </>
            )}
            {group.contactIds.length != 0 && groupContacts.length == 0 && (
              <div /* placeholder to keep layout from jumping around while contact info is loaded */
                style={{
                  height:
                    group.contactIds.length *
                    64 /* 64px is the height of a contact list item */,
                }}
                aria-busy
              ></div>
            )}
            <ContactList
              contacts={filterContacts(groupContacts)}
              showRemove={!chatDisabled && group.isEncrypted}
              onClick={contact => {
                if (contact.id === C.DC_CONTACT_ID_SELF) {
                  return
                }
                showViewContactDialog(contact)
              }}
              onRemoveClick={showRemoveGroupMemberConfirmationDialog}
              olElementAttrs={{
                'aria-labelledby': 'group-profile-subtitle',
              }}
            />
          </RovingTabindexProvider>
        </div>
        {group.pastContactIds.length != 0 && pastContacts.length == 0 && (
          <div /* placeholder to keep layout from jumping around while contact info is loaded */
            style={{
              height:
                group.pastContactIds.length *
                64 /* 64px is the height of a contact list item */,
            }}
            aria-busy
          ></div>
        )}
        {filterContacts(pastContacts).length > 0 && (
          <>
            <div id='view-group-past-members-title' className='group-separator'>
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
                  contacts={filterContacts(pastContacts)}
                  showRemove={false}
                  onClick={contact => {
                    if (contact.id === C.DC_CONTACT_ID_SELF) {
                      return
                    }
                    showViewContactDialog(contact)
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
  )
}

function ShowQRDialog({
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

function EditGroupNameDialog({
  onClose,
  onOk,
  isBroadcast,
  groupName: initialGroupName,
  groupDescription: initialGroupDescription,
  groupColor,
  groupImage: initialGroupImage,
}: {
  onOk: (
    groupName: string,
    groupDescription: string,
    groupImage: string | null
  ) => void
  groupName: string
  groupDescription: string
  groupImage: string | null
  groupColor: string
  isBroadcast?: boolean
} & DialogProps) {
  const [groupName, setGroupName] = useState(initialGroupName)
  const groupNameIsInvalid = groupName === ''
  const [groupDescription, setGroupDescription] = useState(
    initialGroupDescription
  )
  const [groupImage, setGroupImage] = useState(initialGroupImage)
  const tx = useTranslationFunction()

  const onClickCancel = () => {
    onClose()
  }

  const onClickOk = () => {
    if (groupNameIsInvalid) {
      return
    }
    onClose()
    onOk(groupName, groupDescription, groupImage)
  }

  const haveUnsavedChanges =
    groupName !== initialGroupName ||
    groupDescription !== initialGroupDescription ||
    groupImage !== initialGroupImage

  return (
    <Dialog onClose={onClose} canOutsideClickClose={!haveUnsavedChanges} fixed>
      <DialogHeader title={!isBroadcast ? tx('tab_group') : tx('channel')} />
      <form action={onClickOk}>
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
            {groupNameIsInvalid && (
              <p
                style={{
                  color: 'var(--colorDanger)',
                  marginLeft: '80px',
                  position: 'relative',
                  top: '-10px',
                  marginBottom: '-18px',
                }}
              >
                {tx('please_enter_chat_name')}
              </p>
            )}
            <DeltaTextarea
              id='description'
              placeholder={tx('chat_description')}
              value={groupDescription}
              onChange={(
                event: React.FormEvent<HTMLElement> &
                  React.ChangeEvent<HTMLTextAreaElement>
              ) => {
                setGroupDescription(event.target.value)
              }}
            />
          </DialogContent>
        </DialogBody>
        <OkCancelFooterAction onCancel={onClickCancel} onOk='submit' />
      </form>
    </Dialog>
  )
}

function GroupImageSelector(props: {
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
            desiredWidth: 512,
            desiredHeight: 512,
          })
        }
      }}
      removeLabel={tx('remove_group_image')}
      selectLabel={tx('change_group_image')}
    />
  )
}
