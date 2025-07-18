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
import { ScreenContext } from '../../../contexts/ScreenContext'
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

type ViewMode = 'main' | 'createGroup' | 'createBroadcastList'

export default function CreateChat(props: DialogProps) {
  const { onClose } = props
  const tx = useTranslationFunction()

  const [viewMode, setViewMode] = useState<ViewMode>('main')

  return (
    <Dialog width={400} onClose={onClose} fixed>
      {viewMode == 'main' && <CreateChatMain {...{ setViewMode, onClose }} />}
      {viewMode == 'createGroup' && (
        <>
          <DialogHeader title={tx('menu_new_group')} />
          <CreateGroup {...{ setViewMode, onClose }} />
        </>
      )}
      {viewMode == 'createBroadcastList' && (
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
  const tx = useTranslationFunction()
  const { userFeedback } = useContext(ScreenContext)
  const openConfirmationDialog = useConfirmationDialog()
  const accountId = selectedAccountId()
  const { openDialog } = useDialog()
  const createChatByContactId = useCreateChatByContactId()

  const [queryStr, setQueryStr] = useState('')
  const {
    contactIds,
    contactCache,
    loadContacts,
    queryStrIsValidEmail,
    refreshContacts,
  } = useLazyLoadedContacts(C.DC_GCL_ADD_SELF, queryStr)

  const chooseContact = async ({ id }: Type.Contact) => {
    try {
      await createChatByContactId(accountId, id)
    } catch (error: any) {
      return userFeedback({
        type: 'error',
        text: error && (error.message || error),
      })
    }
    onClose()
  }
  const settingsStore = useSettingsStore()[0]
  const isChatmail = settingsStore?.settings.is_chatmail === '1'

  const needToRenderAddGroup = queryStr.length === 0
  const needToRenderAddBroadcastList =
    queryStr.length === 0 &&
    (settingsStore?.desktopSettings.enableBroadcastLists ?? false)
  const needToRenderAddContactQRScan = queryStr.length === 0
  const needToRenderAddContact = !(
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
      ...(needToRenderAddContactQRScan
        ? [CreateChatExtraItemType.ADD_CONTACT_QR_SCAN]
        : []),
      ...(needToRenderAddGroup ? [CreateChatExtraItemType.ADD_GROUP] : []),
      ...(needToRenderAddBroadcastList
        ? [CreateChatExtraItemType.ADD_BROADCAST_LIST]
        : []),
      ...contactIds,
      ...(needToRenderAddContact ? [CreateChatExtraItemType.ADD_CONTACT] : []),
    ],
    [
      contactIds,
      needToRenderAddBroadcastList,
      needToRenderAddContact,
      needToRenderAddContactQRScan,
      needToRenderAddGroup,
      showPseudoListItemAddContactFromInviteLink,
    ]
  )

  const openQRScan = async () => {
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    openDialog(QrCode, { qrCode, qrCodeSVG, selectScan: true })
    onClose()
  }

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await BackendRemote.rpc.createContact(
      accountId,
      queryStr.trim(),
      null
    )
    await createChatByContactId(accountId, contactId)
    onClose()
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
      <DialogHeader>
        <input
          data-no-drag-region
          className='search-input'
          onChange={e => setQueryStr(e.target.value)}
          value={queryStr}
          placeholder={
            isChatmail ? tx('search') : tx('contacts_enter_name_or_email')
          }
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
              // perf: consider using `isContactLoaded` from `useLazyLoadedContacts`
              // otherwise sometimes we might load the same contact twice (performance thing)
              // See https://github.com/bvaughn/react-window/issues/765
              isItemLoaded={index => {
                const isExtraItem = contactsAndExtraItems[index] < -100
                if (isExtraItem) {
                  return true
                }
                return contactCache[contactsAndExtraItems[index]] != undefined
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
      <DialogFooter>
        <FooterActions>
          <FooterActionButton styling='primary' onClick={onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
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
            onClick={() => setViewMode('createGroup')}
          />
        )
      }
      case CreateChatExtraItemType.ADD_BROADCAST_LIST: {
        return (
          <PseudoListItem
            id='newbroadcastlist'
            cutoff='+'
            text={tx('new_broadcast_list')}
            onClick={() => setViewMode('createBroadcastList')}
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
  ADD_CONTACT,
  INVITE_LINK,
}

type CreateGroupProps = {
  setViewMode: (newViewMode: ViewMode) => void
  onClose: DialogProps['onClose']
  groupImage?: string | null
  groupMembers?: number[]
}

export function CreateGroup(props: CreateGroupProps) {
  const { selectChat } = useChat()
  const { openDialog } = useDialog()
  const { setViewMode, onClose } = props
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    props.groupImage || null
  )
  const [groupMembers, removeGroupMember, addGroupMember] = useGroupMembers(
    props.groupMembers || [C.DC_CONTACT_ID_SELF]
  )
  const finishCreateGroup = useCreateGroup(groupName, groupImage, groupMembers)

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

  const showAddMemberDialog = () => {
    openDialog(AddMemberDialog, {
      listFlags: C.DC_GCL_ADD_SELF,
      groupMembers,
      onOk: (members: number[]) => {
        members.forEach(contactId => addGroupMember({ id: contactId }))
      },
      isBroadcast: false,
      isVerificationRequired: false,
    })
  }

  return (
    <>
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
            type='group'
          />
        </DialogContent>
        <div id='create-group-members-title' className='group-separator'>
          {tx('n_members', groupMembers.length.toString(), {
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
            <PseudoListItemAddMember
              onClick={showAddMemberDialog}
              isBroadcast={false}
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
          <FooterActionButton onClick={() => setViewMode('main')}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            onClick={() => {
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
            }}
            data-testid='group-create-button'
            styling='primary'
          >
            {tx('group_create_button')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}

type CreateBroadcastListProps = {
  setViewMode: (newViewMode: ViewMode) => void
  onClose: DialogProps['onClose']
}

function CreateBroadcastList(props: CreateBroadcastListProps) {
  const { openDialog } = useDialog()
  const { setViewMode, onClose } = props
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const [broadcastName, setBroadcastName] = useState<string>('')
  const [broadcastRecipients, removeBroadcastRecipient, addBroadcastRecipient] =
    useGroupMembers([])
  const finishCreateBroadcast = useCreateBroadcast(
    broadcastRecipients,
    broadcastName,
    onClose
  )

  const groupMemberContactListWrapperRef = useRef<HTMLDivElement>(null)

  const recipientsFetch = useRpcFetch(BackendRemote.rpc.getContactsByIds, [
    accountId,
    broadcastRecipients,
  ])
  // Using `lingeringResult` in order to not be jumpy when removing recipients.
  const recipientsResult = recipientsFetch.lingeringResult
  const broadcastContacts = useMemo(
    () =>
      recipientsResult?.ok
        ? broadcastRecipients
            .map(id => recipientsResult.value[id] ?? null)
            // In case the new contacts have not loaded yet.
            .filter(c => c != null)
        : [],
    [broadcastRecipients, recipientsResult]
  )

  const [errorMissingChatName, setErrorMissingChatName] =
    useState<boolean>(false)

  const showAddMemberDialog = () => {
    const listFlags = C.DC_GCL_ADD_SELF

    openDialog(AddMemberDialog, {
      listFlags,
      groupMembers: broadcastRecipients,
      onOk: (recipients: number[]) =>
        recipients.forEach(contactId =>
          addBroadcastRecipient({ id: contactId })
        ),
      isBroadcast: true,
    })
  }

  return (
    <>
      <DialogHeader title={tx('new_broadcast_list')} />
      <DialogBody>
        <DialogContent>
          <div className='broadcast-list-hint'>
            <p>{tx('chat_new_broadcast_hint')}</p>
          </div>
          <br />
          <ChatSettingsSetNameAndProfileImage
            chatName={broadcastName}
            setChatName={setBroadcastName}
            errorMissingChatName={errorMissingChatName}
            setErrorMissingChatName={setErrorMissingChatName}
            type='broadcast'
          />
          <br />
          {broadcastRecipients.length > 0 && (
            <div
              id='create-broadcast-list-recipients-title'
              className='group-separator'
            >
              {tx('n_recipients', broadcastRecipients.length.toString(), {
                quantity: broadcastRecipients.length,
              })}
            </div>
          )}
          <div
            className='group-member-contact-list-wrapper'
            ref={groupMemberContactListWrapperRef}
          >
            <RovingTabindexProvider
              wrapperElementRef={groupMemberContactListWrapperRef}
            >
              <PseudoListItemAddMember
                onClick={showAddMemberDialog}
                isBroadcast
              />
              <ContactList
                contacts={broadcastContacts}
                showRemove
                onRemoveClick={c => {
                  removeBroadcastRecipient(c)
                }}
                olElementAttrs={{
                  'aria-labelledby': 'create-broadcast-list-recipients-title',
                }}
              />
            </RovingTabindexProvider>
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => setViewMode('main')}>
            {tx('cancel')}
          </FooterActionButton>
          <FooterActionButton
            onClick={() => {
              if (broadcastName === '') {
                setErrorMissingChatName(true)
                return
              }
              finishCreateBroadcast()
            }}
          >
            {tx('create')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
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
  type,
}: {
  groupImage?: string | null
  onSetGroupImage?: () => void
  onUnsetGroupImage?: () => void
  chatName: string
  setChatName: (newGroupName: string) => void
  errorMissingChatName: boolean
  setErrorMissingChatName: React.Dispatch<React.SetStateAction<boolean>>
  color?: string
  type: 'group' | 'broadcast'
}) => {
  const tx = useTranslationFunction()
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.value.length > 0) setErrorMissingChatName(false)
    setChatName(target.value)
  }
  if (type === 'group' && !(onSetGroupImage && onUnsetGroupImage)) {
    throw new Error(
      'if type is group, onSetGroupImage and onUnsetGroupImage must be present'
    )
  }
  return (
    <>
      <div className='group-settings-container'>
        {type === 'group' && onUnsetGroupImage && onSetGroupImage && (
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
            placeholder={
              type === 'group' ? tx('group_name') : tx('name_desktop')
            }
            value={chatName}
            onChange={onChange}
            autoFocus
            spellCheck={false}
          />
          {errorMissingChatName && (
            <p className='input-error'>
              {type === 'group'
                ? tx('group_please_enter_group_name')
                : tx('please_enter_broadcast_list_name')}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

const useCreateGroup = (
  groupName: string,
  groupImage: string | null | undefined,
  groupMembers: number[]
) => {
  const accountId = selectedAccountId()

  const createGroup = useCallback(async () => {
    const isVerified = await areAllContactsVerified(accountId, groupMembers)

    const chatId = await BackendRemote.rpc.createGroupChat(
      accountId,
      groupName,
      isVerified
    )

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
  }, [accountId, groupImage, groupMembers, groupName])

  return async () => {
    if (groupName === '') {
      return
    }

    return createGroup()
  }
}

const useCreateBroadcast = (
  broadcastRecipients: number[],
  groupName: string,
  onClose: DialogProps['onClose']
) => {
  const accountId = selectedAccountId()
  const { selectChat } = useChat()

  const createBroadcastList = async () => {
    const chatId = await BackendRemote.rpc.createBroadcastList(accountId)

    await Promise.all(
      broadcastRecipients.map(contactId => {
        if (contactId === C.DC_CONTACT_ID_SELF) {
          return
        }
        return BackendRemote.rpc.addContactToChat(accountId, chatId, contactId)
      })
    )

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
