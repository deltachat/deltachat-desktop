import React from 'react'

import { avatarInitial } from '@deltachat-desktop/shared/avatarInitial'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getConfiguredAccounts } from '../../backend/account'
import Dialog, { DialogBody, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { selectedAccountId } from '../../ScreenController'

import type { DialogProps } from '../../contexts/DialogContext'

import styles from './SelectAccountDialog.module.scss'
import { useRpcFetch } from '../../hooks/useFetch'
import { unknownErrorToString } from '../helpers/unknownErrorToString'

type Props = {
  onSelect: (accountId: number) => void
} & DialogProps

export default function SelectAccountDialog({ onSelect, onClose }: Props) {
  const tx = useTranslationFunction()

  const accountsFetch = useRpcFetch(getConfiguredAccounts, [])

  const handleAccountClick = (accountId: number) => {
    onSelect(accountId)
    onClose()
  }

  return (
    <Dialog width={350} onClose={onClose} dataTestid='select-account-dialog'>
      <DialogHeader
        onClose={onClose}
        title={tx('switch_account')}
        className={styles.dialogHeader}
      />
      <DialogBody className={styles.dialogBody}>
        {accountsFetch.loading ? (
          <div className={styles.loading}>{tx('loading')}</div>
        ) : !accountsFetch.result.ok ? (
          <div>
            {tx('error_x', unknownErrorToString(accountsFetch.result?.err))}
          </div>
        ) : (
          <ul className={styles.accountList}>
            {accountsFetch.result.value
              .filter(account => account.id !== selectedAccountId())
              .map(account => (
                <li key={account.id}>
                  <button
                    type='button'
                    className={styles.accountButton}
                    onClick={() => handleAccountClick(account.id)}
                    data-testid={`account-select-${account.id}`}
                  >
                    <div className={styles.avatar}>
                      {account.kind === 'Configured' && account.profileImage ? (
                        <img
                          className={styles.avatarImage}
                          src={runtime.transformBlobURL(account.profileImage)}
                          alt=''
                        />
                      ) : (
                        <div
                          className={styles.avatarInitial}
                          style={{
                            backgroundColor:
                              account.kind === 'Configured'
                                ? account.color
                                : '#505050',
                          }}
                        >
                          {account.kind === 'Configured'
                            ? avatarInitial(
                                account.displayName || '',
                                account.addr || undefined
                              )
                            : '?'}
                        </div>
                      )}
                    </div>
                    <div className={styles.accountInfo}>
                      <div className={styles.displayName}>
                        {account.kind === 'Configured'
                          ? account.displayName || account.addr
                          : tx('unconfigured_account')}
                      </div>
                      {account.kind === 'Configured' && account.addr && (
                        <div className={styles.emailAddress}>
                          {account.addr}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </DialogBody>
    </Dialog>
  )
}
