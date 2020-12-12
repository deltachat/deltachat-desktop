import React, { useEffect, useState } from 'react'
import { DeltaBackend } from '../delta-remote'
import { onDCEvent } from '../ipc'

import { getLogger } from '../../shared/logger'
import { useTranslationFunction } from '../contexts'
import { useKeyBindingAction, KeybindAction } from '../keybindings'

const log = getLogger('renderer/components/OfflineToast')

// Array holding all events on which we know that we have some online connectivity
const DC_NETWORK_SUCCESS_EVENTS = [
  'DC_EVENT_SMTP_CONNECTED',
  'DC_EVENT_IMAP_CONNECTED',
  'DC_EVENT_INCOMING_MSG',
  'DC_EVENT_MSG_DELIVERED',
  'DC_EVENT_IMAP_MESSAGE_MOVED',
  'DC_EVENT_IMAP_MESSAGE_DELETED',
]

export default function OfflineToast() {
  const [networkState, setNetworkState]: [[boolean, string], todo] = useState([
    true,
    '',
  ])
  const [tryConnectCooldown, setTryConnectCooldown] = useState(true)

  const onBrowserOffline = () => {
    log.debug("Browser knows we're offline")
    setNetworkState(() => [false, "Browser knows we're offline"])
  }

  const tryMaybeNetworkIfOfflineAfterXms = (ms: number) => {
    setTimeout(() => {
      // This is a hack to get the current network state by abusing the setNetworkState function.
      // Not pretty but works.
      setNetworkState(([online, error]: [boolean, string]) => {
        if (!online) {
          log.debug(
            `We are still not online after ${ms}  milli seconds, try maybeNetwork again`
          )
          DeltaBackend.call('context.maybeNetwork')
        } else if (ms < 30000) {
          tryMaybeNetworkIfOfflineAfterXms(2 * ms)
        } else {
          log.debug(
            `We tried reconnecting with waiting for more then 30 seconds, now stop`
          )
        }

        // Keep state unchanged
        return [online, error]
      })
    }, ms)
  }

  const onBrowserOnline = () => {
    log.debug("Browser thinks we're back online, telling rust core")
    setNetworkState(() => [true, "Browser thinks we're online"])
    DeltaBackend.call('context.maybeNetwork')

    tryMaybeNetworkIfOfflineAfterXms(150)
  }

  const onDeltaNetworkError = (data1: string, data2: string) => {
    setNetworkState(() => [false, data1 + data2])
  }

  const onDeltaNetworkSuccess = () => {
    setNetworkState(() => [true, ''])
  }

  const maybeNetwork = () => {
    DeltaBackend.call('context.maybeNetwork')
  }

  useKeyBindingAction(KeybindAction.Debug_MaybeNetwork, maybeNetwork)

  useEffect(() => {
    if (navigator.onLine === false) onBrowserOffline()

    window.addEventListener('online', onBrowserOnline)
    window.addEventListener('offline', onBrowserOffline)
    const removeEventListenerDCNetworkError = onDCEvent(
      'DC_EVENT_ERROR_NETWORK',
      onDeltaNetworkError
    )
    const removeEventListenerDCNetworkSuccess = onDCEvent(
      DC_NETWORK_SUCCESS_EVENTS,
      onDeltaNetworkSuccess
    )

    return () => {
      window.removeEventListener('online', onBrowserOffline)
      window.removeEventListener('offline', onBrowserOnline)

      removeEventListenerDCNetworkError()
      removeEventListenerDCNetworkSuccess()
    }
  }, [])

  const onTryReconnectClick = () => {
    setTryConnectCooldown(false)
    setTimeout(() => setTryConnectCooldown(true), 15000)
    setTimeout(() => DeltaBackend.call('context.maybeNetwork'), 100)
  }

  const tx = useTranslationFunction()

  return (
    networkState[0] === false && (
      <div className='OfflineToast'>
        <a title={networkState[1]}>{tx('offline')}</a>
        <div
          className={tryConnectCooldown ? '' : 'disabled'}
          onClick={onTryReconnectClick}
        >
          {tx('try_connect_now')}
        </div>
      </div>
    )
  )
}
