import React, { Component, useEffect, useState } from 'react'
import { DeltaBackend } from '../delta-remote'
import { ipcBackend } from '../ipc'

import { getLogger } from '../../shared/logger'

const log = getLogger('renderer/components/OfflineToast')

export default function OfflineToast() {
  
  const [networkStatusMessage, setNetworkStatusMessage] = useState('')
  const [networkStatus, setNetworkStatus] = useState(true)
  const [tryConnectCooldown, setTryConnectCooldown] = useState(true)

  const onNetworkStatus = (
    _: any,
    [networkStatus, networkStatusMessage]: [boolean, string]
  ) => {
    log.debug(
      `network status changed, we\'re ${
        networkStatus ? 'online' : 'offline'
      }. The message is "${networkStatusMessage}"`
    )
    setNetworkStatus(networkStatus)
    setNetworkStatusMessage(networkStatusMessage)
  }
  const onBrowserOffline = () => {
    log.debug("Browser thinks we're offline, telling rust core")
    DeltaBackend.call('context.maybeNetwork')
  }

  const onBrowserOnline = () => {
    log.debug("Browser thinks we're back online, telling rust core")
    DeltaBackend.call('context.maybeNetwork')
  }

  useEffect(() => {
    ;(async () => {
      const networkStatusReturn = await DeltaBackend.call('getNetworkStatus')
      onNetworkStatus(null, networkStatusReturn)
    })()
    window.addEventListener('online', onBrowserOffline)
    window.addEventListener('offline', onBrowserOnline)
    ipcBackend.on('NETWORK_STATUS', onNetworkStatus)

    return () => {
      window.removeEventListener('online', onBrowserOffline)
      window.removeEventListener('offline', onBrowserOnline)
      ipcBackend.removeListener('NETWORK_STATUS', onNetworkStatus)
    }
  }, [])

  const onTryReconnectClick = () => {
    setTryConnectCooldown(false)
    setTimeout(() => setTryConnectCooldown(true), 15000)
    setTimeout(() => DeltaBackend.call('context.maybeNetwork'), 100)
  }

  const tx = window.translate

  return (
    networkStatus === false && (
      <div className='OfflineToast'>
        <a title={networkStatusMessage}>{tx('offline')}</a>
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
