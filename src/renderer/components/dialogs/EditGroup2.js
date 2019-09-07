import React, { useState, useContext } from 'react'
import { ipcRenderer } from 'electron'
import { callDcMethodAsync } from '../../ipc'
import C from 'deltachat-node/constants'
import differ from 'array-differ'
import styled from 'styled-components'
import { Card, Classes } from '@blueprintjs/core'
import ScreenContext from '../../contexts/ScreenContext'
import { DeltaDialogBase, GoBackDialogHeader } from '../helpers/DeltaDialog'
import { DeltaButtonPrimary } from '../helpers/SmallDialog'
import { isValidEmail } from '../helpers/Contact'
import { useGroupImage, useContactSearch, GroupSettingsSetNameAndProfileImage, AddMemberInnerDialog } from './CreateChat'
import { useContacts, ContactList2 } from '../helpers/ContactList'

import {
  CreateGroupSeperator,
  CreateGroupMemberContactListWrapper,
  // CreateChatSearchInput,
  // CreateChatContactListWrapper,
  CreateGroupMemberSearchInput,
  PseudoContactListItemNoSearchResults,
  PseudoContactListItemShowQrCode,
  PseudoContactListItemAddMember
} from './CreateChat-Styles'

export default function EditGroup2 (props) {
  const { chat } = props
  const { isOpen, onClose } = props
  const { changeScreen } = useContext(ScreenContext)
  const { name } = useState('')
  const [updateContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const [queryStr] = useContactSearch(updateContacts)
  const queryStrIsEmail = isValidEmail(queryStr)
  const tx = window.translate

  // super(props, {
  //   heading: 'menu_edit_group',
  //   group: group,
  //   name: chat.name,
  //   image: chat.profileImage,
  //   showVerifiedContacts: chat.isVerified,
  //   showQrInviteCodeButton: chat.isVerified,
  //   chatId: chat.id
  // })

  // const before = ipcRenderer.sendSync('getChatContacts', chat.id)
  //   .filter(id => id !== C.DC_CONTACT_ID_SELF)
  //   .map(id => Number(id))
  // before.forEach(id => { group[id] = true })

  // const isButtonDisabled = () => name.length

  // const back = changeScreen('ChatList')

  // const onSubmit = () => {
  //   const after = Object.keys(this.state.group).map(id => Number(id))
  //   const remove = differ(before, after)
  //   const add = differ(after, before)
  //   const { chat } = props.screenProps

  //   ipcRenderer.send(
  //     'modifyGroup',
  //     chat.id,
  //     this.state.name,
  //     this.state.image,
  //     remove,
  //     add
  //   )

  //   this.context.changeScreen('ChatList')
  // }

  return (
    <DeltaDialogBase
      isOpen={isOpen}
      onClose={onClose}
      style={{ width: '800px', height: '76vh', top: '12vh' }}
      fixed
    >
      <EditGroupInner {...{ onClose, chat }} />
    </DeltaDialogBase>
  )
}

const GroupMemberTable = styled.table`
    width:100%;
    td{
      width 50%;
      vertical-align: top;
    }
`
export const useEditGroup = (verified, groupName, groupImage, groupMembers, groupId, onClose) => {
  const { changeScreen } = useContext(ScreenContext)

  const updateGroup = async (finishing) => {
    await callDcMethodAsync('setChatName', [groupId, groupName])
    if (finishing === true) {
      if (groupImage !== '') {
        await callDcMethodAsync('setChatProfileImage', [groupId, groupImage])
      }
      for (const contactId of groupMembers) {
        await callDcMethodAsync('addContactToChat', [groupId, contactId])
      }
    }
  }
  const finishCreateGroup = async () => {
    if (groupName === '') return
    const gId = await updateGroup(true)
    onClose()
    changeScreen('ChatView', { groupId })
  }
  return [groupId, updateGroup, finishCreateGroup, onClose]
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
  const { onClose, chat } = props
  const tx = window.translate

  const [groupName, setGroupName] = useState(chat.name)
  const [groupImage, onSetGroupImage, onUnsetGroupImage] = useGroupImage()
  const [groupMembers, removeGroupMember, addGroupMember, addRemoveGroupMember] = useGroupMembers(chat.contacts)
  const [groupId, updateGroup] = useEditGroup(false, chat.name, chat.profileImage, groupMembers, chat.id)

  const [setQrCode] = useState('')

  const [searchContacts, updateSearchContacts] = useContacts(C.DC_GCL_ADD_SELF, '')
  const [queryStr, onSearchChange, updateSearch] = useContactSearch(updateSearchContacts)
  const searchContactsToAdd = queryStr !== ''
    ? searchContacts.filter(({ id }) => groupMembers.indexOf(id) === -1).filter((_, i) => i < 5)
    : []

  const renderAddMemberIfNeeded = () => {
    if (queryStr !== '') return null
    return (
      <>
        <PseudoContactListItemAddMember onClick={() => setShow('createGroup-addMember')} />
        <PseudoContactListItemShowQrCode onClick={async () => {
          if (groupId === -1 && groupName === '') return
          const gId = await updateGroup(false)
          const qrCode = await callDcMethodAsync('getQrCode', gId)
          setQrCode(qrCode)
          setShow('createGroup-showQrCode')
        }} />
      </>
    )
  }

  return (
    <>
      <GoBackDialogHeader
        title={tx('menu_edit_group')}
        onClose={onClose}
      />
      <Card>
        {GroupSettingsSetNameAndProfileImage({ groupImage, onSetGroupImage, onUnsetGroupImage, groupName, setGroupName })}
        <CreateGroupSeperator>{tx('n_members', groupMembers.length, groupMembers.length <= 1 ? 'one' : 'other')}</CreateGroupSeperator>
        <CreateGroupMemberSearchInput onChange={onSearchChange} value={queryStr} placeholder={tx('search')} />
      </Card>
      <div className={Classes.DIALOG_BODY}>
        <Card>
          <CreateGroupMemberContactListWrapper>
            <GroupMemberTable>
              <thead><tr><th>{tx('in_this_group_desktop')}</th><th>{tx('not_in_this_group_desktop')}</th></tr></thead>
              <tbody>
                <tr>
                  <td>
                    {renderAddMemberIfNeeded()}
                    <ContactList2
                      contacts={searchContacts.filter(({ id }) => groupMembers.indexOf(id) !== -1)}
                      onClick={removeGroupMember}
                      showCheckbox={false}
                    />
                  </td>
                  <td>
                    <ContactList2
                      contacts={searchContacts.filter(({ id }) => groupMembers.indexOf(id) === -1)}
                      onClick={addGroupMember}
                      showCheckbox={false}
                    />
                  </td>
                </tr>
              </tbody>
            </GroupMemberTable>
            {queryStr !== '' && searchContacts.length === 0 && PseudoContactListItemNoSearchResults({ queryStr })}
          </CreateGroupMemberContactListWrapper>
        </Card>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <DeltaButtonPrimary
            noPadding
          >
            Save group
          </DeltaButtonPrimary>
        </div>
      </div>
    </>
  )
}
