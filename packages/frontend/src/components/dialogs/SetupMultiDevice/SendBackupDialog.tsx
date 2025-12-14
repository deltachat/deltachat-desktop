import React, { useState, useEffect, useCallback } from 'react'

import { getLogger } from '../../../../../shared/logger'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { selectedAccountId } from '../../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActions,
} from '../../Dialog'
import FooterActionButton from '../../Dialog/FooterActionButton'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useConfirmationDialog from '../../../hooks/dialog/useConfirmationDialog'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'

import type { PropsWithChildren } from 'react'
import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.scss'

const log = getLogger('renderer/send_backup')

export function SendBackupDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()
  const openAlertDialog = useAlertDialog()

  const [inProgress, setInProgress] = useState<boolean>(false)
  const [qrCodeSVG, setQrSvg] = useState<string | null>(null)
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const [qrContent, setQrContent] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [stage, setStage] = useState<
    null | 'preparing' | 'awaiting_scan' | 'transferring' | 'error'
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [wasCopied, setCopied] = useState(false)

  useEffect(() => {
    const accountId = selectedAccountId()

    return onDCEvent(accountId, 'ImexProgress', ({ progress }) => {
      setProgress(progress)
      if (stage === 'awaiting_scan') {
        setStage('transferring')
      }
    })
  }, [stage])

  useEffect(() => {
    const accountId = selectedAccountId()
    return () => {
      BackendRemote.rpc.stopOngoingProcess(accountId)
    }
  }, [])

  useEffect(() => {
    if (!qrCodeSVG) {
      return
    }
    const url = URL.createObjectURL(
      new Blob([qrCodeSVG], { type: 'image/svg+xml' })
    )
    setSvgUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [qrCodeSVG])

  const copyQrToClipboard = () => {
    if (qrContent) {
      runtime.writeClipboardText(qrContent)
      setCopied(true)
      openAlertDialog({
        message: tx('copied_to_clipboard'),
      })
    }
  }

  const startNetworkedTransfer = async () => {
    setInProgress(true)
    const accountId = selectedAccountId()
    try {
      setError(null)
      setStage('preparing')
      const transfer = BackendRemote.rpc.provideBackup(accountId)
      setQrSvg(await BackendRemote.rpc.getBackupQrSvg(accountId))
      setQrContent(await BackendRemote.rpc.getBackupQr(accountId))
      setStage('awaiting_scan')
      await transfer
      onClose()
    } catch (error) {
      log.errorWithoutStackTrace('networked transfer failed', error)
      setQrSvg(null)
      // show the error on page or in a dialog too
      setError('Error: ' + (error as any)?.message)
      setStage('error')
    } finally {
      setInProgress(false)
      setQrSvg(null)
      setQrContent(null)
      setCopied(false)
      BackendRemote.rpc.stopOngoingProcess(accountId)
    }
  }

  const cancel = useCallback(async () => {
    if (stage === 'error' || stage === null) {
      return onClose()
    }

    const confirmed = await openConfirmationDialog({
      ...(wasCopied
        ? {
            header: tx('multidevice_abort'),
            message: tx('multidevice_abort_will_invalidate_copied_qr'),
          }
        : { message: tx('multidevice_abort') }),
      confirmLabel: tx('yes'),
      cancelLabel: tx('no'),
    })

    if (confirmed) {
      BackendRemote.rpc.stopOngoingProcess(selectedAccountId()).then(onClose)
    }
  }, [onClose, openConfirmationDialog, stage, tx, wasCopied])

  return (
    <Dialog
      canEscapeKeyClose={true}
      canOutsideClickClose={false}
      onClose={cancel}
      width={680}
    >
      <DialogHeader title={tx('multidevice_title')} />
      {!inProgress && (
        <>
          <DialogBody>
            <DialogContent>
              <p>{tx('multidevice_this_creates_a_qr_code')}</p>
            </DialogContent>
          </DialogBody>
          <DialogFooter>
            <FooterActions align='spaceBetween'>
              <FooterActionButton onClick={cancel}>
                {tx('cancel')}
              </FooterActionButton>
              <FooterActionButton
                styling='primary'
                onClick={startNetworkedTransfer}
              >
                {tx('perm_continue')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </>
      )}
      {inProgress && (
        <>
          <DialogBody>
            <DialogContent>
              <SendBackup>
                <SendBackupMain>
                  {stage === 'awaiting_scan' && svgUrl && qrContent && (
                    <img className={styles.qrCode} src={svgUrl} />
                  )}
                  <SendBackupMainProgress
                    style={stage === 'transferring' ? { width: '100%' } : {}}
                  >
                    {stage === 'preparing' && <>{tx('preparing_account')}</>}
                    {stage === 'transferring' && <>{tx('transferring')}</>}
                    {progress && stage !== 'awaiting_scan' && (
                      <>
                        <br />
                        <progress value={progress} max={1000} />
                      </>
                    )}
                  </SendBackupMainProgress>
                </SendBackupMain>
                {stage !== 'transferring' && <SendBackupSteps />}
              </SendBackup>
              {error}
            </DialogContent>
          </DialogBody>
          <DialogFooter>
            <FooterActions align='spaceBetween'>
              <span className={styles.buttonGroup}>
                <FooterActionButton
                  onClick={() => runtime.openHelpWindow('multiclient')}
                >
                  {tx('troubleshooting')}
                </FooterActionButton>
                {stage === 'awaiting_scan' && svgUrl && qrContent && (
                  <FooterActionButton onClick={copyQrToClipboard}>
                    {tx('global_menu_edit_copy_desktop')}
                  </FooterActionButton>
                )}
              </span>
              <FooterActionButton onClick={cancel}>
                {tx('cancel')}
              </FooterActionButton>
            </FooterActions>
          </DialogFooter>
        </>
      )}
    </Dialog>
  )
}

function SendBackup({ children }: PropsWithChildren<{}>) {
  return <div className={styles.sendBackup}>{children}</div>
}

function SendBackupMain({ children }: PropsWithChildren<{}>) {
  return <div className={styles.sendBackupMain}>{children}</div>
}

function SendBackupMainProgress({
  children,
  style,
}: PropsWithChildren<{ style: React.CSSProperties }>) {
  return (
    <div className={styles.sendBackupMainProgress} style={style}>
      {children}
    </div>
  )
}

function SendBackupSteps() {
  const tx = useTranslationFunction()

  return (
    <div className={styles.sendBackupSteps}>
      <ol className={styles.sendBackupStepsList}>
        <li>{tx('multidevice_install_dc_on_other_device')}</li>
        <li>{tx('multidevice_same_network_hint')}</li>
        <li>{tx('multidevice_tap_scan_on_other_device')}</li>
      </ol>
    </div>
  )
}
