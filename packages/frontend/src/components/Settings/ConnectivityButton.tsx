import React, { useEffect, useMemo } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import SettingsIconButton from './SettingsIconButton'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import ConnectivityDialog from '../dialogs/ConnectivityDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'
import { useRpcFetch } from '../../hooks/useFetch'

export default function ConnectivityButton() {
  const { openDialog } = useDialog()
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const { lingeringResult, refresh } = useRpcFetch(
    BackendRemote.rpc.getConnectivity,
    [accountId]
  )

  useEffect(() => {
    return onDCEvent(accountId, 'ConnectivityChanged', refresh)
  }, [refresh, accountId])

  const connectivityString = useMemo(() => {
    if (!lingeringResult?.ok) {
      return ''
    }
    const connectivity = lingeringResult.value
    let str = ''
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      str = window.static_translate('connectivity_connected')
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      str = window.static_translate('connectivity_updating').replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      str = window.static_translate('connectivity_connecting').replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      str = window.static_translate('connectivity_not_connected')
    }
    return `(${str})`
  }, [lingeringResult])

  return (
    <SettingsIconButton
      icon='swap_vert'
      onClick={() => openDialog(ConnectivityDialog)}
    >
      {tx('connectivity') + ' ' + connectivityString}
    </SettingsIconButton>
  )
}
