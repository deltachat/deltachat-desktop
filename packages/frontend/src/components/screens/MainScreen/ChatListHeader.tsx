import React, { useCallback, useEffect } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'
import Button from '../../Button'
import Icon from '../../Icon'
import SearchInput from '../../SearchInput'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import useProxyEnabled from '../../../hooks/useProxyEnabled'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { useRpcFetch } from '../../../hooks/useFetch'
import ProxyConfiguration from '../../dialogs/ProxyConfiguration'

type Props = {
  accountId?: number
  showArchivedChats: boolean
  onExitArchive: () => void
  searchRef: React.ClassAttributes<HTMLInputElement>['ref']
  onSearchChange: (event: { target: { value: string } }) => void
  onSearchClear: () => void
  queryStr: string
  queryChatId: number | null
}

export default function ChatListHeader({
  accountId,
  showArchivedChats,
  onExitArchive,
  searchRef,
  onSearchChange,
  onSearchClear,
  queryStr,
  queryChatId,
}: Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const openProxyDialog = useCallback(() => {
    accountId &&
      openDialog(ProxyConfiguration, {
        accountId,
        configured: true,
      })
  }, [openDialog, accountId])

  const proxyEnabled = useProxyEnabled()

  const connectivityFetch = useRpcFetch(
    BackendRemote.rpc.getConnectivity,
    proxyEnabled && accountId != undefined ? [accountId] : null
  )
  const refreshConnectivity = connectivityFetch?.refresh
  useEffect(() => {
    if (!proxyEnabled || !refreshConnectivity || accountId == undefined) {
      return
    }
    return onDCEvent(accountId, 'ConnectivityChanged', refreshConnectivity)
  }, [accountId, proxyEnabled, refreshConnectivity])

  // When proxy is enabled, show an icon in the chat navbar
  const proxyConnected =
    connectivityFetch?.lingeringResult?.ok === true &&
    connectivityFetch.lingeringResult.value >= C.DC_CONNECTIVITY_WORKING

  return (
    <section className={styles.chatListHeader} data-tauri-drag-region>
      {showArchivedChats && (
        <>
          <span data-no-drag-region>
            <Button
              aria-label={tx('back')}
              onClick={onExitArchive}
              className='backButton'
              styling='borderless'
            >
              <Icon icon='arrow-left' className='backButtonIcon'></Icon>
            </Button>
          </span>
          <div className={styles.archivedChatsTitle}>
            {tx('chat_archived_chats_title')}
          </div>
        </>
      )}
      {!showArchivedChats && (
        <>
          <SearchInput
            id='chat-list-search'
            inputRef={searchRef}
            onChange={onSearchChange}
            onClear={queryChatId ? () => onSearchClear() : undefined}
            value={queryStr}
          />
          {proxyEnabled && (
            <Button
              onClick={openProxyDialog}
              aria-label={tx('proxy_settings')}
              title={tx('proxy_settings')}
              styling='borderless'
              className={styles.proxyButton}
            >
              <Icon
                coloring='navbar'
                icon={proxyConnected ? 'proxy' : 'proxy-not-connected'}
                size={18}
              ></Icon>
            </Button>
          )}
        </>
      )}
    </section>
  )
}
