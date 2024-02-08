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
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'

import type ScreenController from '../../ScreenController'

export default function AccountSetupScreen({
  selectAccount,
  accountId,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  accountId: number
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const [credentials, setCredentials] =
    useState<Credentials>(defaultCredentials())

  const onClickLogin = useCallback(
    () =>
      openDialog(ConfigureProgressDialog, {
        credentials,
        onSuccess: () => {
          selectAccount(accountId)
          window.__updateAccountListSidebar?.()
        },
      }),
    [accountId, openDialog, selectAccount, credentials]
  )

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'Enter') {
        onClickLogin()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    [onClickLogin]
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
              <FooterActionButton onClick={() => selectAccount(accountId)}>
                {tx('cancel')}
              </FooterActionButton>
              <FooterActionButton onClick={onClickLogin}>
                {tx('login_title')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  )
}
