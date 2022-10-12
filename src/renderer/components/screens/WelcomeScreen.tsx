import { Classes, Card, Elevation, Intent } from '@blueprintjs/core'
import { IpcRendererEvent } from 'electron'
import React, { useEffect, useState, useContext } from 'react'
import { getLogger } from '../../../shared/logger'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { ipcBackend } from '../../ipc'
import { runtime } from '../../runtime'
import DeltaDialog, {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogHeader,
} from '../dialogs/DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { DialogProps } from '../dialogs/DialogController'
import { Screens, selectedAccountId } from '../../ScreenController'
import { BackendRemote, EffectfulBackendActions } from '../../backend-com'
import processOpenQrUrl from '../helpers/OpenQrUrl'

const log = getLogger('renderer/components/AccountsScreen')

function ImportBackupProgressDialog({
  onClose,
  isOpen,
  backupFile,
}: DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)

  const onAll = (eventName: IpcRendererEvent, data1: string, data2: string) => {
    log.debug('ALL core events: ', eventName, data1, data2)
  }
  const onImexProgress = (_evt: any, [progress, _data2]: [number, any]) => {
    setImportProgress(progress)
  }

  const onError = (_data1: any, data2: string) => {
    setError('DC_EVENT_ERROR: ' + data2)
  }

  const accountId = selectedAccountId()

  useEffect(() => {
    ;(async () => {
      let account
      try {
        log.debug(`Starting backup import of ${backupFile}`)
        await BackendRemote.rpc.importBackup(accountId, backupFile, null)
        account = await BackendRemote.rpc.getAccountInfo(accountId)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
        return
      }
      onClose()
      window.__selectAccount(account.id)
    })()

    ipcBackend.on('ALL', onAll)
    ipcBackend.on('DC_EVENT_IMEX_PROGRESS', onImexProgress)
    ipcBackend.on('DC_EVENT_ERROR', onError)

    return () => {
      ipcBackend.removeListener('ALL', onAll)
      ipcBackend.removeListener('DC_EVENT_IMEX_PROGRESS', onImexProgress)
      ipcBackend.removeListener('DC_EVENT_ERROR', onError)
    }
  }, [backupFile, onClose, accountId])

  const tx = useTranslationFunction()
  return (
    <DeltaDialog
      onClose={onClose}
      title={tx('import_backup_title')}
      // canOutsideClickClose
      isOpen={isOpen}
      style={{ top: '40%' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <Card elevation={Elevation.ONE}>
          {error && (
            <p>
              {tx('error')}: {error}
            </p>
          )}
          <DeltaProgressBar
            progress={importProgress}
            intent={!error ? Intent.SUCCESS : Intent.DANGER}
          />
        </Card>
      </div>
    </DeltaDialog>
  )
}

const ImportButton = function ImportButton() {
  const tx = useTranslationFunction()

  async function onClickImportBackup() {
    const file = await runtime.showOpenFileDialog({
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: '.tar or .bak', extensions: ['tar', 'bak'] }],
      defaultPath: runtime.getAppPath('downloads'),
    })
    if (file) {
      window.__openDialog(ImportBackupProgressDialog, {
        backupFile: file,
      })
    }
  }

  return (
    <button
      className='delta-button-round secondary'
      onClick={onClickImportBackup}
    >
      {tx('import_backup_title')}
    </button>
  )
}

export default function WelcomeScreen({
  selectedAccountId,
}: {
  selectedAccountId: number
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const onClickScanQr = () => openDialog('ImportQrCode')
  const [showBackButton, setShowBackButton] = useState(false)

  useEffect(() => {
    ;(async () => {
      const allAccountIds = await BackendRemote.listAccounts()
      if (allAccountIds && allAccountIds.length > 1) {
        setShowBackButton(true)
      }
      if (window.__welcome_qr) {
        // this is the "callback" when opening dclogin or dcaccount from an already existing account,
        // the app needs to switch to the welcome screen first.
        await processOpenQrUrl(window.__welcome_qr, undefined, true)
        window.__welcome_qr = undefined
      }
    })()
  }, [])

  const onCancel = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.type === 'Unconfigured') {
        await EffectfulBackendActions.logout()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      window.__changeScreen(Screens.AccountList)
    } catch (error) {
      if (error instanceof Error) {
        window.__openDialog('AlertDialog', {
          message: error?.message,
          cb: () => {},
        })
      } else {
        log.error('unexpected error type', error)
        throw error
      }
    }
  }

  return (
    <div className='login-screen'>
      <div className='window'>
        <DeltaDialogBase
          isOpen={true}
          backdropProps={{ className: 'no-backdrop' }}
          onClose={() => {}}
          fixed={true}
          canEscapeKeyClose={true}
        >
          <>
            <DeltaDialogHeader
              showBackButton={showBackButton}
              onClickBack={onCancel}
              title={tx('add_account')}
            />
            <DeltaDialogBody id='welcome-dialog-body'>
              <DeltaDialogContent id='welcome-dialog-content'>
                <div className='welcome-deltachat'>
                  <img className='delta-icon' src='../images/intro1.png' />
                  <p className='f1'>{tx('welcome_chat_over_email')}</p>
                  {/* <p className='f2'>{tx('welcome_intro1_message')}</p> */}
                  <button
                    id='action-login-to-email'
                    className='delta-button-round'
                    onClick={() => window.__changeScreen(Screens.Login)}
                  >
                    {tx('login_header')}
                  </button>
                  <ImportButton />
                  <button
                    className='delta-button-round secondary'
                    onClick={onClickScanQr}
                  >
                    {tx('scan_invitation_code')}
                  </button>
                </div>
              </DeltaDialogContent>
            </DeltaDialogBody>
          </>
        </DeltaDialogBase>
      </div>
    </div>
  )
}
