import React, {
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'
import { C } from '@deltachat/jsonrpc-client'

import { ContactList, useLazyLoadedContacts } from '../../contact/ContactList'
import {
  PseudoListItem,
  PseudoListItemAddMember,
  PseudoListItemAddContact,
  PseudoListItemAddContactOrGroupFromInviteLink,
} from '../../helpers/PseudoListItem'
import GroupImage from '../../GroupImage'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { QRAvatar } from '../../Avatar'
import { AddMemberDialog } from '../AddMember/AddMemberDialog'
import { ContactListItem } from '../../contact/ContactListItem'
import { useSettingsStore } from '../../../stores/settings'
import { BackendRemote, Type } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'
import useChat from '../../../hooks/chat/useChat'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'
import useCreateChatByContactId from '../../../hooks/chat/useCreateChatByContactId'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import { dirname } from 'path'
import QrCode from '../QrCode'
import { areAllContactsVerified } from '../../../backend/chat'
import AlertDialog from '../AlertDialog'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.scss'
import { makeContextMenu } from '../../ContextMenu'
import { ContextMenuContext } from '../../../contexts/ContextMenuContext'
import ImageCropper from '../../ImageCropper'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'
import ViewProfile from '../ViewProfile'
import { isInviteLink } from '@deltachat-desktop/shared/util'
import { copyToBlobDir } from '../../../utils/copyToBlobDir'
import { useRpcFetch } from '../../../hooks/useFetch'
import { I18nContext } from '../../../contexts/I18nContext'
import { SCAN_CONTEXT_TYPE } from '../../../hooks/useProcessQr'

const enum GroupType {
  /**
   * Regular group, chat.
   * @see {@link BackendRemote.rpc.createGroupChat}.
   */
  REGULAR_GROUP = 'regular_group',
  /**
   * A.k.a. "unencrypted" group.
   * @see {@link T.FullChat['isEncrypted']}
   * and {@link BackendRemote.rpc.createGroupChatUnencrypted}.
   */
  PLAIN_EMAIL = 'plain_email',
  /**
   * @see {@link BackendRemote.rpc.createBroadcast}.
   */
  BROADCAST_LIST = 'broadcast_list',
}

type ViewMode = 'main_' | GroupType

export default function CreateChat(props: DialogProps) {
  const { onClose } = props
  const tx = useTranslationFunction()

  const [viewMode, setViewMode] = useState<ViewMode>('main_')

  return (
    <Dialog width={400} onClose={onClose} fixed dataTestid='create-chat-dialog'>
      {viewMode == 'main_' && <CreateChatMain {...{ setViewMode, onClose }} />}
      {viewMode == GroupType.REGULAR_GROUP && (
        <>
          <DialogHeader title={tx('menu_new_group')} />
          <CreateGroup
            {...{
              groupType: GroupType.REGULAR_GROUP,
              setViewMode,
              onClose,
            }}
          />
        </>
      )}
      {viewMode == GroupType.PLAIN_EMAIL && (
        <>
          <DialogHeader title={tx('new_email')} />
          <CreateGroup
            {...{ groupType: GroupType.PLAIN_EMAIL, setViewMode, onClose }}
          />
        </>
      )}
      {viewMode == GroupType.BROADCAST_LIST && (
        <CreateBroadcastList {...{ setViewMode, onClose }} />
      )}
    </Dialog>
  )
}

export function CloneChat(props: { chatTemplateId: number } & DialogProps) {
  const { chatTemplateId, onClose } = props
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const chatFetch = useRpcFetch(BackendRemote.rpc.getFullChatById, [
    accountId,
    chatTemplateId,
  ])
  const chat = chatFetch.result?.ok ? chatFetch.result.value : null

  return (
    <Dialog width={400} onClose={onClose} fixed>
      {chat && (
        <>
          <DialogHeader title={tx('clone_chat')} />
          <CreateGroup
            {...{
              // See https://github.com/deltachat/deltachat-desktop/issues/5059.
              groupType: chat.isEncrypted
                ? GroupType.REGULAR_GROUP
                : GroupType.PLAIN_EMAIL,

              setViewMode: onClose,
              onClose,
              groupMembers: chat.contactIds,
              groupImage: chat.profileImage,
            }}
          />
        </>
      )}
    </Dialog>
  )
}

type CreateChatMainProps = {
  setViewMode: (newViewMode: ViewMode) => void
  onClose: DialogProps['onClose']
}

function CreateChatMain(props: CreateChatMainProps) {
  const { setViewMode, onClose } = props
  const { tx, writingDirection } = useContext(I18nContext)
  const openConfirmationDialog = useConfirmationDialog()
  const accountId = selectedAccountId()
  const { openDialog } = useDialog()
  const createChatByContactId = useCreateChatByContactId()

  const [queryStr, setQueryStr] = useState('')
  const {
    contactIds,
    contactCache,
    isContactLoaded,
    loadContacts,
    queryStrIsValidEmail,
    refreshContacts,
  } = useLazyLoadedContacts(C.DC_GCL_ADD_SELF, queryStr)

  const chooseContact = async ({ id }: Type.Contact) => {
    try {
      await createChatByContactId(accountId, id)
    } catch (error: any) {
      const errorMessage = unknownErrorToString(error)
      openDialog(AlertDialog, {
        message: tx('error_x', errorMessage),
      })
    }
    onClose()
  }
  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'

  const showAddGroup = queryStr.length === 0
  const showAddBroadcastList =
    queryStr.length === 0 &&
    (settingsStore?.desktopSettings.enableBroadcastLists ?? false)
  const showAddContactQRScan = queryStr.length === 0

  // Chatmail accounts can't send unencrypted emails. See
  // - https://github.com/deltachat/deltachat-desktop/issues/5294#issuecomment-3089552788
  // - https://github.com/deltachat/deltachat-ios/blob/a0043be425d9c14f4039561957adb82ef1ab2adb/deltachat-ios/Controller/NewChatViewController.swift#L76-L78

  const showNewEmail = !isChatmail && queryStr.length === 0

  const showAddContact = !(
    isChatmail ||
    queryStr === '' ||
    (contactIds.length === 1 &&
      contactCache[contactIds[0]]?.address.toLowerCase() ===
        queryStr.trim().toLowerCase())
  )
  const showPseudoListItemAddContactFromInviteLink =
    queryStr && isInviteLink(queryStr)
  const contactsAndExtraItems = useMemo(
    () => [
      ...(showPseudoListItemAddContactFromInviteLink
        ? [CreateChatExtraItemType.INVITE_LINK]
        : []),
      ...(showAddContactQRScan
        ? [CreateChatExtraItemType.ADD_CONTACT_QR_SCAN]
        : []),
      ...(showAddGroup ? [CreateChatExtraItemType.ADD_GROUP] : []),
      ...(showAddBroadcastList
        ? [CreateChatExtraItemType.ADD_BROADCAST_LIST]
        : []),
      ...(showNewEmail ? [CreateChatExtraItemType.NEW_EMAIL] : []),
      ...contactIds,
      ...(showAddContact ? [CreateChatExtraItemType.ADD_CONTACT] : []),
    ],
    [
      contactIds,
      showAddBroadcastList,
      showAddContact,
      showAddContactQRScan,
      showAddGroup,
      showNewEmail,
      showPseudoListItemAddContactFromInviteLink,
    ]
  )

  const openQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    openDialog(QrCode, {
      qrCode,
      qrCodeSVG,
      selectScan: true,
      scanContext: SCAN_CONTEXT_TYPE.DEFAULT,
    })
    onClose()
  }

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail) return

    try {
      const contactId = await BackendRemote.rpc.createContact(
        accountId,
        queryStr.trim(),
        null
      )
      await createChatByContactId(accountId, contactId)
      onClose()
    } catch (error: any) {
      const errorMessage = unknownErrorToString(error)
      openDialog(AlertDialog, {
        message: tx('error_x', errorMessage),
      })
    }
  }

  const { openContextMenu } = useContext(ContextMenuContext)
  const onContactContextMenu = useCallback(
    async (contact: Type.Contact, ev: MouseEvent) => {
      makeContextMenu(
        [
          {
            label: tx('menu_view_profile'),
            action: () => {
              openDialog(ViewProfile, { contact })
            },
          },
          {
            label: tx('delete_contact'),
            action: async () => {
              const confirmed = await openConfirmationDialog({
                message: tx('ask_delete_contact', contact.address),
                confirmLabel: tx('delete'),
              })

              if (confirmed) {
                BackendRemote.rpc
                  .deleteContact(accountId, contact.id)
                  .then(refreshContacts)
              }
            },
          },
        ],
        openContextMenu
      )(ev)
    },
    [
      accountId,
      openDialog,
      openConfirmationDialog,
      refreshContacts,
      tx,
      openContextMenu,
    ]
  )

  const infiniteLoaderRef = useRef<InfiniteLoader | null>(null)
  // By default InfiniteLoader assumes that each item's index in the list
  // never changes. But in our case they do change because of filtering.
  // This code ensures that the currently displayed items get loaded
  // even if the scroll position didn't change.
  // Relevant issues:
  // - https://github.com/deltachat/deltachat-desktop/issues/3921
  // - https://github.com/deltachat/deltachat-desktop/issues/3208
  useEffect(() => {
    infiniteLoaderRef.current?.resetloadMoreItemsCache(true)
    // We could specify `useEffect`'s dependencies (the major one being
    // `contactsAndExtraItems`) for some performance, but let's play it safe.
  })

  const fixedSizeListOuterRef = useRef<HTMLElement>(null)

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.code === 'ArrowDown') {
      ;(
        fixedSizeListOuterRef.current?.querySelector('button') as HTMLElement
      )?.focus()
      // prevent scrolling down the list
      ev.preventDefault()
    }
  }

  return (
    <>
      <DialogHeader onClose={onClose}>
        <input
          data-no-drag-region
          className='search-input'
          onChange={e => setQueryStr(e.target.value)}
          value={queryStr}
          placeholder={tx('search')}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
        />
      </DialogHeader>
      <DialogBody className={styles.createChatDialogBody}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <InfiniteLoader
              ref={infiniteLoaderRef}
              itemCount={contactsAndExtraItems.length}
              loadMoreItems={(startInd, stopInd) => {
                // The indices are shifted due to the existence of extra items.
                return loadContacts(
                  contactIds.indexOf(contactsAndExtraItems[startInd]),
                  contactIds.indexOf(contactsAndExtraItems[stopInd])
                )
              }}
              isItemLoaded={index => {
                const isExtraItem = contactsAndExtraItems[index] < -100
                if (isExtraItem) {
                  return true
                }
                // Again, the indices are shifted
                // due to the existence of extra items.
                const indInContactIds = contactIds.indexOf(
                  contactsAndExtraItems[index]
                )
                return isContactLoaded(indInContactIds)
              }}
              // minimumBatchSize={100}
            >
              {({ onItemsRendered, ref }) => (
                <RovingTabindexProvider
                  wrapperElementRef={fixedSizeListOuterRef}
                >
                  {/* Not using 'react-window' results in ~5 second rendering time
                  if the user has 5000 contacts.
                  (see https://github.com/deltachat/deltachat-desktop/issues/1830) */}
                  <FixedSizeList
                    innerElementType={'ol'}
                    className='react-window-list-reset'
                    itemCount={contactsAndExtraItems.length}
                    itemData={{
                      contactsAndExtraItems,
                      contactCache,
                      onContactClick: chooseContact,
                      addContactOnClick,
                      onContactContextMenu,
                      setViewMode,
                      openQRScan,
                      queryStrIsValidEmail,
                      queryStr,
                      onClose,
                    }}
                    itemKey={index => contactsAndExtraItems[index]}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    outerRef={fixedSizeListOuterRef}
                    height={height}
                    width='100%'
                    direction={writingDirection}
                    // TODO fix: The size of each item is determined
                    // by `--local-avatar-size` and `--local-avatar-vertical-margin`,
                    // which might be different, e.g. currently they're smaller for
                    // "Rocket Theme", which results in gaps between the elements.
                    itemSize={64}
                  >
                    {/* Remember that the renderer function
                    must not be defined _inline_.
                    Otherwise when the component re-renders,
                    item elements get replaces with fresh ones,
                    and we lose focus.
                    See https://github.com/bvaughn/react-window/issues/420#issuecomment-585813335 */}
                    {CreateChatMainRow}
                  </FixedSizeList>
                </RovingTabindexProvider>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </DialogBody>
    </>
  )
}
function CreateChatMainRow({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    contactsAndExtraItems: (CreateChatExtraItemType | T.Contact['id'])[]
    contactCache: ReturnType<typeof useLazyLoadedContacts>['contactCache']
    onContactClick: (contact: Type.Contact) => void
    addContactOnClick: () => void
    onContactContextMenu: (contact: Type.Contact, ev: MouseEvent) => void
    setViewMode: (viewMode: ViewMode) => void
    openQRScan: () => Promise<void>
    queryStrIsValidEmail: boolean
    queryStr: string
    onClose: () => void
  }
}) {
  const {
    contactsAndExtraItems,
    contactCache,
    onContactClick,
    addContactOnClick,
    onContactContextMenu,
    setViewMode,
    openQRScan,
    queryStrIsValidEmail,
    queryStr,
    onClose,
  } = data
  const item = contactsAndExtraItems[index]

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const el = (() => {
    switch (item) {
      case CreateChatExtraItemType.ADD_GROUP: {
        return (
          <PseudoListItem
            id='newgroup'
            cutoff='+'
            text={tx('menu_new_group')}
            onClick={() => setViewMode(GroupType.REGULAR_GROUP)}
          />
        )
      }
      case CreateChatExtraItemType.ADD_BROADCAST_LIST: {
        return (
          <PseudoListItem
            id='newbroadcastlist'
            cutoff='+'
            text={tx('new_channel')}
            onClick={() => setViewMode(GroupType.BROADCAST_LIST)}
          />
        )
      }
      case CreateChatExtraItemType.NEW_EMAIL: {
        return (
          <PseudoListItem
            id='newemail'
            cutoff='+'
            text={tx('new_email')}
            onClick={() => setViewMode(GroupType.PLAIN_EMAIL)}
          />
        )
      }
      case CreateChatExtraItemType.ADD_CONTACT_QR_SCAN: {
        return (
          <PseudoListItem
            id='showqrcode'
            text={tx('menu_new_contact')}
            onClick={openQRScan}
          >
            <QRAvatar />
          </PseudoListItem>
        )
      }
      case CreateChatExtraItemType.ADD_CONTACT: {
        return (
          <PseudoListItemAddContact
            queryStr={queryStr.trim()}
            queryStrIsEmail={queryStrIsValidEmail}
            onClick={addContactOnClick}
          />
        )
      }
      case CreateChatExtraItemType.INVITE_LINK: {
        return (
          <PseudoListItemAddContactOrGroupFromInviteLink
            inviteLink={queryStr!}
            accountId={accountId}
            callback={onClose}
          />
        )
      }
      default: {
        const contact: Type.Contact | undefined = contactCache[item]
        if (!contact) {
          // It's not loaded yet
          return null
        }
        return (
          <ContactListItem
            tagName='div'
            contact={contact}
            onClick={onContactClick}
            onContextMenu={
              contact.id !== C.DC_CONTACT_ID_SELF
                ? ev => onContactContextMenu(contact, ev)
                : undefined
            }
            showCheckbox={false}
            checked={false}
            showRemove={false}
          />
        )
      }
    }
  })()

  return <li style={style}>{el}</li>
}
const enum CreateChatExtraItemType {
  // Negative number so that we can differentiate these from
  // contact IDs, which (I assume) are always non-negative.
  ADD_CONTACT_QR_SCAN = -999,
  ADD_GROUP,
  ADD_BROADCAST_LIST,
  NEW_EMAIL,
  ADD_CONTACT,
  INVITE_LINK,
}

type CreateGroupProps = {
  setViewMode: (newViewMode: ViewMode) => void
  // `GroupType.BROADCAST_LIST` type is handled
  // in the `CreateBroadcastList` component.
  groupType: GroupType.REGULAR_GROUP | GroupType.PLAIN_EMAIL
  onClose: DialogProps['onClose']
  groupMembers?: number[]
} & (
  | {
      groupType: GroupType.REGULAR_GROUP
      groupImage?: string | null
    }
  | {
      groupType: GroupType.PLAIN_EMAIL
    }
)

export function CreateGroup(props: CreateGroupProps) {
  const { selectChat } = useChat()
  const { openDialog } = useDialog()
  const { setViewMode, onClose, groupType } = props
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const [groupName, setGroupName] = useState('')
  const useGroupImageRet = useGroupImage(
    groupType === GroupType.REGULAR_GROUP ? props.groupImage || null : null
  )
  const [groupImage, onSetGroupImage, onUnsetGroupImage] =
    groupType === GroupType.REGULAR_GROUP
      ? useGroupImageRet
      : [null, undefined, undefined]

  const [groupMembers, removeGroupMember, addGroupMember] = useGroupMembers(
    props.groupMembers || [C.DC_CONTACT_ID_SELF]
  )
  const finishCreateGroup = useCreateGroup(
    groupType,
    groupName,
    groupImage,
    groupMembers
  )

  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)

  const groupMemberContactListWrapperRef = useRef<HTMLDivElement>(null)

  const groupContactsFetch = useRpcFetch(BackendRemote.rpc.getContactsByIds, [
    accountId,
    groupMembers,
  ])
  // Using `lingeringResult` in order to not be jumpy when removing members.
  const groupContactsResult = groupContactsFetch.lingeringResult
  const groupContacts = useMemo(
    () =>
      groupContactsResult?.ok
        ? groupMembers
            .map(id => groupContactsResult.value[id] ?? null)
            // In case the new contacts have not loaded yet.
            .filter(c => c != null)
        : [],
    [groupContactsResult, groupMembers]
  )

  let membersOrRecipients: 'members' | 'recipients'
  switch (groupType) {
    case GroupType.REGULAR_GROUP:
      membersOrRecipients = 'members'
      break
    case GroupType.PLAIN_EMAIL:
      membersOrRecipients = 'recipients'
      break
    default: {
      const _assert: never = groupType
      membersOrRecipients = 'members'
      break
    }
  }

  const showAddMemberDialog = () => {
    openDialog(AddMemberDialog, {
      // Same as in
      // https://github.com/deltachat/deltachat-ios/blob/a0043be425d9c14f4039561957adb82ef1ab2adb/deltachat-ios/Controller/AddGroupMembersViewController.swift#L46
      listFlags:
        C.DC_GCL_ADD_SELF |
        (groupType === GroupType.PLAIN_EMAIL ? C.DC_GCL_ADDRESS : 0),

      groupMembers,
      onOk: (members: number[]) => {
        members.forEach(contactId => addGroupMember({ id: contactId }))
      },
      titleMembersOrRecipients: membersOrRecipients,
    })
  }

  const submitForm = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (groupName === '') {
      setErrorMissingGroupName(true)
      return
    }
    finishCreateGroup()
      .then(groupId => {
        if (groupId) {
          selectChat(accountId, groupId)
        } else {
          // TODO: handle error
        }
      })
      .finally(onClose)
  }

  return (
    <form onSubmit={submitForm}>
      <DialogBody>
        <DialogContent>
          <ChatSettingsSetNameAndProfileImage
            groupImage={groupImage}
            onSetGroupImage={onSetGroupImage}
            onUnsetGroupImage={onUnsetGroupImage}
            chatName={groupName}
            setChatName={setGroupName}
            errorMissingChatName={errorMissingGroupName}
            setErrorMissingChatName={setErrorMissingGroupName}
            groupType={groupType}
          />
        </DialogContent>
        <div id='create-group-members-title' className='group-separator'>
          {tx(
            membersOrRecipients === 'members' ? 'n_members' : 'n_recipients',
            groupMembers.length.toString(),
            {
              quantity: groupMembers.length,
            }
          )}
        </div>
        <div
          className='group-member-contact-list-wrapper'
          ref={groupMemberContactListWrapperRef}
        >
          <RovingTabindexProvider
            wrapperElementRef={groupMemberContactListWrapperRef}
          >
            <PseudoListItemAddMember
              onClick={showAddMemberDialog}
              labelMembersOrRecipients={membersOrRecipients}
            />
            <ContactList
              contacts={groupContacts}
              showRemove
              onRemoveClick={c => {
                removeGroupMember(c)
              }}
              olElementAttrs={{
                'aria-labelledby': 'create-group-members-title',
              }}
            />
          </RovingTabindexProvider>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='spaceBetween'>
          <FooterActionButton onClick={() => setViewMode('main_')}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            type='submit'
            data-testid='group-create-button'
            styling='primary'
          >
            {groupType === GroupType.PLAIN_EMAIL
              ? tx('perm_continue')
              : tx('group_create_button')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </form>
  )
}

type CreateBroadcastListProps = {
  setViewMode: (newViewMode: ViewMode) => void
  onClose: DialogProps['onClose']
}

function CreateBroadcastList(props: CreateBroadcastListProps) {
  const { setViewMode, onClose } = props
  const tx = useTranslationFunction()

  const [broadcastName, setBroadcastName] = useState<string>('')
  const finishCreateBroadcast = useCreateBroadcast(broadcastName, onClose)

  const [errorMissingChatName, setErrorMissingChatName] =
    useState<boolean>(false)

  const submitForm = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (broadcastName === '') {
      setErrorMissingChatName(true)
      return
    }
    finishCreateBroadcast()
  }

  return (
    <>
      <DialogHeader title={tx('new_channel')} />
      <form onSubmit={submitForm}>
        <DialogBody>
          <DialogContent>
            <div className='broadcast-list-hint'>
              <p>{tx('chat_new_channel_hint')}</p>
            </div>
            <br />
            <ChatSettingsSetNameAndProfileImage
              chatName={broadcastName}
              setChatName={setBroadcastName}
              errorMissingChatName={errorMissingChatName}
              setErrorMissingChatName={setErrorMissingChatName}
              groupType={GroupType.BROADCAST_LIST}
            />
          </DialogContent>
        </DialogBody>
        <DialogFooter>
          <FooterActions align='spaceBetween'>
            <FooterActionButton onClick={() => setViewMode('main_')}>
              {tx('cancel')}
            </FooterActionButton>
            <FooterActionButton type='submit' styling='primary'>
              {tx('create')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </form>
    </>
  )
}

export const ChatSettingsSetNameAndProfileImage = ({
  groupImage,
  onSetGroupImage,
  onUnsetGroupImage,
  chatName,
  setChatName,
  errorMissingChatName,
  setErrorMissingChatName,
  color,
  groupType,
}: {
  groupImage?: string | null
  onSetGroupImage?: () => void
  onUnsetGroupImage?: () => void
  chatName: string
  setChatName: (newGroupName: string) => void
  errorMissingChatName: boolean
  setErrorMissingChatName: React.Dispatch<React.SetStateAction<boolean>>
  color?: string
  groupType: GroupType
}) => {
  const tx = useTranslationFunction()
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.value.length > 0) setErrorMissingChatName(false)
    setChatName(target.value)
  }
  if (
    groupType === GroupType.REGULAR_GROUP &&
    !(onSetGroupImage && onUnsetGroupImage)
  ) {
    throw new Error(
      'if type is group, onSetGroupImage and onUnsetGroupImage must be present'
    )
  }

  let inputLabel: string
  let missingNameErrorText: string
  switch (groupType) {
    case GroupType.REGULAR_GROUP:
      inputLabel = tx('group_name')
      missingNameErrorText = tx('group_please_enter_group_name')
      break
    case GroupType.PLAIN_EMAIL:
      inputLabel = tx('subject')
      // TODO do we need another string?
      missingNameErrorText = tx('group_please_enter_group_name')
      break
    case GroupType.BROADCAST_LIST:
      inputLabel = tx('name_desktop')
      missingNameErrorText = tx('please_enter_channel_name')
      break
    default: {
      const _assert: never = groupType
      inputLabel = tx('group_name')
      missingNameErrorText = tx('group_please_enter_group_name')
      break
    }
  }

  return (
    <>
      <div className='group-settings-container'>
        {groupType === GroupType.REGULAR_GROUP &&
          onUnsetGroupImage &&
          onSetGroupImage && (
            <GroupImage
              style={{ float: 'left' }}
              groupImage={groupImage}
              onSetGroupImage={onSetGroupImage}
              onUnsetGroupImage={onUnsetGroupImage}
              groupName={chatName}
              color={color}
            />
          )}
        <div className='group-name-input-wrapper'>
          <input
            className='group-name-input'
            data-testid='group-name-input'
            placeholder={inputLabel}
            value={chatName}
            onChange={onChange}
            autoFocus
            spellCheck={false}
          />
          {errorMissingChatName && (
            <p className='input-error'>{missingNameErrorText}</p>
          )}
        </div>
      </div>
    </>
  )
}

function useCreateGroup<
  T extends GroupType.REGULAR_GROUP | GroupType.PLAIN_EMAIL,
>(
  groupType: T,
  groupName: string,
  groupImage: T extends GroupType.REGULAR_GROUP ? string | null : null,
  groupMembers: number[]
) {
  const accountId = selectedAccountId()
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  type ChatId = T.BasicChat['id']
  const createGroup = useCallback(async () => {
    let chatId: ChatId
    switch (groupType) {
      case GroupType.REGULAR_GROUP: {
        const isVerified = await areAllContactsVerified(accountId, groupMembers)
        chatId = await BackendRemote.rpc.createGroupChat(
          accountId,
          groupName,
          isVerified
        )
        break
      }
      case GroupType.PLAIN_EMAIL: {
        chatId = await BackendRemote.rpc.createGroupChatUnencrypted(
          accountId,
          groupName
        )
        break
      }
      default: {
        const _assert: never = groupType
        throw new Error(
          'Failed to create group: ' +
            `don't know how to handle groupType ${groupType}`
        )
      }
    }

    if (groupImage && groupImage !== '') {
      await BackendRemote.rpc.setChatProfileImage(accountId, chatId, groupImage)
    }

    await Promise.all(
      groupMembers.map(contactId => {
        if (contactId === C.DC_CONTACT_ID_SELF) {
          return
        }
        return BackendRemote.rpc.addContactToChat(accountId, chatId, contactId)
      })
    )

    return chatId
  }, [accountId, groupImage, groupMembers, groupName, groupType])

  return async () => {
    if (groupName === '') {
      return
    }

    try {
      return await createGroup()
    } catch (error) {
      const errorMessage = unknownErrorToString(error)
      openDialog(AlertDialog, {
        message: tx('error_x', errorMessage),
      })
      return null
    }
  }
}

const useCreateBroadcast = (
  groupName: string,
  onClose: DialogProps['onClose']
) => {
  const accountId = selectedAccountId()
  const { selectChat } = useChat()

  const createBroadcastList = async () => {
    const chatId = await BackendRemote.rpc.createBroadcast(accountId, groupName)

    await BackendRemote.rpc.setChatName(accountId, chatId, groupName)

    return chatId
  }

  return async () => {
    const chatId = await createBroadcastList()
    onClose()
    selectChat(accountId, chatId)
  }
}

export function useGroupImage(image: string | null) {
  const [groupImage, setGroupImage] = useState(image)
  const { openDialog } = useDialog()
  const tx = window.static_translate

  const onSetGroupImage = async () => {
    const { defaultPath, setLastPath } = await rememberLastUsedPath(
      LastUsedSlot.GroupImage
    )
    const [file] = await runtime.showOpenFileDialog({
      title: tx('select_group_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] }],
      properties: ['openFile'],
      defaultPath,
    })
    if (file) {
      openDialog(ImageCropper, {
        filepath: await copyToBlobDir(file),
        shape: 'circle',
        onResult: (croppedImage => {
          setGroupImage(croppedImage)
          setLastPath(dirname(file))
        }) as (path: string) => void /* typescript is weird and wants this */,
        onCancel: () => {},
        desiredWidth: 256,
        desiredHeight: 256,
      })
    }
  }
  const onUnsetGroupImage = () => setGroupImage('')

  return [groupImage, onSetGroupImage, onUnsetGroupImage] as [
    typeof groupImage,
    typeof onSetGroupImage,
    typeof onUnsetGroupImage,
  ]
}

type ContactWithId = T.Contact | { id: number }

export function useGroupMembers(initialMembers: number[]) {
  const [groupMembers, setGroupMembers] = useState(initialMembers)

  const removeGroupMember = ({ id }: ContactWithId) =>
    id !== C.DC_CONTACT_ID_SELF &&
    setGroupMembers(prevMembers => prevMembers.filter(gId => gId !== id))

  const addGroupMember = ({ id }: ContactWithId) =>
    setGroupMembers(prevMembers => [...prevMembers, id])

  const addRemoveGroupMember = ({ id }: ContactWithId) => {
    groupMembers.includes(id)
      ? removeGroupMember({ id })
      : addGroupMember({ id })
  }

  const addGroupMembers = (ids: number[]) => {
    setGroupMembers(prevMembers => {
      return [...prevMembers, ...ids]
    })
  }

  return [
    groupMembers,
    removeGroupMember,
    addGroupMember,
    addRemoveGroupMember,
    addGroupMembers,
  ] as [
    number[],
    typeof removeGroupMember,
    typeof addGroupMember,
    typeof addRemoveGroupMember,
    typeof addGroupMembers,
  ]
}
