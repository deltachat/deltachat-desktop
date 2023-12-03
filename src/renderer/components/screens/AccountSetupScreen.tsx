import React, { useState, useContext, useEffect, useCallback } from 'react'

import { Credentials } from '../../../shared/shared-types'
import LoginForm, {
  defaultCredentials,
  ConfigureProgressDialog,
} from '../LoginForm'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
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
          fixed
        >
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
