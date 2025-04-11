import { DcEventType } from '@deltachat/jsonrpc-client'
import React, { useEffect, useRef, useState } from 'react'

import { DeltaProgressBar } from '../Login-Styles'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { getDeviceChatId, saveLastChatId } from '../../backend/chat'

import type { DialogProps } from '../../contexts/DialogContext'
import { Credentials, defaultCredentials, Proxy } from '../LoginForm'
import { getLogger } from '@deltachat-desktop/shared/logger'
const log = getLogger('renderer/loginForm')

interface ConfigureProgressDialogProps {
  credentials?: Credentials
  onSuccess?: () => void
  onUserCancellation?: () => void
  onFail: (error: string) => void
  proxyUpdated: boolean
}

export function ConfigureProgressDialog({
  credentials = defaultCredentials(),
  onSuccess,
  onUserCancellation,
  onFail,
  proxyUpdated,
  ...dialogProps
}: ConfigureProgressDialogProps & DialogProps) {
  const { onClose } = dialogProps
  const [progress, setProgress] = useState(0)
  const [progressComment, setProgressComment] = useState('')
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()

  const onConfigureProgress = ({
    progress,
    comment,
  }: DcEventType<'ConfigureProgress'>) => {
    progress !== 0 && setProgress(progress)
    setProgressComment(comment || '')
  }

  const wasCanceled = useRef(false)

  const onCancel = async (_event: any) => {
    try {
      if (window.__selectedAccountId === undefined) {
        throw new Error('no selected account')
      }
      wasCanceled.current = true
      await BackendRemote.rpc.stopOngoingProcess(window.__selectedAccountId)
    } catch (error: any) {
      log.error('failed to stopOngoingProcess', error)
      onFail('failed to stopOngoingProcess' + error.message || error.toString())
      // If it fails to cancel but is still successful, it should behave like normal.
      wasCanceled.current = false
    }
    onClose()
  }

  useEffect(
    () => {
      ;(async () => {
        try {
          let isFirstOnboarding = true
          const configuration: Credentials = {
            ...credentials,
          }
          const { proxyEnabled, proxyUrl, ...transportConfig } = configuration
          // Set proxy settings only if neccessary!
          if (proxyUpdated) {
            await BackendRemote.rpc.batchSetConfig(accountId, {
              proxy_enabled:
                proxyEnabled === true ? Proxy.ENABLED : Proxy.DISABLED,
              proxy_url: proxyUrl,
            })
          }
          if (
            transportConfig.addr !== undefined &&
            transportConfig.addr.length > 0
          ) {
            // On first time onboarding addr is empty here, since the new transport is created later
            isFirstOnboarding = false
            // If the address already exists the transport config is updated
            // otherwise a new transport is added (not supported yet)
            await BackendRemote.rpc.addTransport(accountId, transportConfig)
          }

          if (wasCanceled.current) {
            onClose()
            onUserCancellation?.()
            return
          }

          if (isFirstOnboarding) {
            // Select 'Device Messages' chat as the initial one. This will serve
            // as a first introduction to the app after they've entered
            const deviceChatId = await getDeviceChatId(accountId)
            if (deviceChatId) {
              await saveLastChatId(accountId, deviceChatId)
              // SettingsStoreInstance is reloaded the first time the main screen is shown
            }
          }

          onClose()
          onSuccess && onSuccess()
        } catch (err: any) {
          log.error('configure error', err)
          onClose()
          onFail(err.message || err.toString())
        }
      })()
    },
    [wasCanceled] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ConfigureProgress', onConfigureProgress)
    return () => {
      emitter.off('ConfigureProgress', onConfigureProgress)
    }
  }, [accountId])

  return (
    <Dialog
      onClose={onClose}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
    >
      <DialogBody>
        <DialogContent paddingTop>
          <DeltaProgressBar progress={progress} />
          <p>{progressComment}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton styling='danger' onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
