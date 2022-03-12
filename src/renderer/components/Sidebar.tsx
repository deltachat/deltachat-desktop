import classNames from 'classnames'
import React, {useContext} from 'react'
import {ScreenContext, useTranslationFunction} from '../contexts'
import {DeltaBackend} from '../delta-remote'
import {runtime} from '../runtime'
import {Screens} from '../ScreenController'
import QrCode from './dialogs/QrCode'
import {unselectChat} from './helpers/ChatMethods'

export type SidebarState = 'init' | 'visible' | 'invisible'

const Sidebar = React.memo(({sidebarState, setSidebarState} : {sidebarState: SidebarState, setSidebarState: any})  => { 
  const screenContext = useContext(ScreenContext)

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

  const tx = useTranslationFunction()

  return ( 
    <>
      {sidebarState === 'visible' && <div className="backdrop" onClick={() => setSidebarState('invisible')}/>}
      <div className={classNames("sidebar", sidebarState === 'init' ? {} : {visible: sidebarState === 'visible', invisible: sidebarState === 'invisible'})} >
        <div key='new_chat' className="sidebar-item" onClick={onCreateChat}>{tx('menu_new_chat')}</div>
        <div key='unblock'  className="sidebar-item" onClick={onUnblockContacts}>{tx('pref_blocked_contacts')}</div>
        <div key='qr'       className="sidebar-item" onClick={onShowQRCode}>{tx('qr_code')}</div>
        <div key='settings' className="sidebar-item" onClick={onOpenSettings}>{tx('menu_settings')}</div>
        <div key='help'     className="sidebar-item" onClick={onOpenHelp}>{tx('menu_help')}</div>
        <div key='logout'   className="sidebar-item" onClick={onLogout}>{tx('switch_account')}</div>
      </div>
    </>
  )
})

export default Sidebar
