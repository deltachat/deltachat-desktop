import C from 'deltachat-node/constants'
import React, { useContext } from 'react'
import { callDcMethodAsync } from '../ipc'
import { ipcRenderer } from 'electron'
import { ScreenContext } from '../contexts'
import { useChatStore } from '../stores/chat'
import {
  Menu,
  MenuItem
} from '@blueprintjs/core'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEditGroupDialog
} from './helpers/ChatMethods'

export default function DeltaMenu (props) {
  const {
    selectedChat,
    showArchivedChats
  } = props
  const chatStoreDispatch = useChatStore()[1]

  const tx = window.translate

  const screenContext = useContext(ScreenContext)

  let chatMenu = <div />

  const onCreateChat = () => screenContext.openDialog('CreateChat', {})
  const onEditGroup = () => openEditGroupDialog(screenContext, selectedChat)
  const onLeaveGroup = () => openLeaveChatDialog(screenContext, selectedChat.id)
  const onArchiveChat = archive => archiveChat(selectedChat.id, archive)
  const onBlockContact = () => openBlockContactDialog(screenContext, selectedChat)
  const onDeleteChat = () => openDeleteChatDialog(screenContext, selectedChat)
  const onUnblockContacts = () => screenContext.openDialog('UnblockContacts', {})
  const onContactRequests = () => chatStoreDispatch({ type: 'SELECT_CHAT', payload: C.DC_CHAT_ID_DEADDROP })
  const logout = () => {
    if (selectedChat) {
      chatStoreDispatch({ type: 'UI_UNSELECT_CHAT' })
    }
    ipcRenderer.send('logout')
  }

  if (selectedChat && selectedChat.id && !selectedChat.isDeaddrop) {
    const {
      isGroup,
      selfInGroup,
      isSelfTalk,
      isDeviceChat
    } = selectedChat

    chatMenu = [
      <Menu.Divider key='divider1' />,
      showArchivedChats
        ? <MenuItem key='archive' text={tx('menu_unarchive_chat')}
          onClick={() => onArchiveChat(false)} />
        : <MenuItem key='unarchive' text={tx('menu_archive_chat')}
          onClick={() => onArchiveChat(true)} />,
      <MenuItem
        key='delete'
        text={tx('menu_delete_chat')}
        onClick={onDeleteChat} />,
      isGroup && selfInGroup && <>
        <MenuItem
          key='edit'
          text={tx('menu_edit_group')}
          onClick={onEditGroup}
        />
        <MenuItem
          key='leave'
          onClick={onLeaveGroup}
        />
      </>,
      !isGroup && !(isSelfTalk || isDeviceChat) && <MenuItem
        key='block'
        text={tx('menu_block_contact')}
        onClick={onBlockContact}
      />,
      <Menu.Divider key='divider2' />
    ]
  } else {
    chatMenu = <Menu.Divider />
  }

  return (<Menu>
    <MenuItem key='chat' text={tx('menu_new_chat')} onClick={() => onCreateChat(screenContext)} />
    <MenuItem
      key='request'
      text={tx('menu_deaddrop')}
      onClick={onContactRequests}
    />
    <MenuItem
      key='qr'
      text={tx('qrshow_join_contact_title')}
      onClick={async () => {
        const qrCode = await callDcMethodAsync('chat.getQrCode', 0)
        screenContext.openDialog('QrInviteCode', { qrCode })
      }}
    />
    {chatMenu}
    <MenuItem
      key='settings'
      text={tx('menu_settings')}
      onClick={() => screenContext.openDialog('Settings')}
    />
    <MenuItem
      key='unblock'
      text={tx('pref_blocked_contacts')}
      onClick={onUnblockContacts}
    />
    <MenuItem
      key='help'
      text={tx('menu_help')}
      id='help-page-link'
      onClick={() => screenContext.openDialog('HelpPage')}
    />
    <MenuItem key='logout' text={tx('switch_account_desktop')} onClick={logout} />
  </Menu>)
}
