import React, { Component, useEffect, useState } from 'react'
import { DeltaBackend } from '../delta-remote'
import { ipcBackend } from '../ipc'


export default function OfflineToast() {
  const [online, setOnline] = useState(true)
  const [tryConnectCooldown, setTryConnectCooldown] = useState(true)

  const onOffline = () => setOnline(false)
  const onOnline = () => setOnline(true)
  const onMaybeOnline = () => DeltaBackend.call('context.maybeNetwork')
  useEffect(() => {
    DeltaBackend.call('context.maybeNetwork')
    
    window.addEventListener('online',  onMaybeOnline);
    window.addEventListener('offline', onOffline);
    ipcBackend.on('DC_EVENT_ERROR_NETWORK', onOffline)
    // ugly hack to find out when the user goes online again:
    ipcBackend.on('DC_EVENT_SMTP_CONNECTED', onOnline)
    ipcBackend.on('DC_EVENT_IMAP_CONNECTED', onOnline)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', onOnline)
    ipcBackend.on('DC_EVENT_MSG_DELIVERED', onOnline)
    ipcBackend.on('DC_EVENT_IMAP_MESSAGE_MOVED', onOnline)

    return () => {
      window.removeEventListener('online',  onMaybeOnline);
      window.removeEventListener('offline', onOffline);
      ipcBackend.removeListener('DC_EVENT_ERROR_NETWORK', onOffline)
      ipcBackend.removeListener('DC_EVENT_SMTP_CONNECTED', onOnline)
      ipcBackend.removeListener('DC_EVENT_IMAP_CONNECTED', onOnline)
      ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', onOnline)
      ipcBackend.removeListener('DC_EVENT_MSG_DELIVERED', onOnline)
      ipcBackend.removeListener('DC_EVENT_IMAP_MESSAGE_MOVED', onOnline)
    }
  }, [])

  const onTryReconnectClick = () => {
    setTryConnectCooldown(false)
    setTimeout(() => setTryConnectCooldown(true), 15000)
    setTimeout(() => DeltaBackend.call('context.maybeNetwork'), 100)
  }

  return (
    !online && (
      <div className='no-network-toast'>
        <b>Offline</b>
        <div
          className={tryConnectCooldown ? '' : 'disabled'}
          onClick={onTryReconnectClick}
        >
          Try to connect now
        </div>
      </div>
    )
  )
}
