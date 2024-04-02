import React, { useState, useEffect, useCallback } from 'react'

import { Credentials } from '../../../shared/shared-types'
import LoginForm, {
  defaultCredentials,
  ConfigureProgressDialog,
} from '../LoginForm'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useAccount from '../../hooks/useAccount'
import useDialog from '../../hooks/useDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function AccountSetupScreen() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { accountId, selectAccount } = useAccount()

  const [credentials, setCredentials] =
    useState<Credentials>(defaultCredentials())

  const onLogin = useCallback(() => {
    if (!accountId) {
      return
    }

    openDialog(ConfigureProgressDialog, {
      credentials,
      onSuccess: () => {
        selectAccount(accountId)
        window.__updateAccountListSidebar?.()
      },
    })
  }, [accountId, openDialog, selectAccount, credentials])

  const onCancel = () => {
    if (!accountId) {
      return
    }

    selectAccount(accountId)
  }

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'Enter') {
        ev.stopPropagation()
        ev.preventDefault()
        onLogin()
      }
    },
    [onLogin]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  return (
    <div className='login-screen'>
      <div className='window'>
        <Dialog onClose={() => {}} fixed>
          <DialogHeader title={tx('login_explain')} />
          <DialogBody>
            <DialogContent>
              <div className='login'>
                <LoginForm
                  credentials={credentials}
                  setCredentials={setCredentials}
                />
              </div>
            </DialogContent>
          </DialogBody>
          <DialogFooter>
            <FooterActions>
              <FooterActionButton onClick={onCancel}>
                {tx('cancel')}
              </FooterActionButton>
              <FooterActionButton onClick={onLogin}>
                {tx('login_title')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  )
}
