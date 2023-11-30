import React, { useCallback, useContext, useEffect, useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { BackendRemote, onDCEvent } from '../../backend-com'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { SettingsIconButton } from './SettingsIconButton'
import SettingsConnectivityDialog from '../dialogs/Settings-Connectivity'
import { selectedAccountId } from '../../ScreenController'

export function SettingsConnectivityButton() {
  const { openDialog } = useContext(ScreenContext)
  const [connectivityString, setConnectivityString] = useState('')
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const updateConnectivity = useCallback(async () => {
    const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

    let connectivityString = ''
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      connectivityString = window.static_translate('connectivity_connected')
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      connectivityString = window
        .static_translate('connectivity_updating')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      connectivityString = window
        .static_translate('connectivity_connecting')
        .replace('…', '')
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      connectivityString = window.static_translate('connectivity_not_connected')
    }
    setConnectivityString(`(${connectivityString})`)
  }, [accountId])

  useEffect(() => {
    updateConnectivity()
    return onDCEvent(accountId, 'ConnectivityChanged', updateConnectivity)
  }, [updateConnectivity, accountId])

  return (
    <SettingsIconButton
      iconName='swap_vert'
      onClick={() => openDialog(SettingsConnectivityDialog)}
    >
      {tx('connectivity') + ' ' + connectivityString}
    </SettingsIconButton>
  )
}
