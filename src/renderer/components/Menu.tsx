import { C } from 'deltachat-node/dist/constants'
import React, { useContext } from 'react'
import { openHelp } from '../ipc'
import { DeltaBackend } from '../delta-remote'
import { ScreenContext } from '../contexts'
import { useChatStore } from '../stores/chat'
import { Menu } from '@blueprintjs/core'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEditGroupDialog,
  setChatVisibility,
} from './helpers/ChatMethods'
import { FullChat } from '../../shared/shared-types'
const { ipcRenderer } = window.electron_functions

export function DeltaMenuItem({
  text,
  onClick,
}: {
  text: string
  onClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
}) {
  return (
    <li onClick={onClick}>
      <a className='bp3-menu-item bp3-popover-dismiss'>
        <div className='bp3-text-overflow-ellipsis bp3-fill'>{text}</div>
      </a>
    </li>
  )
}

export default function DeltaMenu(props: { selectedChat: FullChat }) {
  const { selectedChat } = props
  const chatStoreDispatch = useChatStore()[1]

  const tx = window.translate

  const screenContext = useContext(ScreenContext)

  let chatMenu: any = <div />

  const onCreateChat = () => screenContext.openDialog('CreateChat', {})
  const onEditGroup = () => openEditGroupDialog(screenContext, selectedChat)
  const onLeaveGroup = () => openLeaveChatDialog(screenContext, selectedChat.id)
  const onBlockContact = () =>
    openBlockContactDialog(screenContext, selectedChat)
  const onDeleteChat = () => openDeleteChatDialog(screenContext, selectedChat)
  const onUnblockContacts = () =>
    screenContext.openDialog('UnblockContacts', {})
  const onContactRequests = () =>
    chatStoreDispatch({ type: 'SELECT_CHAT', payload: C.DC_CHAT_ID_DEADDROP })
  const logout = () => {
    if (selectedChat) {
      chatStoreDispatch({ type: 'UI_UNSELECT_CHAT' })
    }
    ipcRenderer.send('logout')
  }

  if (selectedChat && selectedChat.id && !selectedChat.isDeaddrop) {
    const { isGroup, selfInGroup, isSelfTalk, isDeviceChat } = selectedChat

    chatMenu = [
      <Menu.Divider key='divider1' />,
      selectedChat.archived ? (
        <DeltaMenuItem
          key='unarchive'
          text={tx('menu_unarchive_chat')}
          onClick={() =>
            setChatVisibility(
              selectedChat.id,
              C.DC_CHAT_VISIBILITY_NORMAL,
              true
            )
          }
        />
      ) : (
        <DeltaMenuItem
          key='archive'
          text={tx('menu_archive_chat')}
          onClick={() =>
            setChatVisibility(
              selectedChat.id,
              C.DC_CHAT_VISIBILITY_ARCHIVED,
              true
            )
          }
        />
      ),
      <DeltaMenuItem
        key='delete'
        text={tx('menu_delete_chat')}
        onClick={onDeleteChat}
      />,
      isGroup && selfInGroup && (
        <span key='groupitems'>
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
        </span>
      ),
      !isGroup && !(isSelfTalk || isDeviceChat) && (
        <DeltaMenuItem
          key='block'
          text={tx('menu_block_contact')}
          onClick={onBlockContact}
        />
      ),
      <Menu.Divider key='divider2' />,
    ]
  } else {
    chatMenu = <Menu.Divider />
  }

  return (
    <Menu>
      <DeltaMenuItem
        key='chat'
        text={tx('menu_new_chat')}
        onClick={onCreateChat}
      />
      <DeltaMenuItem
        key='request'
        text={tx('menu_deaddrop')}
        onClick={onContactRequests}
      />
      <DeltaMenuItem
        key='qr'
        text={tx('qrshow_join_contact_title')}
        onClick={async () => {
          const qrCode = await DeltaBackend.call('chat.getQrCode', 0)
          screenContext.openDialog('QrInviteCode', { qrCode })
        }}
      />
      <DeltaMenuItem
        key='importqr'
        text={tx('qrscan_title')}
        onClick={async () => {
          screenContext.openDialog('ImportQrCode')
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
      <DeltaMenuItem key='help' text={tx('menu_help')} onClick={openHelp} />
      <DeltaMenuItem
        key='logout'
        text={tx('switch_account_desktop')}
        onClick={logout}
      />
    </Menu>
  )
}
