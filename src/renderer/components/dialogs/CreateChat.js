import React, { Fragment, useState, useContext } from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { remote } from 'electron'
import qr from 'react-qr-svg'
import C from 'deltachat-node/constants'

import { callDcMethodAsync } from '../../ipc'
import ScreenContext from '../../contexts/ScreenContext'
import { selectChat } from '../../stores/chat'
import { useContacts, ContactList2 } from '../contact/ContactList'
import {
  PseudoListItem,
  PseudoListItemNoSearchResults,
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
  PseudoListItemAddContact
} from '../helpers/PseudoListItem'

import { DeltaButtonPrimary } from './SmallDialog'
import { DeltaDialogBase, DeltaDialogHeader, DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import {
  CreateChatSearchInput,
  CreateChatContactListWrapper
} from './CreateChat-Styles'

import {
  GroupSettingsContainer,
  GroupSeperator,
  GroupMemberContactListWrapper,
  GroupImage,
  GroupNameInput,
  GroupMemberSearchInput
} from './Group-Styles'

import { DeltaDialogQrInner } from './QrInviteCode' 

export default function CreateChat (props) {
  const { isOpen, onClose } = props
  const tx = window.translate
  const { userFeedback } = useContext(ScreenContext)
  const [viewMode, setViewMode] = useState('main')

  const [contacts, updateContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const [queryStr, onSearchChange] = useContactSearch(updateContacts)
  const queryStrIsEmail = isValidEmail(queryStr)

  const closeDialogAndSelectChat = chatId => {
    selectChat(chatId)
    onClose()
  }

  const chooseContact = async ({ id }) => {
    const chatId = await callDcMethodAsync('contacts.createChatByContactId', id)

    if (!chatId) {
      return userFeedback({ type: 'error', text: tx('create_chat_error_desktop') })
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

    const contactId = await callDcMethodAsync('contacts.createContact', [false, queryStr])
    const chatId = await callDcMethodAsync('contacts.createChatByContactId', contactId)
    closeDialogAndSelectChat(chatId)
  }

  const renderAddContactIfNeeded = () => {
    if (queryStr === '' ||
        (contacts.length === 1 && contacts[0].address.toLowerCase() === queryStr.toLowerCase())) {
      return null
    }
    return PseudoListItemAddContact({ queryStr, queryStrIsEmail, onClick: addContactOnClick })
  }

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      fixed
    >
      { viewMode.startsWith('main') &&
          (<>
            <DeltaDialogHeader onClose={onClose}>
              <CreateChatSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('contacts_enter_name_or_email')} autoFocus />
            </DeltaDialogHeader>
            <DeltaDialogBody noFooter>
              <Card>
                <CreateChatContactListWrapper>
                  { renderAddGroupIfNeeded()}
                  <ContactList2 contacts={contacts} onClick={chooseContact} />
                  {renderAddContactIfNeeded()}
                </CreateChatContactListWrapper>
              </Card>
            </DeltaDialogBody>
          </>)
      }
      { viewMode.startsWith('createGroup') && <CreateGroupInner {...{ viewMode, setViewMode, onClose }} />}
      { viewMode.startsWith('createVerifiedGroup') && <CreateVerifiedGroupInner {...{ viewMode, setViewMode, onClose }} />}
    </DeltaDialogBase>
  )
}

export function useContactSearch (updateContacts) {
  const [searchString, setSearchString] = useState('')

  const updateSearch = searchString => {
    setSearchString(searchString)
    updateContacts(searchString)
  }

  const onSearchChange = e => updateSearch(e.target.value)

  return [searchString, onSearchChange, updateSearch]
}

export function useGroupImage (image) {
  const [groupImage, setGroupImage] = useState(image)
  const tx = window.translate

  const onSetGroupImage = () => {
    remote.dialog.showOpenDialog({
      title: tx('select_group_image_desktop'),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
      properties: ['openFile']
    }, files => {
      if (Array.isArray(files) && files.length > 0) {
        setGroupImage(files[0])
      }
    })
  }
  const onUnsetGroupImage = () => setGroupImage('')

  return [groupImage, onSetGroupImage, onUnsetGroupImage]
}

export function useGroupMembers () {
  const [groupMembers, setGroupMembers] = useState([1])

  const removeGroupMember = ({ id }) => id !== 1 && setGroupMembers(groupMembers.filter(gId => gId !== id))
  const addGroupMember = ({ id }) => setGroupMembers([...groupMembers, id])
  const addRemoveGroupMember = ({ id }) => {
    groupMembers.indexOf(id) !== -1 ? removeGroupMember({ id }) : addGroupMember({ id })
  }
  return [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember]
}

export const GroupSettingsSetNameAndProfileImage = ({ groupImage, onSetGroupImage, onUnsetGroupImage, groupName, setGroupName }) => {
  const tx = window.translate
  return (
    <GroupSettingsContainer style={{ paddingBottom: '20px' }}>
      <GroupImage
        style={{ float: 'left' }}
        groupImage={groupImage}
        onSetGroupImage={onSetGroupImage}
        onUnsetGroupImage={onUnsetGroupImage}
      />
      <GroupNameInput
        placeholder={tx('group_name')}
        value={groupName}
        onChange={({ target }) => setGroupName(target.value)}
        autoFocus
      />
    </GroupSettingsContainer>
  )
}

export const AddMemberInnerDialog = ({ onClickBack, onClose, onSearchChange, queryStr, searchContacts, groupMembers, addRemoveGroupMember }) => {
  const tx = window.translate

  return (
    <>
      <DeltaDialogHeader
        title={tx('group_add_members')}
        onClickBack={onClickBack}
        onClose={onClose}
      />
      <DeltaDialogBody noFooter>
        <Card style={{ padding: '0px 20px' }}>
          <GroupMemberSearchInput style={{ marginLeft: '20px' }} onChange={onSearchChange} value={queryStr} placeholder={tx('search')} autoFocus />
          <GroupMemberContactListWrapper>
            <ContactList2
              contacts={searchContacts}
              onClick={() => {}}
              showCheckbox
              isChecked={({ id }) => groupMembers.indexOf(id) !== -1}
              onCheckboxClick={addRemoveGroupMember}
            />
            { queryStr !== '' && searchContacts.length === 0 && PseudoListItemNoSearchResults({ queryStr })}
          </GroupMemberContactListWrapper>
        </Card>
      </DeltaDialogBody>
    </>
  )
}

export const ShowQrCodeInnerDialog = ({ onClickBack, onClose, qrCode, groupName }) => {
  const tx = window.translate

  return (
    <>
      <DeltaDialogHeader
        title={tx('qrshow_title')}
        onClickBack={onClickBack}
        onClose={onClose}
      />
      <DeltaDialogQrInner qrCode={qrCode} description={tx('qrshow_join_group_hint', [groupName])} />
    </>
  )
}

export const useCreateGroup = (verified, groupName, groupImage, groupMembers, onClose) => {
  const [groupId, setGroupId] = useState(-1)

  const lazilyCreateOrUpdateGroup = async (finishing) => {
    let gId = groupId
    if (gId === -1) {
      gId = await callDcMethodAsync('chat.createGroupChat', [verified, groupName])
      setGroupId(gId)
    } else {
      await callDcMethodAsync('chat.setName', [gId, groupName])
    }
    if (finishing === true) {
      if (groupImage !== '') {
        await callDcMethodAsync('chat.setProfileImage', [gId, groupImage])
      }
      for (const contactId of groupMembers) {
        if (contactId !== C.DC_CONTACT_ID_SELF) {
          await callDcMethodAsync('chat.addContactToChat', [gId, contactId])
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
  return [groupId, lazilyCreateOrUpdateGroup, finishCreateGroup]
}

export function CreateGroupInner (props) {
  const { viewMode, setViewMode, onClose } = props
  const tx = window.translate

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember] = useGroupMembers()
  const [groupId, lazilyCreateOrUpdateGroup, finishCreateGroup] = useCreateGroup(false, groupName, groupImage, groupMembers, onClose)

  const [qrCode, setQrCode] = useState('')

  const [searchContacts, updateSearchContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(updateSearchContacts)
  const searchContactsToAdd = queryStr !== ''
    ? searchContacts.filter(({ id }) => groupMembers.indexOf(id) === -1).filter((_, i) => i < 5)
    : []

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoListItemAddMember onClick={() => setViewMode('createGroup-addMember')} />
        <PseudoListItemShowQrCode onClick={async () => {
          if (groupId === -1 && groupName === '') return
          const gId = await lazilyCreateOrUpdateGroup(false)
          const qrCode = await callDcMethodAsync('chat.getQrCode', gId)
          setQrCode(qrCode)
          setViewMode('createGroup-showQrCode')
        }} />
      </>
    )
  }

  return (
    <>
      { viewMode.startsWith('createGroup-addMember') && AddMemberInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('createGroup-main') },
        onClose,
        onSearchChange,
        queryStr,
        searchContacts,
        groupMembers,
        addRemoveGroupMember
      })}
      { viewMode.startsWith('createGroup-showQrCode') && ShowQrCodeInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('createGroup-main') },
        onClose,
        qrCode: qrCode,
        groupName
      })}
      { viewMode.startsWith('createGroup-main') &&
        <>
          <DeltaDialogHeader
            title={tx('menu_new_group')}
            onClickBack={() => setViewMode('main')}
            onClose={onClose}
          />
          <div className={Classes.DIALOG_BODY}>
            <Card>
              {GroupSettingsSetNameAndProfileImage({ groupImage, onSetGroupImage, onUnsetGroupImage, groupName, setGroupName })}
              <GroupSeperator>{tx('n_members', groupMembers.length, groupMembers.length <= 1 ? 'one' : 'other')}</GroupSeperator>
              <GroupMemberContactListWrapper>
                <GroupMemberSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('search')} />
                {renderAddMemberIfNeeded()}
                <ContactList2
                  contacts={searchContacts.filter(({ id }) => groupMembers.indexOf(id) !== -1)}
                  onClick={() => {}}
                  showCheckbox
                  isChecked={() => true}
                  onCheckboxClick={removeGroupMember}
                />
                {queryStr !== '' && searchContactsToAdd.length !== 0 && (
                <>
                  <GroupSeperator noMargin>{tx('group_add_members')}</GroupSeperator>
                  <ContactList2
                    contacts={searchContactsToAdd}
                    onClick={() => {}}
                    showCheckbox
                    isChecked={() => false}
                    onCheckboxClick={addGroupMember}
                  />
                </>
                )}
                {queryStr !== '' && searchContacts.length === 0 && PseudoListItemNoSearchResults({ queryStr })}
              </GroupMemberContactListWrapper>
            </Card>
          </div>
          <DeltaDialogFooter>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <DeltaButtonPrimary
                noPadding
                onClick={finishCreateGroup}
              >
                {tx('ok')}
              </DeltaButtonPrimary>
            </div>
          </DeltaDialogFooter>
        </>
      }
    </>
  )
}

export function CreateVerifiedGroupInner (props) {
  const { viewMode, setViewMode, onClose } = props
  const tx = window.translate

  const [groupName, setGroupName] = useState('')
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember] = useGroupMembers()
  const [groupId, lazilyCreateOrUpdateGroup, finishCreateGroup] = useCreateGroup(true, groupName, groupImage, groupMembers, onClose)

  const [qrCode, setQrCode] = useState('')

  const [searchContacts, updateSearchContacts] = useContacts(C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF, '')
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(updateSearchContacts)
  const searchContactsToAdd = queryStr !== ''
    ? searchContacts.filter(({ id }) => groupMembers.indexOf(id) === -1).filter((_, i) => i < 5)
    : []

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoListItemAddMember onClick={() => setViewMode('createVerifiedGroup-addMember')} />
        <PseudoListItemShowQrCode onClick={async () => {
          if (groupId === -1 && groupName === '') return
          const gId = await lazilyCreateOrUpdateGroup(false)
          const qrCode = await callDcMethodAsync('chat.getQrCode', gId)
          setQrCode(qrCode)
          setViewMode('createVerifiedGroup-showQrCode')
        }} />
      </>
    )
  }

  return (
    <>
      { viewMode.startsWith('createVerifiedGroup-addMember') && AddMemberInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('createVerifiedGroup-main') },
        onClose,
        onSearchChange,
        queryStr,
        searchContacts,
        groupMembers,
        addRemoveGroupMember
      })}
      { viewMode.startsWith('createVerifiedGroup-showQrCode') && ShowQrCodeInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('createVerifiedGroup-main') },
        onClose,
        qrCode: qrCode,
        groupName
      })}
      { viewMode.startsWith('createVerifiedGroup-main') &&
      <>
        <DeltaDialogHeader
          title={tx('menu_new_verified_group')}
          onClickBack={() => setViewMode('main')}
          onClose={onClose}
        />
        <div className={Classes.DIALOG_BODY}>
          <Card>
            {GroupSettingsSetNameAndProfileImage({ groupImage, onSetGroupImage, onUnsetGroupImage, groupName, setGroupName })}
            <GroupSeperator>{tx('n_members', groupMembers.length, groupMembers.length <= 1 ? 'one' : 'other')}</GroupSeperator>
            <GroupMemberContactListWrapper>
              <GroupMemberSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('search')} />
              {renderAddMemberIfNeeded()}
              <ContactList2
                contacts={searchContacts.filter(({ id }) => groupMembers.indexOf(id) !== -1)}
                onClick={() => {}}
                showCheckbox
                isChecked={() => true}
                onCheckboxClick={removeGroupMember}
              />
              {queryStr !== '' && searchContactsToAdd.length !== 0 && (
              <>
                <GroupSeperator noMargin>{tx('group_add_members')}</GroupSeperator>
                <ContactList2
                  contacts={searchContactsToAdd}
                  onClick={() => {}}
                  showCheckbox
                  isChecked={() => false}
                  onCheckboxClick={addGroupMember}
                />
              </>
              )}
              {queryStr !== '' && searchContacts.length === 0 && PseudoListItemNoSearchResults({ queryStr })}
            </GroupMemberContactListWrapper>
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <DeltaButtonPrimary
              noPadding
              onClick={finishCreateGroup}
            >
              {tx('group_create_button')}
            </DeltaButtonPrimary>
          </div>
        </div>
      </>
      }
    </>
  )
}

export function isValidEmail (email) {
  // empty string is not allowed
  if (email === '') return false
  const parts = email.split('@')
  // missing @ character or more than one @ character
  if (parts.length !== 2) return false
  const [local, domain] = parts
  // empty string is not valid for local part
  if (local === '') return false
  // domain is too short
  if (domain.length <= 3) return false
  const dot = domain.indexOf('.')
  // invalid domain without a dot
  if (dot === -1) return false
  // invalid domain if dot is (second) last character
  if (dot >= domain.length - 2) return false

  return true
}
