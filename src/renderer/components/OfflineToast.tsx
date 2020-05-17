import React, { Component } from 'react'
import { DeltaBackend } from '../delta-remote'
import { ipcBackend } from '../ipc'

export default class OfflineToast extends Component<
  {},
  { online: boolean; tryConnectCooldown: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      online: true,
      tryConnectCooldown: true,
    }

    this.onNetworkChange = this.onNetworkChange.bind(this)
    this.onNetworkChange()
  }

  componentDidMount() {
    ipcBackend.on('update-network-status', this.onNetworkChange)
  }

  componentWillUnmount() {
    ipcBackend.removeListener('update-network-status', this.onNetworkChange)
  }

  async onNetworkChange(_event?: any) {
    this.setState({ online: await DeltaBackend.call('getNetworkStatus') })
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
