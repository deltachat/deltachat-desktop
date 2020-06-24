import React, { Fragment, useState, useContext } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { C } from 'deltachat-node/dist/constants'

import { DeltaBackend } from '../../delta-remote'
import { ScreenContext } from '../../contexts'
import { selectChat } from '../../stores/chat'
import { useContacts, ContactList2 } from '../contact/ContactList'
import {
  PseudoListItem,
  PseudoListItemNoSearchResults,
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
  PseudoListItemAddContact,
} from '../helpers/PseudoListItem'

import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
} from './DeltaDialog'

import { GroupImage } from './Edit-Group-Image'

import { DeltaDialogQrInner } from './QrInviteCode'
import { JsonContact, DCContact } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import { isValidEmail } from '../../../shared/util'
const { remote } = window.electron_functions

export default function CreateChat(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
}) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { userFeedback } = useContext(ScreenContext)
  const [viewMode, setViewMode] = useState('main')

  const [contacts, updateContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const [queryStr, onSearchChange] = useContactSearch(updateContacts)
  const queryStrIsEmail = isValidEmail(queryStr)

  const closeDialogAndSelectChat = (chatId: number) => {
    selectChat(chatId)
    onClose()
  }

  const chooseContact = async ({ id }: DCContact) => {
    const chatId = await DeltaBackend.call('contacts.createChatByContactId', id)

    if (!chatId) {
      return userFeedback({
        type: 'error',
        text: tx('create_chat_error_desktop'),
      })
    }
    closeDialogAndSelectChat(chatId)
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
    if (!queryStrIsEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    const chatId = await DeltaBackend.call(
      'contacts.createChatByContactId',
      contactId
    )
    closeDialogAndSelectChat(chatId)
  }

  const renderAddContactIfNeeded = () => {
    if (
      queryStr === '' ||
      (contacts.length === 1 &&
        contacts[0].address.toLowerCase() === queryStr.toLowerCase())
    ) {
      return null
    }
    return PseudoListItemAddContact({
      queryStr,
      queryStrIsEmail,
      onClick: addContactOnClick,
    })
  }

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      {viewMode.startsWith('main') && (
        <>
          <DeltaDialogHeader onClose={onClose}>
            <input
              className='search-input'
              onChange={onSearchChange}
              value={queryStr}
              placeholder={tx('contacts_enter_name_or_email')}
              autoFocus
            />
          </DeltaDialogHeader>
          <DeltaDialogBody noFooter>
            <Card>
              <div className='create-chat-contact-list-wrapper'>
                {renderAddGroupIfNeeded()}
                <ContactList2 contacts={contacts} onClick={chooseContact} />
                {renderAddContactIfNeeded()}
              </div>
            </Card>
          </DeltaDialogBody>
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
  const tx = window.translate

  const onSetGroupImage = async () => {
    let { filePaths } = await remote.dialog.showOpenDialog({
      title: tx('select_group_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
      properties: ['openFile'],
    })
    if (Array.isArray(filePaths) && filePaths.length > 0) {
      setGroupImage(filePaths[0])
    }
  }
  const onUnsetGroupImage = () => setGroupImage('')

  return [groupImage, onSetGroupImage, onUnsetGroupImage] as [
    typeof groupImage,
    typeof onSetGroupImage,
    typeof onUnsetGroupImage
  ]
}

function useGroupMembers() {
  const [groupMembers, setGroupMembers] = useState([1])

  const removeGroupMember = ({ id }: JsonContact | { id: number }) =>
    id !== 1 && setGroupMembers(groupMembers.filter(gId => gId !== id))
  const addGroupMember = ({ id }: JsonContact | { id: number }) =>
    setGroupMembers([...groupMembers, id])
  const addRemoveGroupMember = ({ id }: JsonContact | { id: number }) => {
    groupMembers.indexOf(id) !== -1
      ? removeGroupMember({ id })
      : addGroupMember({ id })
  }
  return [
    groupMembers,
    removeGroupMember,
    addGroupMember,
    addRemoveGroupMember,
  ] as [
    number[],
    typeof removeGroupMember,
    typeof addGroupMember,
    typeof addRemoveGroupMember
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
  groupImage: string
  onSetGroupImage: (event: React.SyntheticEvent) => void
  onUnsetGroupImage: (event: React.SyntheticEvent) => void
  groupName: string
  setGroupName: (newGroupName: string) => void
  errorMissingGroupName: boolean
  setErrorMissingGroupName: React.Dispatch<React.SetStateAction<boolean>>
  color?: string
  isVerified?: boolean
}) => {
  const tx = window.translate
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (target.value.length > 0) setErrorMissingGroupName(false)
    setGroupName(target.value)
  }
  return (
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
      />
      {errorMissingGroupName && (
        <p style={{ color: 'var(--colorDanger)', marginLeft: '80px' }}>
          {tx('group_please_enter_group_name')}
        </p>
      )}
    </div>
  )
}

export const AddMemberInnerDialog = ({
  onClickBack,
  onSearchChange,
  queryStr,
  searchContacts,
  groupMembers,
  addRemoveGroupMember,
}: {
  onClickBack: Parameters<typeof DeltaDialogHeader>[0]['onClickBack']
  onSearchChange: ReturnType<typeof useContactSearch>[1]
  queryStr: string
  searchContacts: DCContact[]
  groupMembers: number[]
  addRemoveGroupMember: ReturnType<typeof useGroupMembers>[3]
}) => {
  const tx = window.translate

  return (
    <>
      <DeltaDialogHeader
        title={tx('group_add_members')}
        onClickBack={onClickBack}
      />
      <DeltaDialogBody noFooter>
        <Card style={{ padding: '0px 20px' }}>
          <input
            className='search-input group-member-search'
            style={{ marginLeft: '0px' }}
            onChange={onSearchChange}
            value={queryStr}
            placeholder={tx('search')}
            autoFocus
          />
          <div className='group-member-contact-list-wrapper'>
            <ContactList2
              contacts={searchContacts}
              onClick={() => {}}
              showCheckbox
              isChecked={({ id }) => groupMembers.indexOf(id) !== -1}
              onCheckboxClick={addRemoveGroupMember}
            />
            {queryStr !== '' &&
              searchContacts.length === 0 &&
              PseudoListItemNoSearchResults({ queryStr })}
          </div>
        </Card>
      </DeltaDialogBody>
    </>
  )
}

export const ShowQrCodeInnerDialog = ({
  onClickBack,
  onClose,
  qrCode,
  groupName,
}: {
  onClickBack: Parameters<typeof DeltaDialogHeader>[0]['onClickBack']
  onClose: DialogProps['onClose']
  qrCode: string
  groupName: string
}) => {
  const tx = window.translate

  return (
    <>
      <DeltaDialogHeader
        title={tx('qrshow_title')}
        onClickBack={onClickBack}
        onClose={onClose}
      />
      <DeltaDialogQrInner
        qrCode={qrCode}
        description={tx('qrshow_join_group_hint', [groupName])}
      />
    </>
  )
}

const useCreateGroup = (
  verified: boolean,
  groupName: string,
  groupImage: string,
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
      if (groupImage !== '') {
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
  const { viewMode, setViewMode, onClose, isVerified } = props
  const tx = window.translate

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [
    groupMembers,
    removeGroupMember,
    addGroupMember,
    addRemoveGroupMember,
  ] = useGroupMembers()
  const [
    groupId,
    lazilyCreateOrUpdateGroup,
    finishCreateGroup,
  ] = useCreateGroup(isVerified, groupName, groupImage, groupMembers, onClose)

  const viewPrefix = isVerified ? 'createVerifiedGroup' : 'createGroup'

  const [qrCode, setQrCode] = useState('')
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)

  const [searchContacts, updateSearchContacts] = useContacts(
    isVerified ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF : C.DC_GCL_ADD_SELF,
    ''
  )
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(
    updateSearchContacts
  )
  const searchContactsToAdd =
    queryStr !== ''
      ? searchContacts
          .filter(({ id }) => groupMembers.indexOf(id) === -1)
          .filter((_, i) => i < 5)
      : []

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoListItemAddMember
          onClick={() => setViewMode(viewPrefix + '-addMember')}
        />
        <PseudoListItemShowQrCode
          onClick={async () => {
            if (groupId === -1 && groupName === '') {
              setErrorMissingGroupName(true)
              return
            }
            const gId = await lazilyCreateOrUpdateGroup(false)
            const qrCode = await DeltaBackend.call('chat.getQrCode', gId)
            setQrCode(qrCode)
            setViewMode(viewPrefix + '-showQrCode')
          }}
        />
      </>
    )
  }

  return (
    <>
      {viewMode.startsWith(viewPrefix + '-addMember') &&
        AddMemberInnerDialog({
          onClickBack: () => {
            updateSearch('')
            setViewMode(viewPrefix + '-main')
          },
          onSearchChange,
          queryStr,
          searchContacts,
          groupMembers,
          addRemoveGroupMember,
        })}
      {viewMode.startsWith(viewPrefix + '-showQrCode') &&
        ShowQrCodeInnerDialog({
          onClickBack: () => {
            updateSearch('')
            setViewMode(viewPrefix + '-main')
          },
          onClose,
          qrCode: qrCode,
          groupName,
        })}
      {viewMode.startsWith(viewPrefix + '-main') && (
        <>
          <DeltaDialogHeader
            title={
              isVerified ? tx('menu_new_verified_group') : tx('menu_new_group')
            }
            onClickBack={() => setViewMode('main')}
          />
          <div className={Classes.DIALOG_BODY}>
            <Card>
              {GroupSettingsSetNameAndProfileImage({
                groupImage,
                onSetGroupImage,
                onUnsetGroupImage,
                groupName,
                setGroupName,
                errorMissingGroupName,
                setErrorMissingGroupName,
              })}
              <div className='group-seperator'>
                {tx(
                  'n_members',
                  groupMembers.length.toString(),
                  groupMembers.length <= 1 ? 'one' : 'other'
                )}
              </div>
              <div className='group-member-contact-list-wrapper'>
                <input
                  className='search-input group-member-search'
                  onChange={onSearchChange}
                  value={queryStr}
                  placeholder={tx('search')}
                />
                {renderAddMemberIfNeeded()}
                <ContactList2
                  contacts={searchContacts.filter(
                    ({ id }) => groupMembers.indexOf(id) !== -1
                  )}
                  onClick={() => {}}
                  showRemove
                  onRemoveClick={removeGroupMember}
                />
                {queryStr !== '' && searchContactsToAdd.length !== 0 && (
                  <>
                    <div className='group-seperator no-margin'>
                      {tx('group_add_members')}
                    </div>
                    <ContactList2
                      contacts={searchContactsToAdd}
                      onClick={addGroupMember}
                    />
                  </>
                )}
                {queryStr !== '' &&
                  searchContacts.length === 0 &&
                  PseudoListItemNoSearchResults({ queryStr })}
              </div>
            </Card>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div
              style={{ justifyContent: 'space-between' }}
              className={Classes.DIALOG_FOOTER_ACTIONS}
            >
              <p className='delta-button no-padding bold' onClick={onClose}>
                {tx('cancel')}
              </p>
              <p
                className='delta-button no-padding primary bold'
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
            </div>
          </div>
        </>
      )}
    </>
  )
}
