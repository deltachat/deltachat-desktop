import React, { useState, useContext, useEffect, useCallback } from 'react'

import { Credentials } from '../../../shared/shared-types'
import LoginForm, {
  defaultCredentials,
  ConfigureProgressDialog,
} from '../LoginForm'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import Dialog, {
  DialogBody,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from '../Dialog'

import type ScreenController from '../../ScreenController'

export default function AccountSetupScreen({
  selectAccount,
  accountId,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  accountId: number
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

  const [credentials, setCredentials] =
    useState<Credentials>(defaultCredentials())

  const onClickLogin = useCallback(
    () =>
      openDialog(ConfigureProgressDialog, {
        credentials,
        onSuccess: () => selectAccount(accountId),
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
        <Dialog
          isOpen={true}
          backdropProps={{ className: 'no-backdrop' }}
          onClose={() => {}}
          fixed={true}
        >
          <DialogHeader title={tx('login_explain')} />
          <DialogBody>
            <div className='login'>
              <LoginForm
                credentials={credentials}
                setCredentials={setCredentials}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <FooterActions>
              <p
                id='action-cancel'
                className={'delta-button bold primary'}
                onClick={() => selectAccount(accountId)}
              >
                {tx('cancel')}
              </p>
              <p
                id='action-login'
                className={'delta-button bold primary'}
                onClick={onClickLogin}
              >
                {tx('login_title')}
              </p>
            </FooterActions>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  )
}
