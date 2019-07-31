import React, { useContext } from 'react'
import { ipcRenderer } from 'electron'
import ScreenContext from '../contexts/ScreenContext'

import {
  Menu,
  MenuItem
} from '@blueprintjs/core'

export default function DeltaMenu (props) {
  const {
    selectedChat,
    showArchivedChats
  } = props

  const tx = window.translate

  const isGroup = selectedChat && selectedChat.isGroup
  const screenContext = useContext(ScreenContext)

  let chatMenu = <div />

  const onCreateChat = () => screenContext.changeScreen('CreateChat')

  const onEditGroup = () => screenContext.changeScreen('EditGroup', { chat: selectedChat })

  const onLeaveGroup = () => {
    const tx = window.translate
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_leave_group'),
      cb: yes => {
        if (yes) {
          ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'leaveGroup', selectedChat.id)
        }
      } })
  }

  const onArchiveChat = archive => ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'archiveChat', selectedChat.id, archive)

  const onBlockContact = () => {
    const tx = window.translate
    if (selectedChat && selectedChat.contacts.length) {
      var contact = selectedChat.contacts[0]
      screenContext.openDialog('ConfirmationDialog', {
        message: tx('ask_block_contact'),
        cb: yes => {
          if (yes) {
            ipcRenderer.send('blockContact', contact.id)
          }
        } })
    }
  }

  const onDeleteChat = () => {
    const tx = window.translate
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_delete_chat_desktop'),
      cb: yes => {
        if (yes) {
          ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'deleteChat', selectedChat.id)
        }
      } })
  }

  const onUnblockContacts = () => screenContext.changeScreen('UnblockContacts')

  const onContactRequests = () => ipcRenderer.send('EVENT_DC_FUNCTION_CALL', 'contactRequests')

  const logout = () => ipcRenderer.send('logout')

  const onEncrInfo = () => screenContext.openDialog('EncrInfo', { chat: selectedChat })

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
      <MenuItem
        icon='lock'
        text={tx('encryption_info_desktop')}
        onClick={onEncrInfo} />
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
