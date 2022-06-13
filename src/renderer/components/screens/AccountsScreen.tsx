import React, { useState, useEffect } from 'react'
import { DeltaDialogBase } from '../dialogs/DeltaDialog'
import { DeltaChatAccount } from '../../../shared/shared-types'
import { DeltaBackend } from '../../delta-remote'

import type ScreenController from '../../ScreenController'

import AccountSelectionScreen from './AccountSelectionScreen'
import WelcomeScreen from './WelcomeScreen'
import AccountSetupScreen from './AccountSetupScreen'

export default function AccountsScreen({
  selectAccount,
  accountId,
  screenMode,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  accountId?: number
  screenMode?: string
}) {
  const [logins, setLogins] = useState<DeltaChatAccount[] | null>(null)

  const [accountsMode, setAccountsMode] = useState(
    screenMode ? screenMode : 'welcome'
  )

  const [syncAllAccounts, setSyncAllAccounts] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const desktopSettings = await DeltaBackend.call(
        'settings.getDesktopSettings'
      )
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    })()
  }, [])

  const refreshAccounts = async () => {
    const logins = await DeltaBackend.call('login.getAllAccounts')
    setLogins(logins)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const logins = await DeltaBackend.call('login.getAllAccounts')
      if (mounted === true) {
        setLogins(logins)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (logins === null)
    return (
      <div className='login-screen'>
        <div className='window'></div>
      </div>
    )

  return (
    <div className='login-screen'>
      <div className='window'>
        <DeltaDialogBase
          isOpen={true}
          backdropProps={{ className: 'no-backdrop' }}
          onClose={() => {}}
          fixed={true}
          canEscapeKeyClose={true}
        >
          <>
            {accountsMode === 'welcome' && (
              <WelcomeScreen
                selectAccount={selectAccount}
                showBackButton={logins && logins.length > 0 ? true : false}
                onClickBack={() => setAccountsMode('selection')}
                onAddAccount={() => setAccountsMode('setup')}
              />
            )}
            {accountsMode === 'selection' && (
              <AccountSelectionScreen
                {...{
                  refreshAccounts,
                  selectAccount,
                  logins,
                  showUnread: syncAllAccounts || false,
                  syncAllAccounts,
                  setSyncAllAccounts,
                  onAddAccount: () => setAccountsMode('welcome'),
                }}
              />
            )}
            {accountsMode === 'setup' && accountId && (
              <AccountSetupScreen
                selectAccount={selectAccount}
                accountId={accountId}
                onClickCancel={() => setAccountsMode('welcome')}
              />
            )}
          </>
        </DeltaDialogBase>
      </div>
    </div>
  )
}
