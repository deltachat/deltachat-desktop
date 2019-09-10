import React, { useState } from 'react'
import { callDcMethodAsync } from '../../ipc'
import C from 'deltachat-node/constants'
import differ from 'array-differ'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, GoBackDialogHeader } from '../helpers/DeltaDialog'
import { DeltaButtonPrimary } from '../helpers/SmallDialog'
import { useGroupImage, useContactSearch, GroupSettingsSetNameAndProfileImage, AddMemberInnerDialog, ShowQrCodeInnerDialog } from './CreateChat'
import { useContacts, ContactList2 } from '../helpers/ContactList'
import {
  PseudoContactListItemNoSearchResults,
  PseudoContactListItemShowQrCode,
  PseudoContactListItemAddMember
} from './CreateChat-Styles'
import {
  GroupSeperator,
  GroupMemberContactListWrapper,
  GroupMemberSearchInput
} from './Group-Styles'

export default function EditGroup (props) {
  const { chat } = props
  const { isOpen, onClose } = props
  const [viewMode, setViewMode] = useState('main')

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      style={{ width: '400px', height: '76vh', top: '12vh' }}
      fixed
    >
      <EditGroupInner {...{ viewMode, setViewMode, onClose, chat }} />
    </DeltaDialogBase>
  )
}

export const useEditGroup = (verified, groupName, groupImage, groupMembers, groupId, onClose) => {
  const [initialGroupMembers] = useState(groupMembers)
  const updateGroup = async () => {
    const remove = differ(initialGroupMembers, groupMembers)
    const add = differ(groupMembers, initialGroupMembers)
    await callDcMethodAsync('modifyGroup', [groupId, groupName, groupImage, remove, add])
  }
  const finishEditGroup = async () => {
    if (groupName === '') return
    updateGroup()
    onClose()
  }
  return [groupId, updateGroup, finishEditGroup, onClose]
}

export function useGroupMembers (initialMembers) {
  const [groupMembers, setGroupMembers] = useState(initialMembers.map((member) => member.id))

  const removeGroupMember = ({ id }) => id !== 1 && setGroupMembers(groupMembers.filter(gId => gId !== id))
  const addGroupMember = ({ id }) => setGroupMembers([...groupMembers, id])
  const addRemoveGroupMember = ({ id }) => {
    groupMembers.indexOf(id) !== -1 ? removeGroupMember({ id }) : addGroupMember({ id })
  }
  return [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember]
}

export function EditGroupInner (props) {
  const { viewMode, setViewMode, onClose, chat } = props
  const tx = window.translate

  const [groupName, setGroupName] = useState(chat.name)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage(chat.profileImage)
  const [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember] = useGroupMembers(chat.contacts)
  const [groupId, finishEditGroup] = useEditGroup(false, groupName, groupImage, groupMembers, chat.id, onClose)

  const [qrCode, setQrCode] = useState('')
  const listFlags = chat.isVerified ? (C.DC_GCL_VERIFIED_ONLY | C.DC_GCL_ADD_SELF) : C.DC_GCL_ADD_SELF

  const [searchContacts, updateSearchContacts] = useContacts(listFlags, '')
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(updateSearchContacts)
  const searchContactsToAdd = queryStr !== ''
    ? searchContacts.filter(({ id }) => groupMembers.indexOf(id) === -1).filter((_, i) => i < 5)
    : []

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoContactListItemAddMember onClick={() => setViewMode('addMember')} />
        <PseudoContactListItemShowQrCode onClick={async () => {
          const qrCode = await callDcMethodAsync('getQrCode', groupId)
          setQrCode(qrCode)
          setViewMode('showQrCode')
        }} />
      </>
    )
  }

  return (
    <>
      { viewMode === 'addMember' && AddMemberInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('main') },
        onClose,
        onSearchChange,
        queryStr,
        searchContacts,
        groupMembers,
        addRemoveGroupMember
      })}
      { viewMode === 'showQrCode' && ShowQrCodeInnerDialog({
        onClickBack: () => { updateSearch(''); setViewMode('main') },
        onClose,
        qrCode
      })}
      { viewMode === 'main' &&
      <>
        <GoBackDialogHeader
          title={tx('menu_edit_group')}
          onClose={onClose}
        />
        <div className={Classes.DIALOG_BODY}>
          <Card>
            {GroupSettingsSetNameAndProfileImage({ groupImage, onSetGroupImage, onUnsetGroupImage, groupName, setGroupName })}
            <GroupSeperator>{tx('n_members', groupMembers.length, groupMembers.length <= 1 ? 'one' : 'other')}</GroupSeperator>
            <GroupMemberSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('search')} />
            <GroupMemberContactListWrapper>
              {renderAddMemberIfNeeded()}
              <ContactList2
                contacts={searchContacts.filter(({ id }) => groupMembers.indexOf(id) !== -1)}
                onClick={removeGroupMember}
                showCheckbox
                isChecked={() => true}
                onCheckboxClick={removeGroupMember}
              />
              {queryStr !== '' && searchContactsToAdd.length !== 0 && (
              <>
                <GroupSeperator noMargin>{tx('group_add_members')}</GroupSeperator>
                <ContactList2
                  contacts={searchContactsToAdd}
                  onClick={addGroupMember}
                  showCheckbox
                  isChecked={() => false}
                  onCheckboxClick={addGroupMember}
                />
              </>
              )}
              {queryStr !== '' && searchContacts.length === 0 && PseudoContactListItemNoSearchResults({ queryStr })}
            </GroupMemberContactListWrapper>
          </Card>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <DeltaButtonPrimary
              noPadding
              onClick={finishEditGroup}
            >
              {tx('save_desktop')}
            </DeltaButtonPrimary>
          </div>
        </div>
        </>
      }
    </>
  )
}
