import { C } from 'deltachat-node/dist/constants'
import React, { useContext } from 'react'
import { DeltaBackend } from '../delta-remote'
import {
  ScreenContext,
  useTranslationFunction,
  SettingsContext,
} from '../contexts'
import { useChatStore } from '../stores/chat'
import { Menu } from '@blueprintjs/core'
import {
  openLeaveChatDialog,
  openDeleteChatDialog,
  openBlockContactDialog,
  openEditGroupDialog,
  setChatVisibility,
  openMuteChatDialog,
  unMuteChat,
  sendCallInvitation,
} from './helpers/ChatMethods'
import { FullChat } from '../../shared/shared-types'
import { runtime } from '../runtime'
import { Screens } from '../ScreenController'

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

  const tx = useTranslationFunction()

  const screenContext = useContext(ScreenContext)
  const settingsContext = useContext(SettingsContext)

  let chatMenu: any = <div />

  const onCreateChat = () => screenContext.openDialog('CreateChat', {})
  const onEditGroup = () => openEditGroupDialog(screenContext, selectedChat)
  const onLeaveGroup = () => openLeaveChatDialog(screenContext, selectedChat.id)
  const onBlockContact = () =>
    openBlockContactDialog(screenContext, selectedChat)
  const onDeleteChat = () =>
    openDeleteChatDialog(screenContext, selectedChat, selectedChat.id)
  const onMuteChat = () => openMuteChatDialog(screenContext, selectedChat.id)
  const onUnmuteChat = () => unMuteChat(selectedChat.id)
  const onUnblockContacts = () =>
    screenContext.openDialog('UnblockContacts', {})
  const onContactRequests = () =>
    chatStoreDispatch({ type: 'SELECT_CHAT', payload: C.DC_CHAT_ID_DEADDROP })
  const onDisappearingMessages = () =>
    screenContext.openDialog('DisappearingMessages', {
      chatId: selectedChat.id,
    })
  const onVideoChat = () => {
    screenContext.openDialog('ConfirmationDialog', {
      header: tx('videochat_invite_user_to_videochat', selectedChat.name),
      message: tx('videochat_invite_user_hint'),
      confirmLabel: tx('ok'),
      cb: (yes: boolean) => {
        if (yes) {
          sendCallInvitation(screenContext, selectedChat.id)
        }
      },
    })
  }
  const openChatAuditLog = () =>
    screenContext.openDialog('ChatAuditLogDialog', { selectedChat })
  const logout = () => {
    if (selectedChat) {
      chatStoreDispatch({ type: 'UI_UNSELECT_CHAT' })
    }
    DeltaBackend.call('login.logout')
    screenContext.changeScreen(Screens.Login)
  }

  if (selectedChat && selectedChat.id && !selectedChat.isDeaddrop) {
    const { isGroup, selfInGroup, isSelfTalk, isDeviceChat } = selectedChat

    const isReadOnlyChat = (isGroup && !selfInGroup) || isDeviceChat // setting this as var because we plan to have more readonly chats in the future

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
      settingsContext.desktopSettings.enableAVCalls && !isReadOnlyChat && (
        <DeltaMenuItem
          key='call'
          text={tx('videochat')}
          onClick={onVideoChat}
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
      !selectedChat.muted ? (
        <DeltaMenuItem key='mute' onClick={onMuteChat} text={tx('menu_mute')} />
      ) : (
        <DeltaMenuItem
          key='unmute'
          onClick={onUnmuteChat}
          text={tx('menu_unmute')}
        />
      ),
      !isReadOnlyChat && (
        <DeltaMenuItem
          key='disappearing'
          text={tx('ephemeral_messages')}
          onClick={onDisappearingMessages}
        />
      ),
      !(isSelfTalk || isDeviceChat) &&
        settingsContext.desktopSettings.enableChatAuditLog && (
          <DeltaMenuItem
            key='chat-audit-log'
            text={tx('menu_chat_audit_log')}
            onClick={openChatAuditLog}
          />
        ),
      <Menu.Divider key='divider-2' />,
    ]
  } else {
    chatMenu = <Menu.Divider key='divider-3' />
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
        text={tx('qr_code')}
        onClick={async () => {
          const qrCode = await DeltaBackend.call('chat.getQrCode', 0)
          screenContext.openDialog('QrCode', { qrCode })
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
        onClick={_ => runtime.openHelpWindow()}
      />
      <DeltaMenuItem
        key='logout'
        text={tx('switch_account')}
        onClick={logout}
      />
    </Menu>
  )
}
