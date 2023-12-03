import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { T, C } from '@deltachat/jsonrpc-client'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  useContacts,
  ContactList,
  useContactsNew,
} from '../contact/ContactList'
import {
  PseudoListItem,
  PseudoListItemAddMember,
  PseudoListItemAddContact,
} from '../helpers/PseudoListItem'
import GroupImage from '../GroupImage'
import { DialogProps } from './DialogController'
import { runtime } from '../../runtime'
import {
  areAllContactsVerified,
  createChatByContactIdAndSelectIt,
  selectChat,
} from '../helpers/ChatMethods'
import { Avatar } from '../Avatar'
import { AddMemberDialog } from './ViewGroup'
import { ContactListItem } from '../contact/ContactListItem'
import { useSettingsStore } from '../../stores/settings'
import { BackendRemote, onDCEvent, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import ConfirmationDialog from './ConfirmationDialog'
import { VerifiedContactsRequiredDialog } from './ProtectionStatusDialog'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
  OkCancelFooterAction,
} from '../Dialog'

type ViewMode = 'main' | 'createGroup' | 'createBroadcastList'

type CreateChatProps = {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}

export default function CreateChat(props: CreateChatProps) {
  const { isOpen, onClose } = props
  const [viewMode, setViewMode] = useState<ViewMode>('main')

  return (
    <Dialog isOpen={isOpen} onClose={onClose} fixed>
      {viewMode == 'main' && <CreateChatMain {...{ setViewMode, onClose }} />}
      {viewMode == 'createGroup' && (
        <CreateGroup {...{ setViewMode, onClose }} />
      )}
      {viewMode == 'createBroadcastList' && (
        <CreateBroadcastList {...{ setViewMode, onClose }} />
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
  const { userFeedback, openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  const [{ contacts, queryStrIsValidEmail }, updateContacts] = useContactsNew(
    C.DC_GCL_ADD_SELF,
    ''
  )
  const [queryStr, onSearchChange, _, refreshContacts] =
    useContactSearch(updateContacts)

  const chooseContact = async ({ id }: Type.Contact) => {
    try {
      await createChatByContactIdAndSelectIt(id)
    } catch (error: any) {
      return userFeedback({
        type: 'error',
        text: error && (error.message || error),
      })
    }
    onClose()
  }
  const settingsStore = useSettingsStore()[0]

  const renderAddGroupIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <Fragment>
        <PseudoListItem
          id='newgroup'
          cutoff='+'
          text={tx('menu_new_group')}
          onClick={() => setViewMode('createGroup')}
        />
        {settingsStore?.desktopSettings.enableBroadcastLists && (
          <PseudoListItem
            id='newbroadcastlist'
            cutoff='+'
            text={tx('new_broadcast_list')}
            onClick={() => setViewMode('createBroadcastList')}
          />
        )}
      </Fragment>
    )
  }

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await BackendRemote.rpc.createContact(
      selectedAccountId(),
      queryStr.trim(),
      null
    )
    await createChatByContactIdAndSelectIt(contactId)
    onClose()
  }

  const renderAddContactIfNeeded = () => {
    if (
      queryStr === '' ||
      (contacts.length === 1 &&
        contacts[0].address.toLowerCase() === queryStr.trim().toLowerCase())
    ) {
      return null
    }
    return (
      <PseudoListItemAddContact
        queryStr={queryStr.trim()}
        queryStrIsEmail={queryStrIsValidEmail}
        onClick={addContactOnClick}
      />
    )
  }

  const onContactContextMenu = (contact: Type.Contact) => {
    openDialog(ConfirmationDialog, {
      message: tx('ask_delete_contact', contact.address),
      confirmLabel: tx('delete'),
      cb: yes => {
        yes &&
          BackendRemote.rpc
            .deleteContact(accountId, contact.id)
            .then(refreshContacts)
      },
    })
  }

  return (
    <>
      <DialogHeader>
        <input
          className='search-input'
          onChange={onSearchChange}
          value={queryStr}
          placeholder={tx('contacts_enter_name_or_email')}
          autoFocus
          spellCheck={false}
        />
      </DialogHeader>
      <DialogBody>
        <DialogContent>
          <div className='create-chat-contact-list-wrapper'>
            {renderAddGroupIfNeeded()}
            <ContactList
              contacts={contacts}
              onClick={chooseContact}
              onContactContextMenu={onContactContextMenu}
            />
            {renderAddContactIfNeeded()}
          </div>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </>
  )
}

type CreateGroupProps = {
  setViewMode: (newViewMode: ViewMode) => void
  onClose: DialogProps['onClose']
}

function CreateGroup(props: CreateGroupProps) {
  const { openDialog } = useContext(ScreenContext)
  const { setViewMode, onClose } = props
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [groupMembers, removeGroupMember, addGroupMember] = useGroupMembers([
    C.DC_CONTACT_ID_SELF,
  ])
  const finishCreateGroup = useCreateGroup(
    groupName,
    groupImage,
    groupMembers,
    onClose
  )

  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupContacts, setGroupContacts] = useState<Type.Contact[]>([])

  useMemo(() => {
    BackendRemote.rpc
      .getContactsByIds(accountId, groupMembers)
      .then(records => {
        setGroupContacts(Object.entries(records).map(([_, contact]) => contact))
      })
  }, [accountId, groupMembers])

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
      <DialogHeader title={tx('menu_new_group')} />
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
          <div className='group-separator'>
            {tx(
              'n_members',
              groupMembers.length.toString(),
              groupMembers.length <= 1 ? 'one' : 'other'
            )}
          </div>
          <div className='group-member-contact-list-wrapper'>
            <PseudoListItemAddMember
              onClick={showAddMemberDialog}
              isBroadcast={false}
            />
            <ContactList
              contacts={groupContacts}
              onClick={() => {}}
              showRemove
              onRemoveClick={c => {
                removeGroupMember(c)
              }}
            />
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
              if (groupName === '') {
                setErrorMissingGroupName(true)
                return
              }
              finishCreateGroup()
            }}
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
  const { openDialog } = useContext(ScreenContext)
  const { setViewMode, onClose } = props
  const tx = useTranslationFunction()

  const [broadcastName, setBroadcastName] = useState<string>('')
  const [broadcastRecipients, removeBroadcastRecipient, addBroadcastRecipient] =
    useGroupMembers([])
  const finishCreateBroadcast = useCreateBroadcast(
    broadcastRecipients,
    broadcastName,
    onClose
  )

  const searchContacts = useContacts(C.DC_GCL_ADD_SELF, '')[0]
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
            <p
              style={{
                marginTop: '3px',
                color: 'var(--colorDanger)',
                fontWeight: 'bold',
              }}
            >
              ⚠️ {tx('broadcast_list_warning')}
            </p>
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
            <div className='group-separator'>
              {tx(
                'n_recipients',
                broadcastRecipients.length.toString(),
                broadcastRecipients.length == 1 ? 'one' : 'other'
              )}
            </div>
          )}
          <div className='group-member-contact-list-wrapper'>
            <PseudoListItemAddMember
              onClick={showAddMemberDialog}
              isBroadcast
            />
            <ContactList
              contacts={searchContacts.filter(
                ({ id }) => broadcastRecipients.indexOf(id) !== -1
              )}
              onClick={() => {}}
              showRemove
              onRemoveClick={c => {
                removeBroadcastRecipient(c)
              }}
            />
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

export function AddMemberInnerDialog({
  onCancel,
  onOk,
  onSearchChange,
  queryStr,
  searchContacts,
  refreshContacts,
  groupMembers,
  isBroadcast = false,
  isVerificationRequired = false,
}: {
  onOk: (addMembers: number[]) => void
  onCancel: Parameters<typeof OkCancelFooterAction>[0]['onCancel']
  onSearchChange: ReturnType<typeof useContactSearch>[1]
  queryStr: string
  searchContacts: Map<number, Type.Contact>
  refreshContacts: () => void
  groupMembers: number[]
  isBroadcast: boolean
  isVerificationRequired: boolean
}) {
  const tx = window.static_translate
  const { openDialog } = useContext(ScreenContext)
  const accountId = selectedAccountId()

  const contactIdsInGroup: number[] = [...searchContacts]
    .filter(([contactId, _contact]) => groupMembers.indexOf(contactId) !== -1)
    .map(([contactId, _contact]) => contactId)

  const [contactIdsToAdd, setContactIdsToAdd] = useState<Type.Contact[]>([])
  const [{ queryStrIsValidEmail }, updateContacts] = useContactsNew(
    C.DC_GCL_ADD_SELF,
    ''
  )
  const [_, onSearchChangeNewContact] = useContactSearch(updateContacts)

  const onSearchChangeValidation = (query: ChangeEvent<HTMLInputElement>) => {
    if (searchContacts.size === 0) {
      onSearchChangeNewContact(query)
    }
    onSearchChange(query)
  }

  useEffect(
    () =>
      onDCEvent(accountId, 'ContactsChanged', () => {
        refreshContacts()
      }),
    [accountId, refreshContacts]
  )

  const [contactsToDeleteOnCancel, setContactsToDeleteOnCancel] = useState<
    number[]
  >([])

  const addMember = useCallback(
    (contact: Type.Contact) => {
      if (isVerificationRequired && !contact.isVerified) {
        openDialog(VerifiedContactsRequiredDialog)
        return
      }

      setContactIdsToAdd([...contactIdsToAdd, contact])
    },
    [contactIdsToAdd, isVerificationRequired, openDialog]
  )

  const removeMember = useCallback(
    (contact: Type.Contact) => {
      setContactIdsToAdd(contactIdsToAdd.filter(c => c.id !== contact.id))
    },
    [contactIdsToAdd]
  )

  const toggleMember = useCallback(
    (contact: Type.Contact) => {
      if (!contactIdsToAdd.find(c => c.id === contact.id)) {
        addMember(contact)
      } else {
        removeMember(contact)
      }
    },
    [addMember, contactIdsToAdd, removeMember]
  )

  const createNewContact = useCallback(async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await BackendRemote.rpc.createContact(
      accountId,
      queryStr.trim(),
      null
    )
    const contact = await BackendRemote.rpc.getContact(accountId, contactId)
    toggleMember(contact)
    setContactsToDeleteOnCancel(value => [...value, contactId])
    onSearchChange({
      target: { value: '' },
    } as ChangeEvent<HTMLInputElement>)
  }, [accountId, toggleMember, onSearchChange, queryStr, queryStrIsValidEmail])

  const _onOk = () => {
    if (contactIdsToAdd.length === 0) {
      return
    }

    onOk(contactIdsToAdd.map(member => member.id))
  }

  const _onCancel = async () => {
    for (const contactId of contactsToDeleteOnCancel) {
      await BackendRemote.rpc.deleteContact(selectedAccountId(), contactId)
    }
    onCancel()
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const contactListRef = useRef<HTMLDivElement>(null)
  const applyCSSHacks = () => {
    setTimeout(() => inputRef.current?.focus(), 0)

    const offsetHeight = //@ts-ignore
      document.querySelector('.AddMemberChipsWrapper')?.offsetHeight
    if (!offsetHeight) return
    contactListRef.current?.style.setProperty(
      'max-height',
      `calc(100% - ${offsetHeight}px)`
    )
  }

  useLayoutEffect(applyCSSHacks, [inputRef, contactIdsToAdd])
  useEffect(applyCSSHacks, [])

  const renderAddContactIfNeeded = () => {
    if (queryStr === '' || searchContacts.size !== 0) {
      return null
    }
    if (queryStrIsValidEmail) {
      const pseudoContact: Type.Contact = {
        address: queryStr,
        color: 'lightgrey',
        authName: '',
        status: '',
        displayName: queryStr,
        id: -1,
        lastSeen: -1,
        name: queryStr,
        profileImage: '',
        nameAndAddr: '',
        isBlocked: false,
        isVerified: false,
        verifierId: null,
        wasSeenRecently: false,
        isProfileVerified: false,
      }
      return (
        <ContactListItem
          contact={pseudoContact}
          showCheckbox={true}
          checked={false}
          showRemove={false}
          onCheckboxClick={createNewContact}
        />
      )
    } else {
      return (
        <PseudoListItemAddContact
          queryStr={queryStr}
          queryStrIsEmail={false}
          onClick={() => {}}
        />
      )
    }
  }

  const addContactOnKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key == 'Enter') {
      ;(
        document.querySelector<HTMLDivElement>(
          '.delta-checkbox'
        ) as HTMLDivElement
      ).click()
    }
  }

  return (
    <>
      <DialogHeader
        title={!isBroadcast ? tx('group_add_members') : tx('add_recipients')}
      />
      <DialogBody>
        <DialogContent>
          <div className='AddMemberChipsWrapper'>
            <div className='AddMemberChips'>
              {contactIdsToAdd.map(contact => {
                return AddMemberChip({
                  contact,
                  onRemoveClick: toggleMember,
                })
              })}
              <input
                ref={inputRef}
                className='search-input group-member-search'
                onChange={onSearchChangeValidation}
                onKeyDown={event => {
                  addContactOnKeyDown(event)
                }}
                value={queryStr}
                placeholder={tx('search')}
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
          <div
            className='group-member-contact-list-wrapper'
            ref={contactListRef}
          >
            <ContactList
              contacts={Array.from(searchContacts.values())}
              onClick={() => {}}
              showCheckbox
              isChecked={contact => {
                return (
                  contactIdsToAdd.findIndex(c => c.id === contact.id) !== -1 ||
                  contactIdsInGroup.indexOf(contact.id) !== -1
                )
              }}
              disabledContacts={contactIdsInGroup.concat(C.DC_CONTACT_ID_SELF)}
              onCheckboxClick={toggleMember}
            />
            {renderAddContactIfNeeded()}
          </div>
        </DialogContent>
      </DialogBody>
      <OkCancelFooterAction
        onCancel={_onCancel}
        onOk={_onOk}
        disableOK={contactIdsToAdd.length === 0 ? true : false}
      />
    </>
  )
}

const AddMemberChip = (props: {
  contact: Type.Contact
  onRemoveClick: (contact: Type.Contact) => void
}) => {
  const { contact, onRemoveClick } = props
  return (
    <div
      key={contact.id}
      className='AddMemberChip'
      onClick={() => onRemoveClick(contact)}
    >
      <div className='Avatar'>
        <Avatar
          displayName={contact.displayName}
          avatarPath={contact.profileImage}
          color={contact.color}
        />
      </div>
      <div className='DisplayName'>
        {contact.displayName} {contact.isVerified && <InlineVerifiedIcon />}
      </div>
    </div>
  )
}

const useCreateGroup = (
  groupName: string,
  groupImage: string | null | undefined,
  groupMembers: number[],
  onClose: DialogProps['onClose']
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

    for (const contactId of groupMembers) {
      if (contactId !== C.DC_CONTACT_ID_SELF) {
        await BackendRemote.rpc.addContactToChat(accountId, chatId, contactId)
      }
    }

    return chatId
  }, [accountId, groupImage, groupMembers, groupName])

  return async () => {
    if (groupName === '') {
      return
    }

    const chatId = await createGroup()
    onClose()
    selectChat(chatId)
  }
}

const useCreateBroadcast = (
  broadcastRecipients: number[],
  groupName: string,
  onClose: DialogProps['onClose']
) => {
  const accountId = selectedAccountId()

  const createBroadcastList = async () => {
    const chatId = await BackendRemote.rpc.createBroadcastList(accountId)

    for (const contactId of broadcastRecipients) {
      if (contactId !== C.DC_CONTACT_ID_SELF) {
        await BackendRemote.rpc.addContactToChat(accountId, chatId, contactId)
      }
    }

    await BackendRemote.rpc.setChatName(accountId, chatId, groupName)

    return chatId
  }

  return async () => {
    const chatId = await createBroadcastList()
    onClose()
    selectChat(chatId)
  }
}

export function useContactSearch(
  updateContacts: (searchString: string) => void
) {
  const [searchString, setSearchString] = useState('')

  const updateSearch = (searchString: string) => {
    setSearchString(searchString)
    updateContacts(searchString)
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateSearch(e.target.value)

  const refresh = () => updateContacts(searchString)

  return [searchString, onSearchChange, updateSearch, refresh] as [
    searchString: string,
    onSearchChange: typeof onSearchChange,
    updateSearch: typeof updateSearch,
    refresh: typeof refresh,
  ]
}

export function useGroupImage(image?: string | null) {
  const [groupImage, setGroupImage] = useState(image)
  const tx = window.static_translate

  const onSetGroupImage = async () => {
    const file = await runtime.showOpenFileDialog({
      title: tx('select_group_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
      properties: ['openFile'],
      defaultPath: runtime.getAppPath('pictures'),
    })
    if (file) {
      setGroupImage(file)
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
