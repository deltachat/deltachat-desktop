import { C } from 'deltachat-node/dist/constants'
import React, { useContext } from 'react'
import { callDcMethodAsync, openHelp } from '../ipc'
import { ScreenContext } from '../contexts'
import { useChatStore } from '../stores/chat'
import {
  Menu
} from '@blueprintjs/core'
import {
  archiveChat,
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEditGroupDialog
} from './helpers/ChatMethods'
const { ipcRenderer } = window.electron_functions

export function DeltaMenuItem ({ text, onClick }) {
  return (
    <li onClick={onClick}>
      <a className='bp3-menu-item bp3-popover-dismiss'>
        <div className='bp3-text-overflow-ellipsis bp3-fill'>
          {text}
        </div>
      </a>
    </li>
  )
}

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
        ? <DeltaMenuItem key='archive' text={tx('menu_unarchive_chat')}
          onClick={() => onArchiveChat(false)} />
        : <DeltaMenuItem key='unarchive' text={tx('menu_archive_chat')}
          onClick={() => onArchiveChat(true)} />,
      <DeltaMenuItem
        key='delete'
        text={tx('menu_delete_chat')}
        onClick={onDeleteChat} />,
      isGroup && selfInGroup && <>
        <DeltaMenuItem
          key='edit'
          text={tx('menu_edit_group')}
          onClick={onEditGroup}
        />
        <DeltaMenuItem
          key='leave'
          text={tx('menu_leave_group')}
          onClick={onLeaveGroup}
        />
      </>,
      !isGroup && !(isSelfTalk || isDeviceChat) && <DeltaMenuItem
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
    <DeltaMenuItem key='chat' text={tx('menu_new_chat')} onClick={() => onCreateChat(screenContext)} />
    <DeltaMenuItem
      key='request'
      text={tx('menu_deaddrop')}
      onClick={onContactRequests}
    />
    <DeltaMenuItem
      key='qr'
      text={tx('qrshow_join_contact_title')}
      onClick={async () => {
        const qrCode = await callDcMethodAsync('chat.getQrCode', 0)
        screenContext.openDialog('QrInviteCode', { qrCode })
      }}
    />
    {chatMenu}
    <DeltaMenuItem
      key='settings'
      text={tx('menu_settings')}
      onClick={() => screenContext.openDialog('Settings')}
    />
    <DeltaMenuItem
      key='unblock'
      text={tx('pref_blocked_contacts')}
      onClick={onUnblockContacts}
    />
    <DeltaMenuItem
      key='help'
      text={tx('menu_help')}
      id='help-page-link'
      onClick={() => openHelp()}
    />
    <DeltaMenuItem key='logout' text={tx('switch_account_desktop')} onClick={logout} />
  </Menu>)
}
