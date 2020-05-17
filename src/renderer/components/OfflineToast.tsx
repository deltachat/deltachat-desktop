import React, { Component } from 'react'
import { DeltaBackend } from '../delta-remote'
import { ipcBackend } from '../ipc'

export default class OfflineToast extends Component<
  {},
  { online: boolean; tryConnectCooldown: boolean }
> {
  onOnline: any
  onOffline: any
  constructor(props: any) {
    super(props)
    this.state = {
      online: true,
      tryConnectCooldown: true,
    }

    this.onOnline = this.onNetworkChange.bind(this, true)
    this.onOffline = this.onNetworkChange.bind(this, false)
  }

  componentDidMount() {
    ipcBackend.on('DC_EVENT_ERROR_NETWORK', this.onOffline)
    // ugly hack to find out when the user goes online again:
    ipcBackend.on('DC_EVENT_SMTP_CONNECTED', this.onOnline)
    ipcBackend.on('DC_EVENT_IMAP_CONNECTED', this.onOnline)
    ipcBackend.on('DC_EVENT_INCOMING_MSG', this.onOnline)
    ipcBackend.on('DC_EVENT_MSG_DELIVERED', this.onOnline)
    ipcBackend.on('DC_EVENT_IMAP_MESSAGE_MOVED', this.onOnline)
  }

  componentWillUnmount() {
    ipcBackend.removeListener('DC_EVENT_ERROR_NETWORK', this.onOffline)
    ipcBackend.removeListener('DC_EVENT_SMTP_CONNECTED', this.onOnline)
    ipcBackend.removeListener('DC_EVENT_IMAP_CONNECTED', this.onOnline)
    ipcBackend.removeListener('DC_EVENT_INCOMING_MSG', this.onOnline)
    ipcBackend.removeListener('DC_EVENT_MSG_DELIVERED', this.onOnline)
    ipcBackend.removeListener('DC_EVENT_IMAP_MESSAGE_MOVED', this.onOnline)
  }

  async onNetworkChange(online: boolean, _event?: any) {
    this.setState({ online })
  }

  render() {
    return (
      !this.state.online && (
        <div className='no-network-toast'>
          <b>Offline</b>
          <div
            onClick={() => {
              this.setState({ tryConnectCooldown: false })
              setTimeout(
                () => this.setState({ tryConnectCooldown: true }),
                15000
              )
              setTimeout(() => DeltaBackend.call('context.maybeNetwork'), 100)
            }}
            className={this.state.tryConnectCooldown ? '' : 'disabled'}
          >
            Try to connect now
          </div>
        </div>
      )
    )
  }
}
