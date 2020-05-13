import React, { useState } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import differ from 'array-differ'
import { Card, Classes } from '@blueprintjs/core'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogFooter,
} from './DeltaDialog'
import {
  useGroupImage,
  useContactSearch,
  GroupSettingsSetNameAndProfileImage,
  AddMemberInnerDialog,
  ShowQrCodeInnerDialog,
} from './CreateChat'
import { useContacts, ContactList2 } from '../contact/ContactList'
import {
  PseudoListItemNoSearchResults,
  PseudoListItemShowQrCode,
  PseudoListItemAddMember,
} from '../helpers/PseudoListItem'
import { DialogProps } from '.'
import {
  ChatListItemType,
  FullChat,
  JsonContact,
} from '../../../shared/shared-types'

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
  verified: boolean,
  groupName: string,
  groupImage: string,
  groupMembers: number[],
  groupId: number,
  onClose: DialogProps['onClose']
) => {
  const [initialGroupMembers] = useState(groupMembers)
  const updateGroup = async () => {
    const remove = differ(initialGroupMembers, groupMembers)
    const add = differ(groupMembers, initialGroupMembers)
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

export function useGroupMembers(initialMembers: JsonContact[]) {
  const [groupMembers, setGroupMembers] = useState(
    initialMembers.map(member => member.id)
  )

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

function EditGroupInner(props: {
  viewMode: string
  setViewMode: (newViewMode: string) => void
  onClose: DialogProps['onClose']
  chat: FullChat
}) {
  const { viewMode, setViewMode, onClose, chat } = props
  const tx = window.translate

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
  ] = useGroupMembers(chat.contacts)
  const [groupId, onUpdateGroup] = useEditGroup(
    false,
    groupName,
    groupImage,
    groupMembers,
    chat.id,
    onClose
  )

  const [qrCode, setQrCode] = useState('')
  const listFlags = chat.isVerified
    ? C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF
    : C.DC_GCL_ADD_SELF

  const [searchContacts, updateSearchContacts] = useContacts(listFlags, '')
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
      {viewMode === 'addMember' &&
        AddMemberInnerDialog({
          onClickBack: () => {
            updateSearch('')
            setViewMode('main')
          },
          onSearchChange,
          queryStr,
          searchContacts,
          groupMembers,
          addRemoveGroupMember,
        })}
      {viewMode === 'showQrCode' &&
        ShowQrCodeInnerDialog({
          onClickBack: () => {
            updateSearch('')
            setViewMode('main')
          },
          onClose,
          qrCode,
          groupName,
        })}
      {viewMode === 'main' && (
        <>
          <DeltaDialogHeader title={tx('menu_edit_group')} onClose={onClose} />
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
          <DeltaDialogFooter>
            <div
              style={{ justifyContent: 'space-between' }}
              className={Classes.DIALOG_FOOTER_ACTIONS}
            >
              <p className='delta-button no-padding bold' onClick={onClose}>
                {tx('cancel')}
              </p>
              <p
                className='delta-button no-padding primary bold'
                onClick={onUpdateGroup}
              >
                {tx('save_desktop')}
              </p>
            </div>
          </DeltaDialogFooter>
        </>
      )}
    </>
  )
}
