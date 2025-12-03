import React, { useCallback, useEffect, useState } from 'react'
import { DialogProps } from '../../../contexts/DialogContext'
import Dialog, { DialogBody, DialogHeader, DialogFooter } from '../../Dialog'

import { C } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import SettingsSwitch from '../../Settings/SettingsSwitch'
import { DeltaTextarea } from '../../Login-Styles'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import useDialog from '../../../hooks/dialog/useDialog'
import Button from '../../Button'

import styles from './styles.module.scss'
import { Proxy } from '../../Settings/DefaultCredentials'
import { debounce } from 'debounce'

import { getLogger } from '@deltachat-desktop/shared/logger'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

import ProxyItemRow from './ProxyItemRow'
import { processQr } from '../../../backend/qr'
import BasicQrScanner from '../BasicScanner'

const log = getLogger('proxy-configuration')

type ProxyStateType = {
  enabled: boolean
  proxies: string[]
  activeProxy: string | null
  updateSettings: boolean
}

/**
 * Dialog for proxy configuration
 *
 * this dialog is used in the advanced settings screen
 * and in the instant onboarding flow (behind 3 dot menu)
 *
 * it shows a list of configured proxies
 * and allows to add a new proxy
 * or delete an existing one
 *
 * if enabled backend uses the first proxy as active proxy
 *
 * the list of proxies is kept even if proxy is disabled
 */
export default function ProxyConfiguration(
  props: DialogProps & {
    accountId: number
    configured: boolean
    newProxyUrl?: string
  }
) {
  const tx = useTranslationFunction()

  // used in  new proxy form
  const [newProxyUrl, setNewProxyUrl] = useState('')

  const [showNewProxyForm, setShowNewProxyForm] = useState(false)

  // updated on connectivity change
  const [connectivityStatus, setConnectivityStatus] = useState(
    C.DC_CONNECTIVITY_NOT_CONNECTED
  )

  // configured means the account is already configured
  // which is needed to decide if we show the connectivity status
  const {
    accountId,
    configured,
    newProxyUrl: incomingProxyUrl,
    onClose,
  } = props

  const openAlertDialog = useAlertDialog()
  const { openDialog } = useDialog()

  const [proxyState, setProxyState] = useState<ProxyStateType>({
    enabled: false,
    proxies: [],
    activeProxy: null,
    updateSettings: false,
  })

  // convenience function to update the proxy state
  // called only after user actions (so updateSettings is set to true)
  const updateProxyState = useCallback(
    (updates: Partial<typeof proxyState>) =>
      setProxyState(prev => ({ ...prev, ...updates, updateSettings: true })),
    [setProxyState]
  )

  // some basic prevalidations, returns true if the url seems valid
  // called on each key up in new proxy form!
  const maybeValidProxyUrl = useCallback((url: string): boolean => {
    const parts = url.split('://')
    return (
      parts.length === 2 &&
      parts[0].length >= 2 && // shortest protocol is ss://
      parts[1].length >= 1 // host
    )
  }, [])

  const validateProxy = useCallback(
    async (proxyUrl: string, existingProxies: string[]): Promise<boolean> => {
      let errorMessage: string | null = null
      let proxyValid = false
      try {
        if (existingProxies.includes(proxyUrl.trim())) {
          throw new Error('Proxy already exists')
        }
        const parsedUrl = await BackendRemote.rpc.checkQr(accountId, proxyUrl)
        proxyValid = parsedUrl.kind === 'proxy'
      } catch (error) {
        log.error('checkQr failed with error', error)
        errorMessage = unknownErrorToString(error)
      }
      if (!proxyValid) {
        openAlertDialog({
          message:
            tx('proxy_invalid') + (errorMessage ? `\n${errorMessage}` : ''),
        })
      }
      return proxyValid
    },
    [accountId, openAlertDialog, tx]
  )

  useEffect(() => {
    // load current proxy settings from backend
    // and add incomingProxyUrl if given
    // This is the case when the proxy url was scanned
    // from general qr code scanner in an existing account.
    // Then this dialog is opened with the scanned url as prop.
    const init = async () => {
      try {
        const { proxy_enabled, proxy_url } =
          await BackendRemote.rpc.batchGetConfig(accountId, [
            'proxy_enabled',
            'proxy_url',
          ])
        if (proxy_enabled !== undefined) {
          let enabled = proxy_enabled === Proxy.ENABLED
          let proxies: string[] = []
          let activeProxy = null
          let updateSettings = false
          if (proxy_url && proxy_url.length > 0) {
            // split proxy_url by new line
            // and remove empty lines from possible previous settings
            const proxyLines = proxy_url.split(/\n/).filter(s => !!s)
            proxies = proxyLines
            activeProxy = enabled ? proxies[0] : null
          }
          if (incomingProxyUrl) {
            const proxyValid = await validateProxy(incomingProxyUrl, proxies)
            if (proxyValid) {
              proxies.push(incomingProxyUrl)
              activeProxy = incomingProxyUrl
              enabled = true
              updateSettings = true
            }
          }
          setProxyState(prev => ({
            ...prev,
            enabled,
            proxies,
            activeProxy,
            updateSettings,
          }))
          setShowNewProxyForm(proxies.length === 0)
        }
      } catch (error) {
        log.error('failed to load proxy settings', error)
        openAlertDialog({
          message: unknownErrorToString(error),
        })
      }
    }
    init()
  }, [accountId, openAlertDialog, validateProxy, incomingProxyUrl, tx])

  const changeProxyEnable = (enableProxy: boolean) => {
    let activeProxy = null
    // if proxy is disabled, set activeProxy to null
    if (enableProxy && proxyState.proxies.length > 0) {
      activeProxy = proxyState.proxies[0]
    }
    updateProxyState({
      enabled: enableProxy,
      activeProxy,
    })
  }

  const addProxy = useCallback(
    async (proxyUrl: string) => {
      const proxyValid = await validateProxy(proxyUrl, proxyState.proxies)
      if (proxyValid) {
        setProxyState(prev => ({
          ...prev,
          enabled: true,
          proxies: [...prev.proxies, proxyUrl],
          activeProxy: proxyUrl,
          updateSettings: true,
        }))
        setShowNewProxyForm(false)
        setNewProxyUrl('')
      }
    },
    [proxyState.proxies, validateProxy, setProxyState]
  )

  const openQrScanner = useCallback(() => {
    openDialog(BasicQrScanner, {
      onSuccess: async (result: string) => {
        if (result) {
          const { qr } = await processQr(accountId, result)
          if (qr.kind === 'proxy') {
            addProxy(result)
          } else {
            openAlertDialog({
              message: tx('proxy_invalid'),
              dataTestid: 'proxy-scan-failed',
            })
          }
        }
      },
    })
  }, [openDialog, accountId, addProxy, openAlertDialog, tx])

  const changeActiveProxy = useCallback(
    (proxyUrl: string) => {
      updateProxyState({
        activeProxy: proxyUrl,
        enabled: true,
      })
    },
    [updateProxyState]
  )

  const deleteProxy = useCallback(
    (proxyUrl: string) => {
      const otherProxies = proxyState.proxies.filter(
        proxy => proxy !== proxyUrl
      )
      // show new proxy form
      // if no other proxy is available
      setShowNewProxyForm(otherProxies.length === 0)
      if (proxyUrl !== proxyState.activeProxy) {
        updateProxyState({
          proxies: otherProxies,
        })
        return
      }
      if (otherProxies.length > 0) {
        // change active proxy if it was deleted
        updateProxyState({
          proxies: otherProxies,
          activeProxy: otherProxies[0],
        })
      } else {
        updateProxyState({
          enabled: false,
          proxies: [],
          activeProxy: null,
        })
      }
    },
    [proxyState.activeProxy, proxyState.proxies, updateProxyState]
  )

  useEffect(() => {
    let outdated = false

    if (!configured) {
      return
    }

    const update = async () => {
      const connectivity = await BackendRemote.rpc.getConnectivity(accountId)

      if (outdated) {
        return
      }

      setConnectivityStatus(connectivity)
    }

    const debouncedUpdate = debounce(update, 300)
    debouncedUpdate()
    debouncedUpdate.flush()

    const cleanup = [
      onDCEvent(accountId, 'ConnectivityChanged', debouncedUpdate),
      () => debouncedUpdate.clear(),
      () => (outdated = true),
    ]
    return () => cleanup.forEach(off => off())
  }, [accountId, configured])

  /**
   * Update proxy settings in the backend
   * called after any proxyState change
   */
  useEffect(() => {
    if (!proxyState.updateSettings) {
      // don't update while loading values from backend
      return
    }
    const updateProxySettings = async () => {
      const proxyString =
        proxyState.proxies.length > 0
          ? [
              proxyState.activeProxy,
              ...proxyState.proxies.filter(p => p !== proxyState.activeProxy),
            ]
              .filter(s => !!s) // remove null & empty strings
              .join('\n')
          : ''
      if (proxyState.enabled && proxyString.trim() === '') {
        openAlertDialog({
          message: tx('proxy_invalid'),
        })
        return
      }
      try {
        await BackendRemote.rpc.batchSetConfig(accountId, {
          proxy_url: proxyString,
          proxy_enabled: proxyState.enabled ? Proxy.ENABLED : Proxy.DISABLED,
        })

        await BackendRemote.rpc.stopIo(accountId)
        await BackendRemote.rpc.startIo(accountId)
      } catch (error) {
        log.error('failed to update proxy settings', error)
        openAlertDialog({
          message: unknownErrorToString(error),
        })
      }
    }
    updateProxySettings()
  }, [
    proxyState.enabled,
    accountId,
    openAlertDialog,
    tx,
    proxyState.proxies,
    proxyState.activeProxy,
    proxyState.updateSettings,
  ])

  const isValid = !(proxyState.enabled && proxyState.proxies.length === 0)
  /**
   * validate settings before closing
   * to avoid invalid settings
   */
  const closeDialog = () => {
    if (!isValid) {
      openAlertDialog({
        message: tx('proxy_invalid'),
      })
      return
    }
    onClose()
  }

  const copyToClipboard = useCallback(
    (url: string) => {
      navigator.clipboard.writeText(url)
      openAlertDialog({
        message: `${url}\n${tx('copied_to_clipboard')}`,
      })
    },
    [tx, openAlertDialog]
  )

  return (
    <Dialog
      onClose={closeDialog}
      fixed
      width={500}
      dataTestid='proxy-dialog'
      canOutsideClickClose={false}
      canEscapeKeyClose={isValid}
    >
      <DialogHeader
        title={tx('proxy_settings')}
        onClose={closeDialog}
        dataTestid='proxy-settings'
      />
      <DialogBody className={styles.proxyDialogBody}>
        <div className={styles.container}>
          {proxyState.proxies.length > 0 && (
            <SettingsSwitch
              label={tx('proxy_use_proxy')}
              value={proxyState.enabled}
              onChange={changeProxyEnable}
            />
          )}
          <div>
            <h3 className='title'>{tx('proxy_list_header')}</h3>
            <p className={styles.explain}>{tx('proxy_add_explain')}</p>
          </div>
          <div className={styles.proxyList} role='radiogroup'>
            {proxyState.proxies.map((proxyUrl, index) => (
              <ProxyItemRow
                key={index}
                proxyUrl={proxyUrl}
                index={index}
                isActive={proxyUrl === proxyState.activeProxy}
                configured={configured}
                changeActiveProxy={changeActiveProxy}
                connectivityStatus={connectivityStatus}
                copyToClipboard={copyToClipboard}
                deleteProxy={deleteProxy}
              />
            ))}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        {showNewProxyForm && (
          <>
            <DeltaTextarea
              label={tx('proxy_add_url_hint')}
              value={newProxyUrl}
              onChange={e => setNewProxyUrl(e.target.value)}
            />
            <div className={styles.buttonsContainer}>
              <Button
                className='save-proxy'
                onClick={() => addProxy(newProxyUrl)}
                styling='primary'
                disabled={!maybeValidProxyUrl(newProxyUrl)}
              >
                {tx('proxy_add')}
              </Button>
              <Button
                className={styles.scanQrButton}
                onClick={openQrScanner}
                styling='primary'
                data-testid='scan-proxy-qr-button'
              >
                {tx('qrscan_title')}
              </Button>
            </div>
          </>
        )}
        {!showNewProxyForm && (
          <Button
            className={styles.addProxyButton}
            onClick={() => setShowNewProxyForm(true)}
            aria-label={tx('proxy_add')}
            title={tx('proxy_add')}
          >
            ＋
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  )
}
