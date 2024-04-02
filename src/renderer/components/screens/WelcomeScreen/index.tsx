import React, { useEffect, useState } from 'react'
import { Intent } from '@blueprintjs/core'
import { dirname } from 'path'
import classNames from 'classnames'

import { getLogger } from '../../../../shared/logger'
import { runtime } from '../../../runtime'
import { DeltaProgressBar } from '../../Login-Styles'
import { Screens, selectedAccountId } from '../../../ScreenController'
import { BackendRemote, EffectfulBackendActions } from '../../../backend-com'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogWithHeader,
} from '../../Dialog'
import useDialog from '../../../hooks/useDialog'
import useProcessQr from '../../../hooks/useProcessQr'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import ImportQrCode from '../../dialogs/ImportQrCode'
import AlertDialog from '../../dialogs/AlertDialog'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import Button from '../../Button'

import styles from './styles.module.scss'

import type { DcEventType } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'

type Props = {
  backupFile: string
}

const log = getLogger('renderer/components/AccountsScreen')

function ImportBackupProgressDialog({
  onClose,
  backupFile,
}: Props & DialogProps) {
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
    <DialogWithHeader onClose={onClose} title={tx('import_backup_title')}>
      <DialogBody>
        <DialogContent>
          {error && (
            <p>
              {tx('error')}: {error}
            </p>
          )}
          <DeltaProgressBar
            progress={importProgress}
            intent={!error ? Intent.SUCCESS : Intent.DANGER}
          />
        </DialogContent>
      </DialogBody>
    </DialogWithHeader>
  )
}

function ImportButton() {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  async function onClickImportBackup() {
    const { defaultPath, setLastPath } = rememberLastUsedPath(
      LastUsedSlot.Backup
    )
    const file = await runtime.showOpenFileDialog({
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: '.tar or .bak', extensions: ['tar', 'bak'] }],
      defaultPath,
    })
    if (file) {
      openDialog(ImportBackupProgressDialog, {
        backupFile: file,
      })
      setLastPath(dirname(file))
    }
  }

  return (
    <Button
      className={styles.welcomeButton}
      type='secondary'
      onClick={onClickImportBackup}
    >
      {tx('import_backup_title')}
    </Button>
  )
}

export default function WelcomeScreen({
  selectedAccountId,
  onUnSelectAccount,
  onExitWelcomeScreen,
}: {
  selectedAccountId: number
  onUnSelectAccount: () => Promise<void>
  onExitWelcomeScreen: () => Promise<void>
}) {
  const tx = useTranslationFunction()
  const { openDialog, closeDialog } = useDialog()
  const processQr = useProcessQr()
  const [showBackButton, setShowBackButton] = useState(false)

  const onClickLogin = () => window.__changeScreen(Screens.Login)

  const onClickSecondDevice = () =>
    openDialog(ImportQrCode, {
      subtitle: tx('multidevice_open_settings_on_other_device'),
    })

  const onClickScanQr = () =>
    openDialog(ImportQrCode, { subtitle: tx('qrscan_hint') })

  const onCancel = async () => {
    try {
      const acInfo = await BackendRemote.rpc.getAccountInfo(selectedAccountId)
      if (acInfo.kind === 'Unconfigured') {
        await onUnSelectAccount()
        await EffectfulBackendActions.removeAccount(selectedAccountId)
      }
      onExitWelcomeScreen()
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

  useEffect(() => {
    ;(async () => {
      const allAccountIds = await BackendRemote.listAccounts()
      if (allAccountIds && allAccountIds.length > 1) {
        setShowBackButton(true)
      }
      if (window.__welcome_qr) {
        // this is the "callback" when opening dclogin or dcaccount from an already existing account,
        // the app needs to switch to the welcome screen first.
        await processQr(selectedAccountId, window.__welcome_qr, undefined, true)
        window.__welcome_qr = undefined
      }
    })()
  }, [openDialog, closeDialog, processQr, selectedAccountId])

  return (
    <div className='login-screen'>
      <div className='window'>
        <Dialog canEscapeKeyClose fixed onClose={() => {}} width={400}>
          <DialogHeader
            onClickBack={showBackButton ? onCancel : undefined}
            title={tx('add_account')}
          />
          <DialogBody>
            <div className='welcome-deltachat'>
              <img className='delta-icon' src='../images/intro1.png' />
              <p className='f1'>{tx('welcome_chat_over_email')}</p>
              <Button
                className={classNames(styles.welcomeButton, styles.withGap)}
                type='primary'
                onClick={onClickLogin}
              >
                {tx('login_header')}
              </Button>
              <Button
                className={styles.welcomeButton}
                type='secondary'
                onClick={onClickSecondDevice}
              >
                {tx('multidevice_receiver_title')}
              </Button>
              <Button
                className={styles.welcomeButton}
                type='secondary'
                onClick={onClickScanQr}
              >
                {tx('scan_invitation_code')}
              </Button>
              <ImportButton />
            </div>
          </DialogBody>
        </Dialog>
      </div>
    </div>
  )
}
