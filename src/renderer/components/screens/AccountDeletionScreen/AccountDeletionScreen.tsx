import React, { useEffect, useState } from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../../Dialog'

import styles from './styles.module.scss'
import { T } from '@deltachat/jsonrpc-client'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import { Screens } from '../../../ScreenController'

export function AccountDeletionScreen({
  selectedAccountId,
  onUnSelectAccount,
}: {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
}) {
  const tx = useTranslationFunction()

  const [accountInfo, setAccountInfo] = useState<null | T.Account>()

  useEffect(() => {
    BackendRemote.rpc.getAccountInfo(selectedAccountId).then(setAccountInfo)
  }, [selectedAccountId])

  const onCancel = () => {
    if (!accountInfo) {
      return
    }
    if (accountInfo.kind === 'Configured') {
      window.__changeScreen(Screens.Main)
    } else {
      window.__changeScreen(Screens.Welcome)
    }
  }

  return (
    <div className={styles.AccountDeletionScreen}>
      <div className={styles.Background}>
        <Dialog
          backdropProps={{ className: 'no-backdrop' }}
          canEscapeKeyClose={true}
          fixed={true}
          onClose={() => {}}
          width={400}
        >
          <DialogHeader
            onClickBack={accountInfo ? onCancel : undefined}
            title={tx('delete_account')}
          />
          <DialogBody>
            <DialogContent paddingTop={false}>
              {tx('delete_account_ask')}
              {accountInfo && (
                <div>
                  {tx(
                    'delete_account_explain_with_name',
                    accountInfo.kind === 'Configured'
                      ? accountInfo.addr || undefined
                      : 'Unconfigured'
                  )}
                </div>
              )}
            </DialogContent>
          </DialogBody>
          <DialogFooter>
            <FooterActions>
              <FooterActionButton onClick={() => onCancel()}>
                {tx('cancel')}
              </FooterActionButton>
              <FooterActionButton
                danger={true}
                onClick={async () => {
                  await onUnSelectAccount()
                  await EffectfulBackendActions.removeAccount(selectedAccountId)
                }}
              >
                {tx('delete')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  )
}
