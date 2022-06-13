import { Classes, Card, Elevation, Intent } from '@blueprintjs/core'
import { IpcRendererEvent } from 'electron'
import React, { useEffect, useState, useContext } from 'react'
import { getLogger } from '../../../shared/logger'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import { DeltaBackend } from '../../delta-remote'
import { ipcBackend } from '../../ipc'
import { runtime } from '../../runtime'
import DeltaDialog, {
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogHeader,
} from '../dialogs/DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { DialogProps } from '../dialogs/DialogController'
import ScreenController from '../../ScreenController'

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

  useEffect(() => {
    ;(async () => {
      let account
      try {
        account = await DeltaBackend.call('backup.import', backupFile)
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
  }, [backupFile, onClose])

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

const ImportButton = function ImportButton(_props: any) {
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
    <div className='welcome-button' onClick={onClickImportBackup}>
      {tx('import_backup_title')}
    </div>
  )
}

export default function WelcomeScreen({
  selectAccount,
  showBackButton,
  onClickBack,
  onAddAccount,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  showBackButton: boolean
  onClickBack: () => void
  onAddAccount: () => void
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)
  const onClickScanQr = () => openDialog('ImportQrCode')

  const addAccount = async () => {
    const accountId = await DeltaBackend.call('login.addAccount')
    selectAccount(accountId)
    onAddAccount()
  }

  return (
    <>
      <DeltaDialogHeader
        showBackButton={showBackButton}
        onClickBack={onClickBack}
      />
      <DeltaDialogBody id='welcome-dialog-body'>
        <DeltaDialogContent>
          <div className='welcome-deltachat'>
            <img className='delta-icon' src='../images/intro1.png' />
            <p className='f1'>{tx('welcome_chat_over_email')}</p>
            {/* <p className='f2'>{tx('welcome_intro1_message')}</p> */}
            <div
              id='action-go-to-login'
              className='welcome-button'
              onClick={addAccount}
            >
              {tx('login_header')}
            </div>
            <ImportButton />
            <div className='welcome-button' onClick={onClickScanQr}>
              {tx('scan_invitation_code')}
            </div>
          </div>
        </DeltaDialogContent>
      </DeltaDialogBody>
    </>
  )
}
