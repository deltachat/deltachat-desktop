import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { getLogger } from '../../../../shared/logger'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import { ScreenContext } from '../../../contexts'

import { runtime } from '../../../runtime'
import { selectedAccountId } from '../../../ScreenController'
import ConfirmationDialog from '../ConfirmationDialog'
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
    null | 'preparing' | 'awaiting_scan' | 'transfering'
  >(null)

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
    } catch (error) {
      // todo show the error on page or in a dialog too
      log.errorWithoutStackTrace('networked transfer failed', error)
      setQrSvg(null)
    } finally {
      setStage(null)
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
          BackendRemote.rpc.stopOngoingProcess(selectedAccountId())
        }
      },
    })
  }

  const tx = window.static_translate

  return (
    <div className='send-backup-dialog-container'>
      <div className='send-backup-dialog'>
        <div className='header'>
          {tx('multidevice_title')}{' '}
          <button className='close-btn' onClick={onClose} disabled={inProgress}>
            X
          </button>
        </div>
        <div className='container'>
          <div className='content'>
            {!inProgress && (
              <>
                <p>{tx('multidevice_this_creates_a_qr_code')}</p>
                <button
                  className='delta-button-round'
                  onClick={startNetworkedTransfer}
                >
                  {tx('start')}
                </button>
              </>
            )}
            {inProgress && (
              <>
                {stage === 'awaiting_scan' && svgUrl && qrContent && (
                  <>
                    <img className='setup-qr' src={svgUrl} />
                    <button
                      className='delta-button-round'
                      onClick={copyQrToClipboard}
                    >
                      {tx('menu_copy_to_clipboard')}
                    </button>
                  </>
                )}
                {stage === 'preparing' && <>{tx('preparing_account')}</>}

                {stage === 'transfering' && <>{tx('transfering')}</>}

                {progress && stage !== 'awaiting_scan' && (
                  <progress value={progress} max={1000}></progress>
                )}

                <button className='delta-button-round' onClick={cancel}>
                  {tx('cancel')}
                </button>
              </>
            )}
          </div>
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
            <div>
              <button
                className='delta-button-round troubleshooting-btn'
                onClick={() => runtime.openLink(TROUBLESHOOTING_URL)}
              >
                {tx('troubleshooting')}{' '}
                <div
                  className='link-icon'
                  style={{
                    WebkitMask:
                      'url(../images/icons/open_in_new.svg) no-repeat center',
                  }}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
