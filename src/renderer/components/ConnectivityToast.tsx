import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react'

import { getLogger } from '../../shared/logger'
import { ScreenContext, useTranslationFunction } from '../contexts'
import { useKeyBindingAction, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/node/dist/constants'

import { debounce } from 'debounce'
import { debounceWithInit } from './chat/ChatListHelpers'
import SettingsConnectivityDialog from './dialogs/Settings-Connectivity'
import { BackendRemote, onDCEvent } from '../backend-com'
import { selectedAccountId } from '../ScreenController'

const log = getLogger('renderer/components/ConnectivityToast')

enum Connectivity {
  NOT_CONNECTED,
  CONNECTING,
  WORKING,
  CONNECTED,
}

export default function ConnectivityToast() {
  const [networkState, setNetworkState]: [
    [Connectivity, string],
    todo
  ] = useState([Connectivity.CONNECTED, ''])
  const [tryConnectCooldown, setTryConnectCooldown] = useState(true)

  const accountId = selectedAccountId()

  const maybeNetwork = useMemo(
    () => debounce(() => BackendRemote.rpc.maybeNetwork(), 140, true),
    []
  )

  const onBrowserOffline = () => {
    log.debug("Browser knows we're offline")
    setNetworkState(() => [
      Connectivity.NOT_CONNECTED,
      "Browser knows we're offline",
    ])
  }

  const tryMaybeNetworkIfOfflineAfterXms = useCallback(
    (ms: number) => {
      setTimeout(() => {
        // This is a hack to get the current network state by abusing the setNetworkState function.
        // Not pretty but works.
        setNetworkState(([connectivity, error]: [Connectivity, string]) => {
          if (connectivity === Connectivity.NOT_CONNECTED) {
            log.debug(
              `We are still not online after ${ms}  milli seconds, try maybeNetwork again`
            )
            maybeNetwork()
          } else if (ms < 30000) {
            tryMaybeNetworkIfOfflineAfterXms(2 * ms)
          } else {
            log.debug(
              `We tried reconnecting with waiting for more then 30 seconds, now stop`
            )
          }

          // Keep state unchanged
          return [connectivity, error]
        })
      }, ms)
    },
    [maybeNetwork]
  )

  const onBrowserOnline = useCallback(() => {
    log.debug("Browser thinks we're back online, telling rust core")
    setNetworkState(() => [
      Connectivity.CONNECTED,
      "Browser thinks we're online",
    ])
    maybeNetwork()

    tryMaybeNetworkIfOfflineAfterXms(150)
  }, [tryMaybeNetworkIfOfflineAfterXms, maybeNetwork])

  const onConnectivityChanged = useMemo(
    () =>
      debounceWithInit(async () => {
        const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

        if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
          log.debug("Core thinks we're back online and connected")
          setNetworkState(() => [
            Connectivity.CONNECTED,
            "Core thinks we're connected",
          ])
        } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
          log.debug("Core thinks we're back online and connected")
          setNetworkState(() => [
            Connectivity.WORKING,
            "Core thinks we're connected and working",
          ])
        } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
          log.debug("Core thinks we're back online and connected")
          setNetworkState(() => [
            Connectivity.CONNECTING,
            "Core thinks we're connecting",
          ])
        } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
          log.debug("Core thinks we're not connected")
          setNetworkState(() => [
            Connectivity.NOT_CONNECTED,
            "Core thinks we're not connected",
          ])
        }
      }, 300),
    [accountId]
  )

  useKeyBindingAction(KeybindAction.Debug_MaybeNetwork, maybeNetwork)

  useEffect(() => {
    if (navigator.onLine === false) onBrowserOffline()

    window.addEventListener('online', onBrowserOnline)
    window.addEventListener('offline', onBrowserOffline)
    window.addEventListener('focus', maybeNetwork)

    const removeOnConnectivityChanged = onDCEvent(
      accountId,
      'ConnectivityChanged',
      onConnectivityChanged
    )

    return () => {
      window.removeEventListener('online', onBrowserOnline)
      window.removeEventListener('offline', onBrowserOffline)
      window.removeEventListener('focus', maybeNetwork)

      removeOnConnectivityChanged()
    }
  }, [onBrowserOnline, maybeNetwork, onConnectivityChanged, accountId])

  const onTryReconnectClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()
    setTryConnectCooldown(false)
    setTimeout(() => setTryConnectCooldown(true), 15000)
    setTimeout(() => maybeNetwork(), 100)
  }

  const { openDialog } = useContext(ScreenContext)
  const onInfoTextClick = useCallback(() => {
    openDialog(SettingsConnectivityDialog)
  }, [openDialog])

  const tx = useTranslationFunction()

  if (networkState[0] === Connectivity.CONNECTED) {
    return null
  }

  return (
    <div className='ConnectivityToast' onClick={onInfoTextClick}>
      {networkState[0] === Connectivity.NOT_CONNECTED && (
        <>
          <a title={networkState[1]}>{tx('connectivity_not_connected')}</a>
          <div
            className={tryConnectCooldown ? '' : 'disabled'}
            onClick={onTryReconnectClick}
          >
            {tx('try_connect_now')}
          </div>
        </>
      )}
      {networkState[0] === Connectivity.CONNECTING && (
        <>{tx('connectivity_connecting')}</>
      )}
      {networkState[0] === Connectivity.WORKING && (
        <>{tx('connectivity_updating')}</>
      )}
    </div>
  )
}
