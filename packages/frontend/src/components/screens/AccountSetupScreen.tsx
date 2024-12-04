import React, { useState, useEffect, useCallback } from 'react'

import { Credentials } from '../../types-app'
import ImageBackdrop from '../ImageBackdrop'
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
import useDialog from '../../hooks/dialog/useDialog'
import { DialogId } from '../../contexts/DialogContext'
import AlertDialog from '../dialogs/AlertDialog'

import type ScreenController from '../../ScreenController'

export default function AccountSetupScreen({
  selectAccount,
  accountId,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  accountId: number
}) {
  const tx = useTranslationFunction()
  const { openDialog, closeDialog, hasOpenDialogs } = useDialog()
  const [promptDialogId, setPromptDialogId] = useState<null | DialogId>(null)

  const [credentials, setCredentials] =
    useState<Credentials>(defaultCredentials())

  const onClickLogin = useCallback(
    () =>
      openDialog(ConfigureProgressDialog, {
        credentials,
        onSuccess: () => {
          selectAccount(accountId)
        },
        onFail: (error: string) =>
          setPromptDialogId(
            openDialog(AlertDialog, {
              message: error,
              cb: () => setPromptDialogId(null),
            })
          ),
      }),
    [accountId, openDialog, selectAccount, credentials]
  )

  // TODO(maxph): we're now using <dialog> and can submit result via input
  // and not an explicit keyboard handling
  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.code === 'Enter') {
        ev.stopPropagation()
        ev.preventDefault()
        if (hasOpenDialogs) {
          if (promptDialogId !== null) {
            closeDialog(promptDialogId)
          }
        } else {
          onClickLogin()
        }
      }
    },
    [onClickLogin, hasOpenDialogs, closeDialog, promptDialogId]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  const onCancel = () => selectAccount(accountId)

  return (
    <ImageBackdrop variant='welcome'>
      <Dialog canOutsideClickClose={false} onClose={() => {}} fixed>
        <DialogHeader title={tx('login_explain')} />
        <DialogBody>
          <DialogContent>
            <LoginForm
              credentials={credentials}
              setCredentials={setCredentials}
            />
          </DialogContent>
        </DialogBody>
        <DialogFooter>
          <FooterActions>
            <FooterActionButton onClick={onCancel}>
              {tx('cancel')}
            </FooterActionButton>
            <FooterActionButton onClick={onClickLogin}>
              {tx('login_title')}
            </FooterActionButton>
          </FooterActions>
        </DialogFooter>
      </Dialog>
    </ImageBackdrop>
  )
}
