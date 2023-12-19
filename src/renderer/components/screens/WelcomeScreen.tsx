import { Classes, Card, Elevation, Intent } from '@blueprintjs/core'
import React, { useEffect, useState } from 'react'
import { DcEventType } from '@deltachat/jsonrpc-client'

import { getLogger } from '../../../shared/logger'
import { runtime } from '../../runtime'
import DeltaDialog, {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogHeader,
} from '../dialogs/DeltaDialog'
import { DeltaProgressBar } from '../Login-Styles'
import { Screens, selectedAccountId } from '../../ScreenController'
import { BackendRemote, EffectfulBackendActions } from '../../backend-com'
import processOpenQrUrl from '../helpers/OpenQrUrl'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'
import ImportQrCode from '../dialogs/ImportQrCode'
import AlertDialog from '../dialogs/AlertDialog'

import type { DialogProps } from '../../contexts/DialogContext'

const log = getLogger('renderer/components/AccountsScreen')

function ImportBackupProgressDialog({
  onClose,
  backupFile,
}: DialogProps & {
  backupFile: string
}) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState<string | null>(null)

  const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
    setImportProgress(progress)
  }

  const accountId = selectedAccountId()

  useEffect(() => {
    ;(async () => {
      try {
        log.debug(`Starting backup import of ${backupFile}`)
        await BackendRemote.rpc.importBackup(accountId, backupFile, null)
        await BackendRemote.rpc.setConfig(
          accountId,
          'verified_one_on_one_chats',
          '1'
        )
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
        return
      }
      onClose()
      window.__selectAccount(accountId)
    })()

    const emitter = BackendRemote.getContextEvents(accountId)
    emitter.on('ImexProgress', onImexProgress)
    return () => {
      emitter.off('ImexProgress', onImexProgress)
    }
  }, [backupFile, onClose, accountId])

  const tx = useTranslationFunction()
  return (
    <DeltaDialog
      onClose={onClose}
      title={tx('import_backup_title')}
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
  const { openDialog } = useDialog()

  async function onClickImportBackup() {
    const backupFile = await runtime.showOpenFileDialog({
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: '.tar or .bak', extensions: ['tar', 'bak'] }],
      defaultPath: runtime.getAppPath('downloads'),
    })

    if (backupFile) {
      openDialog(ImportBackupProgressDialog, {
        backupFile,
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
  const { openDialog, closeDialog } = useDialog()

  const onClickScanQr = () =>
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })
  const onClickSecondDevice = () =>
    openDialog(ImportQrCode, {
      subtitle: tx('multidevice_open_settings_on_other_device'),
    })
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
        await processOpenQrUrl(
          openDialog,
          closeDialog,
          window.__welcome_qr,
          undefined,
          true
        )
        window.__welcome_qr = undefined
      }
    })()
  }, [closeDialog, openDialog])

  const onCancel = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.kind === 'Unconfigured') {
        await EffectfulBackendActions.logout()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      window.__changeScreen(Screens.AccountList)
    } catch (error) {
      if (error instanceof Error) {
        openDialog(AlertDialog, {
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
                  <button
                    className='delta-button-round secondary'
                    onClick={onClickSecondDevice}
                  >
                    {tx('multidevice_receiver_title')}
                  </button>
                  <button
                    className='delta-button-round secondary'
                    onClick={onClickScanQr}
                  >
                    {tx('scan_invitation_code')}
                  </button>
                  <ImportButton />
                </div>
              </DeltaDialogContent>
            </DeltaDialogBody>
          </>
        </DeltaDialogBase>
      </div>
    </div>
  )
}
