import React, { Component, useEffect, useState } from 'react'
import debounce from 'debounce'
import { C } from '@deltachat/jsonrpc-client'

import Icon from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { BackendRemote, onDCEvent } from '../../backend-com'
import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

type Props = {
  account: T.Account
  isSelected: boolean
  muted: boolean
}

type ConnectivityState = { color: string; label: string }

const log = getLogger('AccountListSidebar/AccountHoverInfo')

export default function AccountHoverInfo({
  account,
  isSelected,
  muted,
}: Props) {
  const tx = useTranslationFunction()

  const [bgSyncDisabled, setBgSyncDisabled] = useState<boolean>(false)
  useEffect(() => {
    runtime.getDesktopSettings().then(({ syncAllAccounts }) => {
      setBgSyncDisabled(!syncAllAccounts)
    })
  }, [account.id])

  const showConnection = isSelected || !bgSyncDisabled

  let content: JSX.Element

  if (account.kind === 'Unconfigured') {
    content = (
      <>
        <b>{tx('unconfigured_account')}</b>
        <div className={styles.hoverInfoProperty}>
          {tx('unconfigured_account_hint')}
        </div>
      </>
    )
  } else {
    content = (
      <>
        <b>{account.displayName ? account.displayName : account.addr}</b>
        {showConnection && (
          <div className={styles.hoverInfoProperty}>
            <Connectivity accountId={account.id} />
          </div>
        )}
        {muted && (
          <div className={styles.hoverInfoProperty}>
            <Icon
              icon='audio-muted'
              size={12}
              className={styles.hoverInfoMuteIcon}
            />{' '}
            {tx('muted')}
          </div>
        )}
        {bgSyncDisabled && (
          <div className={styles.hoverInfoProperty}>
            <span className={styles.hoverInfoDisabledIcon}>⏻</span>{' '}
            {tx('background_sync_disabled_explaination')}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={styles.accountHoverInfo} role='tooltip'>
      {content}
    </div>
  )
}

class Connectivity extends Component<{ accountId: number }, ConnectivityState> {
  accountId = this.props.accountId // don't let react change the used account id
  state = { color: '', label: '' }
  wasDestroyed = false
  eventUnregisterHandle?: () => void

  async onConnectivityChanged() {
    if (this.wasDestroyed) {
      return
    }
    const connectivity = await BackendRemote.rpc.getConnectivity(this.accountId)
    if (!this.wasDestroyed) {
      this.setState(Connectivity.convertConnectivityToState(connectivity))
    }
  }

  static convertConnectivityToState(connectivity: number): ConnectivityState {
    const tx = window.static_translate
    if (connectivity >= C.DC_CONNECTIVITY_CONNECTED) {
      return { color: 'green', label: tx('connectivity_connected') }
    } else if (connectivity >= C.DC_CONNECTIVITY_WORKING) {
      return { color: 'lightgreen', label: tx('connectivity_updating') }
    } else if (connectivity >= C.DC_CONNECTIVITY_CONNECTING) {
      return { color: 'orange', label: tx('connectivity_connecting') }
    } else if (connectivity >= C.DC_CONNECTIVITY_NOT_CONNECTED) {
      return { color: 'red', label: tx('connectivity_not_connected') }
    } else {
      log.error(
        'Label for this Connectivity state number is unknown',
        connectivity
      )
      return { color: 'purple', label: 'Error fetching Connection State' }
    }
  }

  componentDidMount(): void {
    this.onConnectivityChanged()
    this.eventUnregisterHandle = onDCEvent(
      this.accountId,
      'ConnectivityChanged',
      debounce(this.onConnectivityChanged.bind(this), 300)
    )
  }

  componentWillUnmount(): void {
    this.wasDestroyed = true
    this.eventUnregisterHandle?.()
  }

  render(): React.ReactNode {
    return (
      <>
        <div
          className={styles.connectivityDot}
          style={{ backgroundColor: this.state.color }}
        />{' '}
        {this.state.label}
      </>
    )
  }
}
