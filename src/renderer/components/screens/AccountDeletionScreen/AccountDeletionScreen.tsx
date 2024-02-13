import React, { Component, useEffect, useState } from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { filesize } from 'filesize'

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
import { BackendRemote } from '../../../backend-com'
import { Screens } from '../../../ScreenController'
import { avatarInitial } from '../../Avatar'
import { getLogger } from '../../../../shared/logger'

const log = getLogger('AccountDeletionScreen')

export default function AccountDeletionScreen({
  selectedAccountId,
  onDeleteAccount,
}: {
  selectedAccountId: number
  onDeleteAccount: (accountId: number) => Promise<void>
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
            <DialogContent>
              <p>{tx('delete_account_ask')}</p>
              {accountInfo?.kind == 'Configured' && (
                <div className={styles.accountCard}>
                  <div className={styles.avatar}>
                    {accountInfo.profileImage ? (
                      <img
                        className={styles.content}
                        src={'file://' + accountInfo.profileImage}
                      />
                    ) : (
                      <div
                        className={styles.content}
                        style={{ backgroundColor: accountInfo.color }}
                      >
                        {avatarInitial(
                          accountInfo.displayName || '',
                          accountInfo.addr || undefined
                        )}
                      </div>
                    )}
                  </div>
                  <div className={styles.accountName}>
                    <div>
                      <b>{accountInfo.displayName}</b>
                    </div>
                    <div>{accountInfo.addr}</div>
                    <div>
                      <div className={styles.accountSize}>
                        <AccountSize accountId={accountInfo.id} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <p>
                {accountInfo &&
                  tx(
                    'delete_account_explain_with_name',
                    accountInfo.kind === 'Configured'
                      ? accountInfo.addr || undefined
                      : tx('unconfigured_account')
                  )}
              </p>
            </DialogContent>
          </DialogBody>
          <DialogFooter>
            <FooterActions>
              <FooterActionButton onClick={() => onCancel()}>
                {tx('cancel')}
              </FooterActionButton>
              <FooterActionButton
                danger={true}
                onClick={async () => onDeleteAccount(selectedAccountId)}
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

class AccountSize extends Component<{ accountId: number }, { size?: string }> {
  wasDestroyed = false
  state = { size: undefined }

  async update() {
    const bytes = await BackendRemote.rpc
      .getAccountFileSize(this.props.accountId)
      .catch(log.error)
    if (!this.wasDestroyed) {
      this.setState({ size: bytes ? filesize(bytes) : undefined })
    }
  }

  componentDidMount(): void {
    this.update()
  }

  componentWillUnmount(): void {
    this.wasDestroyed = true
  }

  render(): React.ReactNode {
    return <span>{this.state.size || '?'}</span>
  }
}
