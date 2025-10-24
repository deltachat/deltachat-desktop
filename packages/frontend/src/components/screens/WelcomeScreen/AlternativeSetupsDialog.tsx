import React from 'react'
import { dirname } from 'path'

import Button from '../../Button'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import ImportBackupProgressDialog from './ImportBackupProgressDialog'

import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { ReceiveBackupDialog } from '../../dialogs/SetupMultiDevice'
import { BackendRemote } from '../../../backend-com'

interface Props {
  selectedAccountId: number
}

export default function AlternativeSetupsDialog({
  onClose,
  selectedAccountId,
}: DialogProps & Props) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  /** remove configuration if user did set picture or displayname in the instant onboarding dialog already */
  const resetAccount = () =>
    BackendRemote.rpc.batchSetConfig(selectedAccountId, {
      selfavatar: null,
      displayname: null,
    })

  const onClickSecondDevice = () => {
    resetAccount()
    openDialog(ReceiveBackupDialog)
    onClose()
  }

  async function onClickImportBackup() {
    await resetAccount()

    const { defaultPath, setLastPath } = await rememberLastUsedPath(
      LastUsedSlot.Backup
    )

    const [file] = await runtime.showOpenFileDialog({
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: '.tar or .bak', extensions: ['tar', 'bak'] }],
      defaultPath,
    })

    if (file) {
      onClose()
      openDialog(ImportBackupProgressDialog, {
        backupFile: file,
      })
      setLastPath(dirname(file))
    }
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('onboarding_alternative_logins')}
        onClose={onClose}
      />
      <DialogBody>
        <DialogContent>
          <Button
            className={styles.welcomeScreenButton}
            onClick={onClickSecondDevice}
            data-testid='second-device-button'
          >
            {tx('multidevice_receiver_title')}
          </Button>
          <Button
            className={styles.welcomeScreenButton}
            onClick={onClickImportBackup}
            data-testid='import-backup-button'
          >
            {tx('import_backup_title')}
          </Button>
          <br /> {/* space after buttons */}
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
