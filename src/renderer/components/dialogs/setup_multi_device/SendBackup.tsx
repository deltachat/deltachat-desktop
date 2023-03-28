import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { getLogger } from '../../../../shared/logger'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { ScreenContext } from '../../../contexts'

import { runtime } from '../../../runtime'
import { selectedAccountId } from '../../../ScreenController'
import ConfirmationDialog from '../ConfirmationDialog'
import {
  DeltaDialogBase,
  DeltaDialogContent,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogHeader,
} from '../DeltaDialog'
import { DialogProps } from '../DialogController'

const log = getLogger('renderer/send_backup')

const TROUBLESHOOTING_URL = 'https://delta.chat/en/help#multiclient'

export function SendBackupDialog({ onClose }: DialogProps) {
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [qrCodeSVG, setQrSvg] = useState<string | null>(null)
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const [qrContent, setQrContent] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [stage, setStage] = useState<
    null | 'preparing' | 'awaiting_scan' | 'transfering' | 'error'
  >(null)
  const [error, setError] = useState<string | null>(null)

  const { openDialog } = useContext(ScreenContext)

  useEffect(() => {
    const accountId = selectedAccountId()

    return onDCEvent(accountId, 'ImexProgress', ({ progress }) => {
      setProgress(progress)
      if (stage === 'awaiting_scan') {
        setStage('transfering')
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
    if (qrContent) runtime.writeClipboardText(qrContent)
  }

  const startNetworkedTransfer = async () => {
    setInProgress(true)
    const accountId = selectedAccountId()
    try {
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
      BackendRemote.rpc.stopOngoingProcess(accountId)
    }
  }

  const cancel = async () => {
    openDialog(ConfirmationDialog, {
      header: tx('multidevice_abort'),
      message: tx('multidevice_abort_will_invalidate_copied_qr'),
      confirmLabel: tx('yes'),
      cancelLabel: tx('no'),
      cb: (yes: boolean) => {
        if (yes) {
          BackendRemote.rpc
            .stopOngoingProcess(selectedAccountId())
            .then(onClose)
        }
      },
    })
  }

  const tx = window.static_translate

  return (
    <DeltaDialogBase
      onClose={cancel}
      canEscapeKeyClose={true}
      isOpen={true}
      canOutsideClickClose={false}
      style={{ width: 'unset' }}
    >
      <DeltaDialogHeader title={tx('multidevice_title')} />
      <DeltaDialogContent className='send-backup-dialog'>
        <div className='container'>
          <div className='content'>
            {error}
            {!inProgress && (
              <>
                <p>{tx('multidevice_this_creates_a_qr_code')}</p>
              </>
            )}
            {inProgress && (
              <>
                {stage === 'awaiting_scan' && svgUrl && qrContent && (
                  <img className='setup-qr' src={svgUrl} />
                )}
                {stage === 'preparing' && <>{tx('preparing_account')}</>}

                {stage === 'transfering' && <>{tx('transfering')}</>}

                {progress && stage !== 'awaiting_scan' && (
                  <progress value={progress} max={1000}></progress>
                )}
              </>
            )}
          </div>
          {inProgress && (
            <div className='dialog-sidebar'>
              <div className='explain' key='networked'>
                <ol>
                  <li>
                    {tx('multidevice_install_dc_on_other_device')}{' '}
                    {tx('multidevice_experimental_hint')}
                  </li>
                  <li>{tx('multidevice_same_network_hint')}</li>
                  <li>{tx('multidevice_tap_scan_on_other_device')}</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </DeltaDialogContent>
      <DeltaDialogFooter>
        <DeltaDialogFooterActions style={{ alignItems: 'center' }}>
          {inProgress && (
            <>
              <p
                className='delta-button bold primary setup-new-device-troubleshooting-btn'
                onClick={() => runtime.openLink(TROUBLESHOOTING_URL)}
                style={{ marginRight: '10px' }}
                role='button'
              >
                {tx('troubleshooting')}{' '}
                <div
                  className='link-icon'
                  style={{
                    WebkitMask:
                      'url(../images/icons/open_in_new.svg) no-repeat center',
                  }}
                ></div>
              </p>
              {stage === 'awaiting_scan' && svgUrl && qrContent && (
                <p
                  className='delta-button bold primary'
                  onClick={copyQrToClipboard}
                  role='button'
                >
                  {tx('global_menu_edit_copy_desktop')}
                </p>
              )}
              <div style={{ flexGrow: 1 }}>{/** spacer */}</div>
            </>
          )}
          <p
            className={`delta-button bold primary`}
            onClick={cancel}
            role='button'
          >
            {tx('cancel')}
          </p>
          {!inProgress && (
            <>
              <div style={{ flexGrow: 1 }}>{/** spacer */}</div>
              <p
                className='delta-button bold primary'
                onClick={startNetworkedTransfer}
                role='button'
              >
                {tx('perm_continue')}
              </p>
            </>
          )}
        </DeltaDialogFooterActions>
      </DeltaDialogFooter>
    </DeltaDialogBase>
  )
}
