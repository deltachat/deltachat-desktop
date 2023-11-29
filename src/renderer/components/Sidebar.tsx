import classNames from 'classnames'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { ScreenContext, useTranslationFunction } from '../contexts'
import { runtime } from '../runtime'
import { Screens, selectedAccountId } from '../ScreenController'
import QrCode from './dialogs/QrCode'
import { selectChat, unselectChat } from './helpers/ChatMethods'
import { useSettingsStore } from '../stores/settings'
import { Avatar } from './Avatar'
import { VERSION } from '../../shared/build-info'
import { ActionEmitter, KeybindAction } from '../keybindings'
import SettingsConnectivityDialog from './dialogs/Settings-Connectivity'
import { debounceWithInit } from './chat/ChatListHelpers'
import {
  BackendRemote,
  EffectfulBackendActions,
  onDCEvent,
} from '../backend-com'
import { useSidebar } from './MainScreen/hooks/useSidebar'
import { useMainView } from './MainScreen/hooks/useMainView'

const Sidebar = React.memo(() => {
  const screenContext = useContext(ScreenContext)
  const { hideSidebar, sidebarState } = useSidebar()
  const { switchToGlobalGallery, switchToArchive } = useMainView()

  const settings = useSettingsStore()[0]
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const onCreateChat = () => {
    hideSidebar()
    screenContext.openDialog('CreateChat', {})
  }

  const onUnblockContacts = () => {
    hideSidebar()
    screenContext.openDialog('UnblockContacts', {})
  }

  const onLogout = async () => {
    hideSidebar()
    unselectChat()
    await EffectfulBackendActions.logout()
    screenContext.changeScreen(Screens.AccountList)
  }

  const onOpenHelp = () => {
    hideSidebar()
    runtime.openHelpWindow()
  }

  const onOpenConnectivity = () => {
    hideSidebar()
    screenContext.openDialog(SettingsConnectivityDialog)
  }

  const onOpenSettings = () => {
    hideSidebar()
    ActionEmitter.emitAction(KeybindAction.Settings_Open)
  }

  const onShowQRCode = async () => {
    hideSidebar()
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    screenContext.openDialog(QrCode, { qrCode, qrCodeSVG })
  }

  const onSelectSavedMessages = async () => {
    hideSidebar()
    const savedMessagesChatId = await BackendRemote.rpc.createChatByContactId(
      accountId,
      C.DC_CONTACT_ID_SELF
    )
    selectChat(savedMessagesChatId)
  }

  const onOpenAbout = () => {
    hideSidebar()
    screenContext.openDialog('About')
  }

  const onOpenArchivedChats = () => {
    hideSidebar()
    switchToArchive()

    // @TODO: Also reset search query here + move it all into a more business logic part (since we can also trigger archive screen via keybindings)
  }

  const onOpenGlobalGallery = () => {
    hideSidebar()
    switchToGlobalGallery()
  }

  useEffect(() => {
    const onEscapeKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideSidebar()
      }
    }

    window.addEventListener('keyup', onEscapeKeyUp)

    return () => {
      window.removeEventListener('keyup', onEscapeKeyUp)
    }
  }, [hideSidebar])

  if (settings === null) return null

  return (
    <>
      {sidebarState === 'visible' && (
        <div className='backdrop' onClick={hideSidebar} />
      )}
      <div
        className={classNames(
          'sidebar',
          sidebarState === 'init'
            ? {}
            : {
                visible: sidebarState === 'visible',
                invisible: sidebarState === 'invisible',
              }
        )}
      >
        <div className='account'>
          <Avatar
            addr={settings.selfContact.address}
            displayName={settings.settings.displayname || ''}
            color={settings.selfContact.color}
            avatarPath={settings.selfContact.profileImage}
          />
          <div key='qr' className='quickIcon last' onClick={onShowQRCode}>
            <div className='icon qr' />
          </div>
          <div
            key='savedMessages'
            className='quickIcon '
            onClick={onSelectSavedMessages}
          >
            <div className='icon savedMessages' />
          </div>
          <div className='displayname'>{settings.settings.displayname}</div>
          <div className='emailAddress'>{settings.settings.addr}</div>
          <div className='connectivity' onClick={onOpenConnectivity}>
            <SidebarConnectivity />
          </div>
        </div>
        <div key='new_chat' className='sidebar-item' onClick={onCreateChat}>
          {tx('menu_new_chat')}
        </div>
        <div key='unblock' className='sidebar-item' onClick={onUnblockContacts}>
          {tx('pref_blocked_contacts')}
        </div>
        <div
          key='archived_chats'
          className='sidebar-item'
          onClick={onOpenArchivedChats}
        >
          {tx('chat_archived_chats_title')}
        </div>
        <div
          key='global_gallery'
          className='sidebar-item'
          onClick={onOpenGlobalGallery}
        >
          {tx('menu_all_media')}
        </div>
        <div key='settings' className='sidebar-item' onClick={onOpenSettings}>
          {tx('menu_settings')}
        </div>
        <div key='help' className='sidebar-item' onClick={onOpenHelp}>
          {tx('menu_help')}
        </div>
        <div key='logout' className='sidebar-item' onClick={onLogout}>
          {tx('switch_account')}
        </div>
        <div className='footer'>
          <Link href='https://delta.chat' label={'Delta Chat Desktop'} />
          <br />
          <Link
            href='https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md'
            label={'v' + VERSION}
          />{' '}
          - <a onClick={onOpenAbout}>{tx('global_menu_help_about_desktop')}</a>
        </div>
      </div>
    </>
  )
})

export function Link({
  href,
  label,
  title,
}: {
  href: string
  label?: string
  title?: string
}) {
  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    runtime.openLink(href)
  }
  return (
    <a href={href} x-target-url={href} title={title} onClick={onClick}>
      {label}
    </a>
  )
}

export default Sidebar

const SidebarConnectivity = () => {
  const [state, setState] = useState<string>('')
  const accountId = selectedAccountId()

  const onConnectivityChanged = useMemo(
    () =>
      debounceWithInit(async () => {
        const tx = window.static_translate
        const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

        if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
          setState(tx('connectivity_connected'))
        } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
          setState(tx('connectivity_updating'))
        } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
          setState(tx('connectivity_connecting'))
        } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
          setState(tx('connectivity_not_connected'))
        }
      }, 300),
    [accountId]
  )

  useEffect(
    () => onDCEvent(accountId, 'ConnectivityChanged', onConnectivityChanged),
    [onConnectivityChanged, accountId]
  )

  return <>{state}</>
}
