import React, { useCallback, useEffect } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'
import Button from '../../Button'
import Icon, { IconButton } from '../../Icon'
import SearchInput from '../../SearchInput'
import QrCode from '../../dialogs/QrCode'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/dialog/useDialog'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { useRpcFetch } from '../../../hooks/useFetch'
import { SCAN_CONTEXT_TYPE } from '../../../hooks/useProcessQr'
import { useSettingsStore } from '../../../stores/settings'
import ProxyConfiguration from '../../dialogs/ProxyConfiguration'
import useProxyEnabled from '../../../hooks/useProxyEnabled'

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

  const handleQRScan = useCallback(async () => {
    if (accountId == undefined) {
      return
    }
    const [qrCode, qrCodeSVG] =
      await BackendRemote.rpc.getChatSecurejoinQrCodeSvg(accountId, null)
    openDialog(QrCode, {
      qrCode,
      qrCodeSVG,
      scanContext: SCAN_CONTEXT_TYPE.DEFAULT,
    })
  }, [openDialog, accountId])

  const hasSearchValue = queryStr.length > 0 || queryChatId != null

  const proxyEnabled = useProxyEnabled()
  const settingsStore = useSettingsStore()[0]
  // Whether any proxy is configured (any entry in the proxy list).
  const hasProxies =
    (settingsStore?.settings.proxy_url
      ?.split('\n')
      .filter(url => url.trim() !== '').length ?? 0) > 0

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

  const proxyConnected =
    connectivityFetch?.lingeringResult?.ok === true &&
    connectivityFetch.lingeringResult.value >= C.DC_CONNECTIVITY_WORKING

  // Show a proxy icon in the chat navbar whenever a proxy
  // is configured even if it is currently disabled
  const showProxyButton = proxyEnabled || hasProxies
  const proxyIcon = !proxyEnabled
    ? 'proxy-disabled'
    : proxyConnected
      ? 'proxy-connected'
      : 'proxy-not-connected'

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
          {!hasSearchValue && (
            <IconButton
              className={styles.highlight}
              coloring='currentColor'
              noDragRegion
              aria-label={tx('qrscan_title')}
              size={17}
              icon='qr'
              onClick={handleQRScan}
              data-testid='qr-scan-button'
            />
          )}
          {showProxyButton && (
            <IconButton
              className={styles.highlight}
              coloring='currentColor'
              noDragRegion
              aria-label={tx('proxy_settings')}
              title={tx('proxy_settings')}
              icon={proxyIcon}
              size={18}
              onClick={openProxyDialog}
            />
          )}
        </>
      )}
    </section>
  )
}
