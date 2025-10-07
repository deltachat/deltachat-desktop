import React from 'react'
import classNames from 'classnames'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Button from '../../Button'
import { C } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'

function getConnectivityString(status: number) {
  if (status >= C.DC_CONNECTIVITY_CONNECTED) {
    return 'connectivity_connected'
  }
  if (status >= C.DC_CONNECTIVITY_WORKING) {
    return 'connectivity_updating'
  }
  if (status >= C.DC_CONNECTIVITY_CONNECTING) {
    return 'connectivity_connecting'
  }
  return 'connectivity_not_connected'
}

type ProxyItemRowProps = {
  proxyUrl: string
  index: number
  isActive: boolean
  configured: boolean
  changeActiveProxy: (proxyUrl: string) => void
  connectivityStatus: number
  deleteProxy: (proxyUrl: string) => void
  copyToClipboard: (url: string) => void
}

const ProxyItemRow = React.memo(function ProxyItemRow({
  proxyUrl,
  index,
  isActive,
  configured,
  changeActiveProxy,
  connectivityStatus,
  deleteProxy,
  copyToClipboard,
}: ProxyItemRowProps) {
  const parts = proxyUrl.split('://')
  const protocol = parts.length > 1 ? parts[0] : 'unknown'
  const label = parts.length > 1 ? parts[1] : proxyUrl

  const showConnectivity = isActive && configured
  const tx = useTranslationFunction()

  return (
    <div className={styles.proxyItem}>
      {/* Row for selection */}
      <div
        className={styles.proxyRow}
        onClick={() => changeActiveProxy(proxyUrl)}
      >
        <input
          id={`proxy-${index}`}
          name='proxy-selection'
          type='radio'
          onChange={() => changeActiveProxy(proxyUrl)}
          value={proxyUrl}
          checked={isActive}
          className={styles.radioButton}
          aria-labelledby={`proxy-label-${index}`}
        />
        <div>
          <div
            id={`proxy-label-${index}`}
            className={styles.proxyLabel}
            title={label}
          >
            {label}
          </div>
          <div>
            <span className={styles.protocol}>{protocol}</span>
            <span role='status'>
              {showConnectivity &&
                tx(getConnectivityString(connectivityStatus))}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.buttons}>
        <Button
          onClick={() => copyToClipboard(proxyUrl)}
          aria-label={`${tx('menu_copy_to_clipboard')} ${label}`}
          title={tx('menu_copy_to_clipboard')}
          styling='borderless'
        >
          <i
            className={classNames(
              'material-svg-icon',
              'material-icon-copy',
              styles.copy
            )}
            aria-hidden='true'
          />
        </Button>
        <Button
          onClick={() => deleteProxy(proxyUrl)}
          aria-label={`${tx('delete')} ${label}`}
          title={tx('delete')}
          styling='borderless'
        >
          <i
            className={classNames(
              'material-svg-icon',
              'material-icon-trash',
              styles.trash
            )}
            aria-hidden='true'
          />
        </Button>
      </div>
    </div>
  )
})

export default ProxyItemRow
