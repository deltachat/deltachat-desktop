import React, { useCallback, useEffect, useState } from 'react'
import { DialogProps } from '../../../contexts/DialogContext'
import Dialog, {
  DialogBody,
  DialogHeader,
  DialogFooter,
  FooterActions,
  FooterActionButton,
} from '../../Dialog'

import { C } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import SettingsSwitch from '../../Settings/SettingsSwitch'
import { DeltaInput } from '../../Login-Styles'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import Button from '../../Button'

import styles from './styles.module.scss'
import { Proxy } from '../../Settings/DefaultCredentials'
import { debounceWithInit } from '../../chat/ChatListHelpers'

import { getLogger } from '@deltachat-desktop/shared/logger'
import { unknownErrorToString } from '../../helpers/unknownErrorToString'

import ProxyItemRow from './ProxyItemRow'

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
  props: DialogProps & { accountId: number; configured: boolean }
) {
  const tx = useTranslationFunction()

  // used in  new proxy form
  const [newProxyUrl, setNewProxyUrl] = useState('')

  const [showNewProxyForm, setShowNewProxyForm] = useState(false)
  const [showEnableSwitch, setShowEnableSwitch] = useState(false)

  // updated on connectivity change
  const [connectivityStatus, setConnectivityStatus] = useState(
    C.DC_CONNECTIVITY_NOT_CONNECTED
  )

  // configured means the account is already configured
  // which is needed to decide if we show the connectivity status
  const { accountId, configured, onClose } = props

  const openAlertDialog = useAlertDialog()

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { proxy_enabled, proxy_url } =
          await BackendRemote.rpc.batchGetConfig(accountId, [
            'proxy_enabled',
            'proxy_url',
          ])
        if (proxy_enabled !== undefined) {
          const enabled = proxy_enabled === Proxy.ENABLED
          let proxies: string[] = []
          let activeProxy = null
          if (proxy_url && proxy_url.length > 0) {
            // split proxy_url by new line
            // and remove empty lines from possible previous settings
            const proxyLines = proxy_url.split(/\n/).filter(s => !!s)
            proxies = proxyLines
            activeProxy = enabled ? proxyLines[0] : null
          }
          setProxyState(prev => ({
            ...prev,
            enabled,
            proxies,
            activeProxy,
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
    loadSettings()
  }, [accountId, openAlertDialog, tx])

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

  const addProxy = async (proxyUrl: string) => {
    if (proxyState.proxies.includes(proxyUrl)) {
      log.warn('skip already existing proxy', proxyUrl)
      // proxy alread exists
      return
    }
    let proxyValid = maybeValidProxyUrl(proxyUrl)
    let errorMessage = ''
    if (proxyValid) {
      try {
        const parsedUrl = await BackendRemote.rpc.checkQr(accountId, proxyUrl)
        proxyValid = parsedUrl.kind === 'proxy'
      } catch (error) {
        log.error('checkQr failed with error', error)
        errorMessage = unknownErrorToString(error)
        proxyValid = false
      }
    }
    if (!proxyValid) {
      openAlertDialog({
        message:
          tx('proxy_invalid') + (errorMessage ? `\n${errorMessage}` : ''),
      })
      return
    }
    updateProxyState({
      enabled: true,
      proxies: [...proxyState.proxies, proxyUrl],
      activeProxy: proxyUrl,
    })
    setShowNewProxyForm(false)
    setNewProxyUrl('')
  }

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

  // show/hide the enable switch
  useEffect(() => {
    if (proxyState.enabled) {
      setShowEnableSwitch(proxyState.proxies.length > 0)
    } else {
      setShowEnableSwitch(proxyState.proxies.length > 0)
    }
  }, [showEnableSwitch, proxyState.enabled, proxyState.proxies])

  useEffect(() => {
    let removeConnectivityListener = () => {}
    const checkConnectivity = async () => {
      if (configured) {
        const connectivity = await BackendRemote.rpc.getConnectivity(accountId)
        setConnectivityStatus(connectivity)
        removeConnectivityListener = onDCEvent(
          accountId,
          'ConnectivityChanged',
          () =>
            debounceWithInit(async () => {
              const connectivity =
                await BackendRemote.rpc.getConnectivity(accountId)
              setConnectivityStatus(connectivity)
            }, 300)()
        )
      }
    }
    checkConnectivity()
    return () => {
      removeConnectivityListener()
    }
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
    proxyState,
  ])

  /**
   * validate settings before closing
   * to avoid invalid settings
   */
  const closeDialog = () => {
    if (proxyState.enabled && proxyState.proxies.length === 0) {
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

  // some basic validations, returns true if the url seems valid
  // and is not already in the list of proxies
  const maybeValidProxyUrl = (url: string): boolean => {
    const parts = url.split('://')
    return (
      parts.length === 2 &&
      parts[0].length >= 2 && // shortest protocol is ss://
      parts[1].length >= 1 && // host
      !proxyState.proxies.includes(url)
    )
  }

  return (
    <Dialog
      fixed
      width={400}
      dataTestid='proxy-dialog'
      canOutsideClickClose={false}
    >
      <DialogHeader
        title={tx('menu_settings')}
        onClose={closeDialog}
        dataTestid='proxy-settings'
      />
      <DialogBody className={styles.proxyDialogBody}>
        <div className={styles.container}>
          {showEnableSwitch && (
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
          <form>
            <DeltaInput
              label={tx('proxy_add_url_hint')}
              value={newProxyUrl}
              onChange={e => setNewProxyUrl(e.target.value)}
            />
            <Button
              className='save-proxy'
              onClick={() => addProxy(newProxyUrl)}
              styling='primary'
              disabled={!maybeValidProxyUrl(newProxyUrl)}
            >
              {tx('proxy_add')}
            </Button>
          </form>
        )}
        {!showNewProxyForm && (
          <Button
            className={styles.addProxyButton}
            onClick={() => setShowNewProxyForm(true)}
            styling='secondary'
            aria-label={tx('proxy_add')}
            title={tx('proxy_add')}
          >
            ＋
          </Button>
        )}
        <FooterActions>
          <FooterActionButton styling='secondary' onClick={closeDialog}>
            {tx('close')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
