import React, { useState, useContext } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import { Card, Classes } from '@blueprintjs/core'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogOkCancelFooter,
  DeltaDialogBody,
  DeltaDialogContent,
} from './DeltaDialog'
import {
  useGroupImage,
  useContactSearch,
  GroupSettingsSetNameAndProfileImage,
  AddMemberInnerDialog,
  useGroupMembers,
} from './CreateChat'
import { QrCodeShowQrInner } from './QrCode'
import { useContacts, ContactList2 } from '../contact/ContactList'
import {
  PseudoListItemNoSearchResults,
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import { DialogProps } from './DialogController'
import { FullChat, JsonContact } from '../../../shared/shared-types'
import { ViewProfileInner } from './ViewProfile'
import {ScreenContext} from '../../contexts'

export default function EditGroup(props: {
  isOpen: DialogProps['isOpen']
  onClose: DialogProps['onClose']
  chat: FullChat
}) {
  const { isOpen, onClose, chat } = props
  const [viewMode, setViewMode] = useState('main')

  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <EditGroupInner {...{ viewMode, setViewMode, onClose, chat }} />
    </DeltaDialogBase>
  )
}

export const useEditGroup = (
  groupName: string,
  groupImage: string,
  groupMembers: number[],
  groupId: number,
  onClose: DialogProps['onClose']
) => {
  const [initialGroupMembers] = useState(groupMembers)
  const updateGroup = async () => {
    const remove = initialGroupMembers.filter(m => !groupMembers.includes(m))
    const add = groupMembers.filter(m => !initialGroupMembers.includes(m))
    await DeltaBackend.call(
      'chat.modifyGroup',
      groupId,
      groupName,
      groupImage,
      remove,
      add
    )
  }
  const onUpdateGroup = async () => {
    if (groupName === '') return
    await updateGroup()
    onClose()
  }
  return [groupId, onUpdateGroup, updateGroup] as [
    number,
    typeof onUpdateGroup,
    typeof updateGroup
  ]
}

function EditGroupInner(props: {
  viewMode: string
  setViewMode: (newViewMode: string) => void
  onClose: DialogProps['onClose']
  chat: FullChat
}) {
  const { openDialog } = useContext(ScreenContext)
  const { viewMode, setViewMode, onClose, chat } = props
  const tx = window.static_translate

  const [groupName, setGroupName] = useState(chat.name)
  const [errorMissingGroupName, setErrorMissingGroupName] = useState(false)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(
    chat.profileImage
  )
  const [
    groupMembers,
    removeGroupMember,
    addGroupMember,
    addRemoveGroupMember,
    addGroupMembers,
  ] = useGroupMembers(chat.contacts.map(({ id }) => id))
  const [groupId, onUpdateGroup] = useEditGroup(
    groupName,
    groupImage,
    groupMembers,
    chat.id,
    onClose
  )

  const showRemoveGroupMemberConfirmationDialog = (contact: JsonContact) => {
    openDialog('ConfirmationDialog', {
      message: tx('ask_remove_members', contact.nameAndAddr),
      confirmLabel: tx('delete'),
      cb: (yes: boolean) => {
        if (yes) {
          removeGroupMember(contact)
          onUpdateGroup()
        }
      },
    })
  }

  const [qrCode, setQrCode] = useState('')
  const listFlags = chat.isProtected
    ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF
    : C.DC_GCL_ADD_SELF

  const [searchContacts, updateSearchContacts] = useContacts(listFlags, '')
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(
    updateSearchContacts
  )

  const [profileContact, setProfileContact] = useState<JsonContact>(null)

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
        <PseudoListItemAddMember onClick={() => setViewMode('addMember')} />
        <PseudoListItemShowQrCode
          onClick={async () => {
            const qrCode = await DeltaBackend.call('chat.getQrCode', groupId)
            setQrCode(qrCode)
            setViewMode('showQrCode')
          }}
        />
      </>
    )
  }

  return (
    <>
      {viewMode === 'addMember' && (
        <AddMemberInnerDialog
          {...{
            onClickBack: () => {
              updateSearch('')
              setViewMode('main')
            },
            onSearchChange,
            queryStr,
            searchContacts,
            groupMembers,
            addRemoveGroupMember,
            addGroupMembers,
          }}
        />
      )}
      {viewMode === 'showQrCode' && (
        <>
          <DeltaDialogHeader
            title={tx('qrshow_title')}
            showBackButton={true}
            onClickBack={() => setViewMode('main')}
            showCloseButton={true}
            onClose={onClose}
          />
          <QrCodeShowQrInner
            qrCode={qrCode}
            description={tx('qrshow_join_group_hint', [groupName])}
          />
        </>
      )}
      {viewMode === 'main' && (
        <>
          <DeltaDialogHeader 
            title={tx('menu_edit_group')}
            showCloseButton={true}
            onClose={onClose}
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
                color={chat.color}
                isVerified={chat.isProtected}
              />
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
                  spellCheck={false}
                />
                {renderAddMemberIfNeeded()}
                <ContactList2
                  contacts={searchContacts.filter(
                    ({ id }) => groupMembers.indexOf(id) !== -1
                  )}
                  showRemove
                  onClick={(contact: JsonContact) => {
                    setProfileContact(contact)
                    setViewMode('profile')
                  }}
                  onRemoveClick={showRemoveGroupMemberConfirmationDialog}
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
                {queryStr !== '' && searchContacts.length === 0 && (
                  <PseudoListItemNoSearchResults queryStr={queryStr} />
                )}
              </div>
            </Card>
          </div>
        </>
      )}
      {viewMode === 'profile' && (
        <>
          <DeltaDialogHeader
            title={tx('menu_view_profile')}
            showBackButton={true}
            onClickBack={() => setViewMode('main')}
            showCloseButton={true}
            onClose={onClose}
          />
          <DeltaDialogBody noFooter>
            <DeltaDialogContent noPadding>
              <ViewProfileInner contact={profileContact} onClose={onClose} />
            </DeltaDialogContent>
          </DeltaDialogBody>
        </>
      )}
    </>
  )
}
