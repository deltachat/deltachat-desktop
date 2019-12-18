import C from 'deltachat-node/constants'
import React, { useContext } from 'react'
import { callDcMethodAsync } from '../ipc'
import { ipcRenderer } from 'electron'
import ScreenContext from '../contexts/ScreenContext'
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
  openEncryptionInfoDialog,
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
  const onEncrInfo = () => openEncryptionInfoDialog(screenContext, selectedChat)

  if (selectedChat && selectedChat.id && !selectedChat.isDeaddrop) {
    const {
      isGroup,
      selfInGroup,
      isSelfTalk,
      isDeviceChat
    } = selectedChat

    chatMenu = [
      <Menu.Divider />,
      showArchivedChats
        ? <MenuItem icon='export' text={tx('menu_unarchive_chat')}
          onClick={() => onArchiveChat(false)} />
        : <MenuItem icon='import' text={tx('menu_archive_chat')}
          onClick={() => onArchiveChat(true)} />,
      <MenuItem
        icon='delete'
        text={tx('menu_delete_chat')}
        onClick={onDeleteChat} />,
      !isGroup && !isDeviceChat && <MenuItem
        icon='lock'
        text={tx('encryption_info_desktop')}
        onClick={onEncrInfo} />,
      isGroup && selfInGroup && <>
        <MenuItem
          icon='edit'
          text={tx('menu_edit_group')}
          onClick={onEditGroup}
        />
        <MenuItem
          icon='log-out' text={tx('menu_leave_group')}
          onClick={onLeaveGroup}
        />
      </>,
      !isGroup && !(isSelfTalk || isDeviceChat) && <MenuItem
        icon='blocked-person'
        text={tx('menu_block_contact')}
        onClick={onBlockContact}
      />,
      <Menu.Divider />
    ]
  } else {
    chatMenu = <Menu.Divider />
  }

  return (<Menu>
    <MenuItem icon='plus' text={tx('menu_new_chat')} onClick={() => onCreateChat(screenContext)} />
    {chatMenu}
    <MenuItem
      icon='camera'
      text={tx('qrshow_join_contact_title')}
      onClick={async () => {
        const qrCode = await callDcMethodAsync('chat.getQrCode', 0)
        screenContext.openDialog('QrInviteCode', { qrCode })
      }}
    />
    <MenuItem
      icon='person'
      text={tx('menu_deaddrop')}
      onClick={onContactRequests}
    />
    <MenuItem
      icon='blocked-person'
      text={tx('pref_blocked_contacts')}
      onClick={onUnblockContacts}
    />
    <MenuItem
      icon='settings'
      text={tx('menu_settings')}
      onClick={() => screenContext.openDialog('Settings')}
    />
    <MenuItem icon='log-out' text={tx('switch_account_desktop')} onClick={logout} />
  </Menu>)
}
