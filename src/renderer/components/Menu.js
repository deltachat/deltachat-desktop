import React, { useContext } from 'react'
import { callDcMethod } from '../ipc'
import { ipcRenderer } from 'electron'
import ScreenContext from '../contexts/ScreenContext'

import {
  Menu,
  MenuItem
} from '@blueprintjs/core'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEncryptionInfoDialog,
  openEditGroupDialog
} from './helpers/ChatMethods'

export default function DeltaMenu (props) {
  const {
    selectedChat,
    showArchivedChats
  } = props

  const tx = window.translate

  const isGroup = selectedChat && selectedChat.isGroup
  const screenContext = useContext(ScreenContext)

  let chatMenu = <div />

  const onCreateChat = () => screenContext.openDialog('CreateChat', {})
  const onEditGroup = () => openEditGroupDialog(screenContext, selectedChat) 
  const onLeaveGroup = () => openLeaveChatDialog(screenContext, selectedChat.id)
  const onArchiveChat = archive => archiveChat(selectedChat.id, archive)
  const onBlockContact = () => openBlockContactDialog(screenContext, selectedChat)
  const onDeleteChat = () => openDeleteChatDialog(screenContext, selectedChat.id)
  const onUnblockContacts = () => screenContext.changeScreen('UnblockContacts')
  const onContactRequests = () => callDcMethod('contactRequests')
  const logout = () => ipcRenderer.send('logout')
  const onEncrInfo = () => openEncryptionInfoDialog(screenContext, selectedChat)

  if (selectedChat && !selectedChat.isDeaddrop) {
    chatMenu = <div>
      <Menu.Divider />
      {showArchivedChats
        ? <MenuItem icon='export' text={tx('menu_unarchive_chat')}
          onClick={() => onArchiveChat(false)} />
        : <MenuItem icon='import' text={tx('menu_archive_chat')}
          onClick={() => onArchiveChat(true)} />
      }
      <MenuItem
        icon='delete'
        text={tx('menu_delete_chat')}
        onClick={onDeleteChat} />
      {!isGroup &&
        <MenuItem
          icon='lock'
          text={tx('encryption_info_desktop')}
          onClick={onEncrInfo} />
      }
      {isGroup
        ? (
          <div>
            <MenuItem
              icon='edit'
              text={tx('menu_edit_group')}
              onClick={onEditGroup}
            />
            <MenuItem
              icon='log-out' text={tx('menu_leave_group')}
              onClick={onLeaveGroup}
            />
          </div>
        ) : <MenuItem
          icon='blocked-person'
          text={tx('menu_block_contact')}
          onClick={onBlockContact}
        />
      }
      <Menu.Divider />
    </div>
  } else {
    chatMenu = <Menu.Divider />
  }

  return (<Menu>
    <MenuItem icon='plus' text={tx('menu_new_chat')} onClick={() => onCreateChat(screenContext)} />
    {chatMenu}
    <MenuItem
      icon='settings'
      text={tx('menu_settings')}
      onClick={() => screenContext.openDialog('Settings')}
    />
    <MenuItem
      icon='person'
      text={tx('menu_deaddrop')}
      onClick={onContactRequests}
    />
    <MenuItem
      icon='blocked-person'
      text={tx('unblock_contacts_desktop')}
      onClick={onUnblockContacts}
    />
    <MenuItem icon='log-out' text={tx('logout_desktop')} onClick={logout} />
  </Menu>)
}
