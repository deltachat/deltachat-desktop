import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { DeltaBackend } from '../delta-remote'
import { onDCEvent } from '../ipc'

import { getLogger } from '../../shared/logger'
import { useTranslationFunction } from '../contexts'
import { useKeyBindingAction, KeybindAction } from '../keybindings'
import { C } from 'deltachat-node/dist/constants'

import { debounce } from 'debounce'

const log = getLogger('renderer/components/ConnectivityToast')

enum Connectivity {
  NOT_CONNECTED,
  CONNECTING,
  WORKING,
  CONNECTED
}

export default function ConnectivityToast() {
  const [networkState, setNetworkState]: [[Connectivity, string], todo] = useState([
    Connectivity.CONNECTED,
    '',
  ])
  const [tryConnectCooldown, setTryConnectCooldown] = useState(true)

  const maybeNetwork = useMemo(
    () => debounce(() => DeltaBackend.call('context.maybeNetwork'), 140, true),
    []
  )

  const onBrowserOffline = () => {
    log.debug("Browser knows we're offline")
    setNetworkState(() => [Connectivity.NOT_CONNECTED, "Browser knows we're offline"])
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
    setNetworkState(() => [Connectivity.CONNECTED, "Browser thinks we're online"])
    maybeNetwork()

    tryMaybeNetworkIfOfflineAfterXms(150)
  }, [tryMaybeNetworkIfOfflineAfterXms, maybeNetwork])

  const onConnectivityChanged = async (_data1: any, _data2: any) => {
    const connectivity = await DeltaBackend.call('context.getConnectivity')
    
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      log.debug("Core thinks we're back online and connected")
      setNetworkState(() => [Connectivity.CONNECTED, "Core thinks we're connected"])
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      log.debug("Core thinks we're back online and connected")
      setNetworkState(() => [Connectivity.WORKING, "Core thinks we're connected and working"])    
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      log.debug("Core thinks we're back online and connected")
      setNetworkState(() => [Connectivity.CONNECTING, "Core thinks we're connecting"])
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      log.debug("Core thinks we're not connected")
      setNetworkState(() => [Connectivity.NOT_CONNECTED, "Core thinks we're not connected"])
    }
  }

  useKeyBindingAction(KeybindAction.Debug_MaybeNetwork, maybeNetwork)

  useEffect(() => {
    if (navigator.onLine === false) onBrowserOffline()

    window.addEventListener('online', onBrowserOnline)
    window.addEventListener('offline', onBrowserOffline)
    window.addEventListener('focus', maybeNetwork)

    const removeOnConnectivityChanged = onDCEvent(
      'DC_EVENT_CONNECTIVITY_CHANGED',
      onConnectivityChanged
    )

    return () => {
      window.removeEventListener('online', onBrowserOnline)
      window.removeEventListener('offline', onBrowserOffline)
      window.removeEventListener('focus', maybeNetwork)

      removeOnConnectivityChanged()
    }
  }, [onBrowserOnline, maybeNetwork])

  const onTryReconnectClick = () => {
    setTryConnectCooldown(false)
    setTimeout(() => setTryConnectCooldown(true), 15000)
    setTimeout(() => maybeNetwork(), 100)
  }

  const tx = useTranslationFunction()

  console.log('xxx', networkState)
  return <>
    {networkState[0] === Connectivity.NOT_CONNECTED && (
      <div className='ConnectivityToast'>
        <a title={networkState[1]}>{tx('offline')}</a>
        <div
          className={tryConnectCooldown ? '' : 'disabled'}
          onClick={onTryReconnectClick}
        >
          {tx('try_connect_now')}
        </div>
      </div>
    )}
    {networkState[0] === Connectivity.CONNECTING && (
      <div className='ConnectivityToast'>
        Connecting
      </div>
    )}
    {networkState[0] === Connectivity.WORKING && (
      <div className='ConnectivityToast'>
        Working
      </div>
    )}
  </>
}
