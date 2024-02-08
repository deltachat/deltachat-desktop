import { C, T } from '@deltachat/jsonrpc-client'
import { filesize } from 'filesize'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './styles.module.scss'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { getLogger } from '../../../../shared/logger'
import { runtime } from '../../../runtime'
import { debounceWithInit } from '../../chat/ChatListHelpers'

const log = getLogger('AccountListSidebar/AccountHoverInfo')

export function AccountHoverInfo({
  account,
  isSelected,
}: {
  account: T.Account
  isSelected: boolean
}) {
  const tx = window.static_translate
  const [loadedAccount, setLoadedAccount] = useState(account)
  const [accountSize, setSize] = useState<string>('?')
  const [bgSyncDisabled, setBgSyncDisabled] = useState<boolean>(false)
  useEffect(() => {
    BackendRemote.rpc
      .getAccountFileSize(account.id)
      .catch(log.error)
      .then(bytes => {
        bytes && setSize(filesize(bytes))
      })
    runtime.getDesktopSettings().then(({ syncAllAccounts }) => {
      setBgSyncDisabled(!syncAllAccounts)
    })
    BackendRemote.rpc
      .getAccountInfo(account.id)
      .then(setLoadedAccount)
      .catch(log.error)
  }, [account.id])

  const showConnection = isSelected || !bgSyncDisabled

  let content: JSX.Element

  if (loadedAccount.kind === 'Unconfigured') {
    content = (
      <>
        <b>Unconfigured Account</b>
        <div className={styles.HoverInfoProperty}>
          {tx('unconfigured_account_hint')}
        </div>
      </>
    )
  } else {
    content = (
      <>
        <b>
          {loadedAccount.displayName
            ? loadedAccount.displayName
            : loadedAccount.addr}
        </b>
        {showConnection && (
          <div className={styles.HoverInfoProperty}>
            <Connectivity accountId={account.id} />
          </div>
        )}
        {bgSyncDisabled && (
          <div className={styles.HoverInfoProperty}>
            ⏻ {tx("background_sync_disabled_explaination")}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={styles.AccountHoverInfo} role='tooltip'>
      {content}
      <div className={styles.HoverInfoFooter}>
        <span>{accountSize}</span> - {account.id}
      </div>
    </div>
  )
}

const Connectivity = ({ accountId }: { accountId: number }) => {
  const [[color, label], setState] = useState<[string, string]>(['grey', '?'])

  const onConnectivityChanged = useMemo(
    () =>
      debounceWithInit(async () => {
        const tx = window.static_translate
        const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

        if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
          setState(['green', tx('connectivity_connected')])
        } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
          setState(['lightgreen', tx('connectivity_updating')])
        } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
          setState(['orange', tx('connectivity_connecting')])
        } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
          setState(['red', tx('connectivity_not_connected')])
        }
      }, 300),
    [accountId]
  )

  useEffect(() => {
    onConnectivityChanged()
    return onDCEvent(accountId, 'ConnectivityChanged', onConnectivityChanged)
  }, [onConnectivityChanged, accountId])

  return (
    <>
      <div
        className={styles.ConnectivityDot}
        style={{ backgroundColor: color }}
      ></div>{' '}
      {label}
    </>
  )
}
