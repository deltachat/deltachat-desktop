import classNames from 'classnames'
import React, { useContext, useEffect } from 'react'
import { ScreenContext, useTranslationFunction } from '../contexts'
import { DeltaBackend } from '../delta-remote'
import { runtime } from '../runtime'
import { Screens } from '../ScreenController'
import QrCode from './dialogs/QrCode'
import { selectChat, unselectChat } from './helpers/ChatMethods'

import { useSettingsStore } from '../stores/settings'
import { Avatar } from './Avatar'
import { C } from 'deltachat-node/node/dist/constants'
import { VERSION } from '../../shared/build-info'

export type SidebarState = 'init' | 'visible' | 'invisible'

const Sidebar = React.memo(
  ({
    sidebarState,
    setSidebarState,
  }: {
    sidebarState: SidebarState
    setSidebarState: any
  }) => {
    const screenContext = useContext(ScreenContext)
    const settings = useSettingsStore()[0]

    const onCreateChat = () => {
      setSidebarState('invisible')
      screenContext.openDialog('CreateChat', {})
    }
    const onUnblockContacts = () => {
      setSidebarState('invisible')
      screenContext.openDialog('UnblockContacts', {})
    }
    const onLogout = () => {
      setSidebarState('invisible')
      unselectChat()
      DeltaBackend.call('login.logout')
      screenContext.changeScreen(Screens.Accounts)
    }

    const onOpenHelp = () => {
      setSidebarState('invisible')
      runtime.openHelpWindow()
    }

    const onOpenSettings = () => {
      setSidebarState('invisible')
      screenContext.openDialog('Settings')
    }

    const onShowQRCode = async () => {
      setSidebarState('invisible')
      const { content: qrCode, svg: qrCodeSVG } = await DeltaBackend.call(
        'chat.getQrCodeSVG',
        0
      )
      screenContext.openDialog(QrCode, { qrCode, qrCodeSVG })
    }
    const onSelectSavedMessages = async () => {
      setSidebarState('invisible')
      const savedMessagesChatId = await DeltaBackend.call(
        'contacts.createChatByContactId',
        C.DC_CONTACT_ID_SELF
      )
      selectChat(savedMessagesChatId)
    }

    const onOpenAbout = () => {
      setSidebarState('invisible')
      screenContext.openDialog('About')
    }

    const onEscapeKeyUp = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setSidebarState('invisible')
      }
    }

    useEffect(() => {
      window.addEventListener('keyup', onEscapeKeyUp)
      return () => {
        window.removeEventListener('keyup', onEscapeKeyUp)
      }
    })

    const tx = useTranslationFunction()

    if (settings === null) return null

    return (
      <>
        {sidebarState === 'visible' && (
          <div
            className='backdrop'
            onClick={() => setSidebarState('invisible')}
          />
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
          </div>
          <div key='new_chat' className='sidebar-item' onClick={onCreateChat}>
            {tx('menu_new_chat')}
          </div>
          <div
            key='unblock'
            className='sidebar-item'
            onClick={onUnblockContacts}
          >
            {tx('pref_blocked_contacts')}
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
            <Link href='https://delta.chat' label={tx('delta_chat_desktop')} />
            <br />
            <Link
              href='https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md'
              label={tx('version') + ' ' + VERSION}
            />{' '}
            - <a onClick={onOpenAbout}>{tx('about')}</a>
          </div>
        </div>
      </>
    )
  }
)

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
