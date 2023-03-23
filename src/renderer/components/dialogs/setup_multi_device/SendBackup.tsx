import React, { useEffect } from 'react'
import { useState } from 'react'
import { getLogger } from '../../../../shared/logger'
import { BackendRemote, onDCEvent } from '../../../backend-com'

import { runtime } from '../../../runtime'
import { selectedAccountId } from '../../../ScreenController'
import { DialogProps } from '../DialogController'
import { onBackupExport } from '../Settings-Backup'

const log = getLogger('renderer/send_backup')

export function SendBackupDialog({ onClose }: DialogProps) {
  const [mode, setMode] = useState<'networked' | 'manual'>('networked')
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [qrCodeSVG, setQrSvg] = useState<string | null>(null)
  const [svgUrl, setSvgUrl] = useState<string | null>(null)
  const [qrContent, setQrContent] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [stage, setStage] = useState<
    null | 'preparing' | 'awaiting_scan' | 'transfering'
  >(null)

  useEffect(() => {
    const accountId = selectedAccountId()

    const unsub1 = onDCEvent(accountId, 'ImexProgress', ({ progress }) => {
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

  const startManualBackup = () => {
    // todo integrate into this dialog?
    onBackupExport()
  }

  const cancel = async () => {
    await BackendRemote.rpc.stopOngoingProcess(selectedAccountId())
  }

  return (
    <div className='send-backup-dialog-container'>
      <div className='send-backup-dialog'>
        <div className='header'>
          Setup Multidevice{' '}
          <button className='close-btn' onClick={onClose} disabled={inProgress}>
            X
          </button>
        </div>
        <div className='container'>
          <div className='content'>
            {mode === 'networked' && (
              <>
                {!inProgress && (
                  <>
                    <button
                      className='delta-button-round'
                      onClick={startNetworkedTransfer}
                    >
                      Start
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
                          Copy QR Content to Clipboard
                        </button>
                      </>
                    )}
                    {stage === 'preparing' && <>Preparing</>}

                    {progress && stage !== 'awaiting_scan' && (
                      <progress value={progress} max={1000}></progress>
                    )}

                    <button className='delta-button-round' onClick={cancel}>
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
            {mode === 'manual' && (
              <>
                <button
                  className='delta-button-round'
                  onClick={startManualBackup}
                >
                  Start Backup
                </button>
              </>
            )}
          </div>
          <div className='dialog-sidebar'>
            <div className='method' aria-label='setup method'>
              <button
                className={`delta-button-tab ${
                  mode === 'networked' ? 'selected' : ''
                }`}
                aria-checked={mode === 'networked'}
                onClick={() => setMode('networked')}
                disabled={inProgress}
              >
                Automatic (Local Network)
              </button>
              <button
                className={`delta-button-tab ${
                  mode === 'manual' ? 'selected' : ''
                }`}
                aria-checked={mode === 'networked'}
                onClick={() => setMode('manual')}
                disabled={inProgress}
              >
                Manual Backup Transfer
              </button>
            </div>
            {mode === 'networked' && (
              <div className='explain' key='networked'>
                <ol>
                  <li>
                    Install Delta Chat on your second Device
                    (https://get.delta.chat)
                  </li>
                  <li>
                    Make sure both devices are connected to the same Network /
                    WLAN
                  </li>
                  <li>
                    On your second device press "scan qr code" and scan the qr
                    code that is shown here.
                  </li>
                </ol>

                <div className='notes'>
                  <h4>Important</h4>
                  <ul>
                    <li>Never share this qr code with anyone!</li>
                    <li>
                      Only works when both devices are in the same network
                    </li>
                    <li>Both Devices need Deltachat version 1.36 or newer.</li>
                  </ul>
                </div>
              </div>
            )}

            {mode === 'manual' && (
              <div className='explain' key='manual'>
                <ol>
                  <li>
                    Install Delta Chat on your second Device
                    (https://get.delta.chat)
                  </li>
                  <li>
                    Export a Backup on this Device and move the file to your
                    second device securely
                  </li>
                  <li>Press "Import Backup" on your Second Device.</li>
                  <li>Delete the Backup after usage.</li>
                </ol>

                <div className='notes'>
                  <h4>Important</h4>
                  <ul>
                    <li>
                      The Backups are unencrypted and contain your private key
                      so don't transfer over cloud providers and delete after
                      usage
                    </li>
                    <li>encrypted backups will come in a future version</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
