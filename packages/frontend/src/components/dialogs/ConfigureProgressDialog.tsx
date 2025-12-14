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
import { defaultCredentials, Credentials } from '../Settings/DefaultCredentials'
import { getLogger } from '@deltachat-desktop/shared/logger'
const log = getLogger('renderer/loginForm')

interface ConfigureProgressDialogProps {
  credentials: Credentials | null
  qrCode?: string | null // must be of type DCACCOUNT or DCLOGIN
  onSuccess?: () => void
  onUserCancellation?: () => void
  onFail: (error: string) => void
}

/**
 * Shows a progress bar while configuring the account
 * This dialog is called after editing an existing account
 * or when creating a new account in InstantOnboarding flow
 */
export function ConfigureProgressDialog({
  credentials,
  qrCode,
  onSuccess,
  onUserCancellation,
  onFail,
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
          if (!credentials && !qrCode) {
            throw new Error(
              'ConfigureProgressDialog needs either credentials or a qrCode'
            )
          }
          const configuration: Credentials = credentials || defaultCredentials()
          let isInitialOnboarding = false
          if (qrCode) {
            // create a new transport for accountId based on the QR code
            await BackendRemote.rpc.addTransportFromQr(accountId, qrCode)
            isInitialOnboarding = true
          } else if (
            configuration.addr !== undefined &&
            configuration.addr.length > 0
          ) {
            const existingTransports =
              await BackendRemote.rpc.listTransports(accountId)
            if (
              existingTransports.length === 1 &&
              existingTransports[0].addr === ''
            ) {
              isInitialOnboarding = true
            }
            // If the address already exists the transport config is updated
            // otherwise a new transport is added (if the user entered credentials manually)
            await BackendRemote.rpc.addOrUpdateTransport(
              accountId,
              configuration
            )
          }

          if (wasCanceled.current) {
            onClose()
            onUserCancellation?.()
            return
          }
          if (isInitialOnboarding) {
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
          <FooterActionButton onClick={onCancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
