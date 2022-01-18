import React, {
  Fragment,
  useState,
  useContext,
  useRef,
  useLayoutEffect,
  useEffect,
  ChangeEvent,
  useCallback,
} from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { C } from 'deltachat-node/dist/constants'

import { DeltaBackend } from '../../delta-remote'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import {
  useContacts,
  ContactList2,
  useContactsNew,
} from '../contact/ContactList'
import {
  PseudoListItem,
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
  PseudoListItemAddContact,
} from '../helpers/PseudoListItem'

import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
  DeltaDialogOkCancelFooter,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'

import { GroupImage } from './Edit-Group-Image'

import { JsonContact } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import { QrCodeShowQrInner } from './QrCode'
import { runtime } from '../../runtime'
import {
  createChatByContactIdAndSelectIt,
  selectChat,
} from '../helpers/ChatMethods'
import { Avatar } from '../Avatar'
import { AddMemberDialog } from './ViewGroup'

export default function CreateChat(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const { isOpen, onClose } = props
  const tx = useTranslationFunction()
  const { userFeedback } = useContext(ScreenContext)
  const [viewMode, setViewMode] = useState('main')

  const [{ contacts, queryStrIsValidEmail }, updateContacts] = useContactsNew(
    C.DC_GCL_ADD_SELF,
    ''
  )
  const [queryStr, onSearchChange] = useContactSearch(updateContacts)

  const chooseContact = async ({ id }: JsonContact) => {
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

  const renderAddGroupIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <Fragment>
        <PseudoListItem
          id='newgroup'
          cutoff='+'
          text={tx('menu_new_group')}
          onClick={() => setViewMode('createGroup-main')}
        />
        <PseudoListItem
          id='newverifiedgroup'
          cutoff='+'
          text={tx('menu_new_verified_group')}
          onClick={() => setViewMode('createVerifiedGroup-main')}
        />
      </Fragment>
    )
  }

  const addContactOnClick = async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    await createChatByContactIdAndSelectIt(contactId)
    onClose()
  }

  const renderAddContactIfNeeded = () => {
    if (
      queryStr === '' ||
      (contacts.length === 1 &&
        contacts[0].address.toLowerCase() === queryStr.toLowerCase())
    ) {
      return null
    }
    return (
      <PseudoListItemAddContact
        queryStr={queryStr}
        queryStrIsEmail={queryStrIsValidEmail}
        onClick={addContactOnClick}
      />
    )
  }

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      {viewMode.startsWith('main') && (
        <>
          <DeltaDialogHeader>
            <input
              className='search-input'
              onChange={onSearchChange}
              value={queryStr}
              placeholder={tx('contacts_enter_name_or_email')}
              autoFocus
              spellCheck={false}
            />
          </DeltaDialogHeader>
          <DeltaDialogBody>
            <Card>
              <div className='create-chat-contact-list-wrapper'>
                {renderAddGroupIfNeeded()}
                <ContactList2 contacts={contacts} onClick={chooseContact} />
                {renderAddContactIfNeeded()}
              </div>
            </Card>
          </DeltaDialogBody>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p className={'delta-button bold primary'} onClick={onClose}>
                {tx('close')}
              </p>
            </DeltaDialogFooterActions>
          </DeltaDialogFooter>
        </>
      )}
      {viewMode.startsWith('createGroup') && (
        <CreateGroupInner
          isVerified={false}
          {...{ viewMode, setViewMode, onClose }}
        />
      )}
      {viewMode.startsWith('createVerifiedGroup') && (
        <CreateGroupInner isVerified {...{ viewMode, setViewMode, onClose }} />
      )}
    </DeltaDialogBase>
  )
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

  return [searchString, onSearchChange, updateSearch] as [
    string,
    typeof onSearchChange,
    typeof updateSearch
  ]
}

export function useGroupImage(image?: string) {
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
    typeof onUnsetGroupImage
  ]
}

export function useGroupMembers(initialMemebers: number[]) {
  const [groupMembers, setGroupMembers] = useState(initialMemebers)

  const removeGroupMember = ({ id }: JsonContact | { id: number }) =>
    id !== 1 &&
    setGroupMembers(prevMembers => prevMembers.filter(gId => gId !== id))
  const addGroupMember = ({ id }: JsonContact | { id: number }) =>
    setGroupMembers(prevMembers => [...prevMembers, id])
  const addRemoveGroupMember = ({ id }: JsonContact | { id: number }) => {
    groupMembers.indexOf(id) !== -1
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
    typeof addGroupMembers
  ]
}

export const GroupSettingsSetNameAndProfileImage = ({
  groupImage,
  onSetGroupImage,
  onUnsetGroupImage,
  groupName,
  setGroupName,
  errorMissingGroupName,
  setErrorMissingGroupName,
  color,
  isVerified,
}: {
  groupImage?: string
  onSetGroupImage: () => void
  onUnsetGroupImage: () => void
  groupName: string
  setGroupName: (newGroupName: string) => void
  errorMissingGroupName: boolean
  setErrorMissingGroupName: React.Dispatch<React.SetStateAction<boolean>>
  color?: string
  isVerified?: boolean
}) => {
  const tx = useTranslationFunction()
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.value.length > 0) setErrorMissingGroupName(false)
    setGroupName(target.value)
  }
  return (
    <>
      <div className='group-settings-container'>
        <GroupImage
          style={{ float: 'left' }}
          groupImage={groupImage}
          onSetGroupImage={onSetGroupImage}
          onUnsetGroupImage={onUnsetGroupImage}
          groupName={groupName}
          color={color}
          isVerified={isVerified}
        />
        <input
          className='group-name-input'
          placeholder={tx('group_name')}
          value={groupName}
          onChange={onChange}
          autoFocus
          style={{
            marginLeft: '17px',
            width: 'calc(100% - 65px - 17px)',
            top: '-7px',
            position: 'relative',
          }}
          spellCheck={false}
        />
      </div>
      {errorMissingGroupName && (
        <p
          style={{
            color: 'var(--colorDanger)',
            marginLeft: '80px',
            position: 'relative',
            top: '-30px',
            marginBottom: '-18px',
          }}
        >
          {tx('group_please_enter_group_name')}
        </p>
      )}
    </>
  )
}

export function AddMemberInnerDialog({
  onCancel,
  onOk,
  onSearchChange,
  queryStr,
  searchContacts,
  groupMembers,
}: {
  onOk: (addMembers: number[]) => void
  onCancel: Parameters<typeof DeltaDialogOkCancelFooter>[0]['onCancel']
  onSearchChange: ReturnType<typeof useContactSearch>[1]
  queryStr: string
  searchContacts: Map<number, JsonContact>
  groupMembers: number[]
}) {
  const contactIdsInGroup: number[] = [...searchContacts]
    .filter(([contactId, _contact]) => groupMembers.indexOf(contactId) !== -1)
    .map(([contactId, _contact]) => contactId)

  const [contactIdsToAdd, setContactIdsToAdd] = useState<JsonContact[]>([])
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

  const addOrRemoveMember = useCallback(
    (contact: JsonContact) => {
      if (contactIdsToAdd.findIndex(c => c.id === contact.id) === -1) {
        setContactIdsToAdd([...contactIdsToAdd, contact])
      } else {
        setContactIdsToAdd(contactIdsToAdd.filter(c => c.id !== contact.id))
      }
    },
    [contactIdsToAdd]
  )

  const tx = window.static_translate

  const _onOk = () => {
    onOk(contactIdsToAdd.map(c => c.id))
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const contactListRef = useRef<HTMLDivElement>(null)
  const applyCSSHacks = () => {
    setTimeout(() => inputRef.current?.focus(), 0)

    const offsetHeight =
      //@ts-ignore
      document.querySelector('.AddMemberChipsWrapper')?.offsetHeight
    if (!offsetHeight) return
    contactListRef.current?.style.setProperty(
      'max-height',
      `calc(100% - ${offsetHeight}px)`
    )
  }

  useLayoutEffect(applyCSSHacks, [inputRef, contactIdsToAdd])
  useEffect(applyCSSHacks, [])

  const addContactOnClick = useCallback(async () => {
    if (!queryStrIsValidEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    const contact = await DeltaBackend.call('contacts.getContact', contactId)
    addOrRemoveMember(contact)
    onSearchChange({
      target: { value: queryStr },
    } as ChangeEvent<HTMLInputElement>)
  }, [addOrRemoveMember, onSearchChange, queryStr, queryStrIsValidEmail])

  const renderAddContactIfNeeded = () => {
    if (queryStr === '' || searchContacts.size !== 0) {
      return null
    }
    return (
      <PseudoListItemAddContact
        queryStr={queryStr}
        queryStrIsEmail={queryStrIsValidEmail}
        onClick={addContactOnClick}
      />
    )
  }

  return (
    <>
      <DeltaDialogHeader title={tx('group_add_members')} />
      <DeltaDialogBody style={{ overflow: 'hidden' }}>
        <Card style={{ padding: '0px 20px', height: '100%' }}>
          <div className='AddMemberChipsWrapper'>
            <div className='AddMemberChips'>
              {contactIdsToAdd.map(contact => {
                return AddMemberChip({
                  contact,
                  onRemoveClick: addOrRemoveMember,
                })
              })}
              <input
                ref={inputRef}
                className='search-input group-member-search'
                onChange={onSearchChangeValidation}
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
            <ContactList2
              contacts={Array.from(searchContacts.values())}
              onClick={() => {}}
              showCheckbox
              isChecked={contact => {
                return (
                  contactIdsToAdd.findIndex(c => c.id === contact.id) !== -1 ||
                  contactIdsInGroup.indexOf(contact.id) !== -1
                )
              }}
              disabledContacts={contactIdsInGroup}
              onCheckboxClick={addOrRemoveMember}
            />
            {renderAddContactIfNeeded()}
          </div>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogOkCancelFooter onCancel={onCancel} onOk={_onOk} />
    </>
  )
}

const AddMemberChip = (props: {
  contact: JsonContact
  onRemoveClick: (contact: JsonContact) => void
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
          isVerified={contact.isVerified}
        />
      </div>
      <div className='DisplayName'>{contact.displayName}</div>
    </div>
  )
}

const useCreateGroup = (
  verified: boolean,
  groupName: string,
  groupImage: string | undefined,
  groupMembers: number[],
  onClose: DialogProps['onClose']
) => {
  const [groupId, setGroupId] = useState(-1)

  const lazilyCreateOrUpdateGroup = async (finishing: boolean) => {
    let gId = groupId
    if (gId === -1) {
      gId = await DeltaBackend.call('chat.createGroupChat', verified, groupName)
      setGroupId(gId)
    } else {
      await DeltaBackend.call('chat.setName', gId, groupName)
    }
    if (finishing === true) {
      if (groupImage !== '' && groupImage !== undefined) {
        await DeltaBackend.call('chat.setProfileImage', gId, groupImage)
      }
      for (const contactId of groupMembers) {
        if (contactId !== C.DC_CONTACT_ID_SELF) {
          await DeltaBackend.call('chat.addContactToChat', gId, contactId)
        }
      }
    }
    return gId
  }
  const finishCreateGroup = async () => {
    if (groupName === '') return
    const gId = await lazilyCreateOrUpdateGroup(true)
    onClose()
    selectChat(gId)
  }
  return [groupId, lazilyCreateOrUpdateGroup, finishCreateGroup] as [
    number,
    typeof lazilyCreateOrUpdateGroup,
    typeof finishCreateGroup
  ]
}

function CreateGroupInner(props: {
  viewMode: string
  setViewMode: (newViewMode: string) => void
  onClose: DialogProps['onClose']
  isVerified: boolean
}) {
  const { openDialog } = useContext(ScreenContext)
  const { viewMode, setViewMode, onClose, isVerified } = props
  const tx = useTranslationFunction()

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [groupMembers, removeGroupMember, addGroupMember] = useGroupMembers([1])
  const [
    groupId,
    lazilyCreateOrUpdateGroup,
    finishCreateGroup,
  ] = useCreateGroup(isVerified, groupName, groupImage, groupMembers, onClose)

  const viewPrefix = isVerified ? 'createVerifiedGroup' : 'createGroup'

  const [qrCode, setQrCode] = useState('')
  const [qrCodeSVG, setQrCodeSvg] = useState<string | undefined>(undefined)

  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)

  const searchContacts = useContacts(
    isVerified ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF : C.DC_GCL_ADD_SELF,
    ''
  )[0]

  const showAddMemberDialog = () => {
    const listFlags = isVerified
      ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF
      : C.DC_GCL_ADD_SELF

    openDialog(AddMemberDialog, {
      listFlags,
      groupMembers,
      onOk: (members: number[]) =>
        members.forEach(contactId => addGroupMember({ id: contactId })),
    })
  }
  return (
    <>
      {viewMode.startsWith(viewPrefix + '-showQrCode') && (
        <>
          <DeltaDialogHeader title={tx('qrshow_title')} />
          <QrCodeShowQrInner
            onBack={() => {
              setViewMode(viewPrefix + '-main')
            }}
            qrCode={qrCode}
            qrCodeSVG={qrCodeSVG}
            description={tx('qrshow_join_group_hint', [groupName])}
          />
        </>
      )}
      {viewMode.startsWith(viewPrefix + '-main') && (
        <>
          <DeltaDialogHeader
            title={
              isVerified ? tx('menu_new_verified_group') : tx('menu_new_group')
            }
          />
          <div className={Classes.DIALOG_BODY}>
            <Card>
              <GroupSettingsSetNameAndProfileImage
                groupImage={groupImage}
                onSetGroupImage={onSetGroupImage}
                onUnsetGroupImage={onUnsetGroupImage}
                groupName={groupName}
                setGroupName={setGroupName}
                errorMissingGroupName={errorMissingGroupName}
                setErrorMissingGroupName={setErrorMissingGroupName}
              />
              <div className='group-seperator'>
                {tx(
                  'n_members',
                  groupMembers.length.toString(),
                  groupMembers.length <= 1 ? 'one' : 'other'
                )}
              </div>
              <div className='group-member-contact-list-wrapper'>
                <PseudoListItemAddMember onClick={showAddMemberDialog} />
                <PseudoListItemShowQrCode
                  onClick={async () => {
                    if (groupId === -1 && groupName === '') {
                      setErrorMissingGroupName(true)
                      return
                    }
                    const gId = await lazilyCreateOrUpdateGroup(false)
                    const qrCode = await DeltaBackend.call(
                      'chat.getQrCode',
                      gId
                    )
                    setQrCode(qrCode)
                    setQrCodeSvg(qrCodeSVG)
                    setViewMode(viewPrefix + '-showQrCode')
                  }}
                />
                <ContactList2
                  contacts={searchContacts.filter(
                    ({ id }) => groupMembers.indexOf(id) !== -1
                  )}
                  onClick={() => {}}
                  showRemove
                  onRemoveClick={c => {
                    removeGroupMember(c)
                  }}
                />
              </div>
            </Card>
          </div>
          <DeltaDialogFooter>
            <DeltaDialogFooterActions>
              <p
                className='delta-button primary bold'
                style={{ marginRight: '10px' }}
                onClick={() => setViewMode('main')}
              >
                {tx('cancel')}
              </p>
              <p
                className='delta-button primary bold'
                onClick={() => {
                  if (groupName === '') {
                    setErrorMissingGroupName(true)
                    return
                  }
                  finishCreateGroup()
                }}
              >
                {tx('group_create_button')}
              </p>
            </DeltaDialogFooterActions>
          </DeltaDialogFooter>
        </>
      )}
    </>
  )
}
