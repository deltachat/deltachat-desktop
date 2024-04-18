import React from 'react'
import { dirname } from 'path'

import Button from '../../Button'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../../Dialog'
import ImportBackupProgressDialog from './ImportBackupProgressDialog'
import ImportQrCode from '../../dialogs/ImportQrCode'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import { Screens } from '../../../ScreenController'
import { runtime } from '../../../runtime'

// import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'

export default function AlternativeSetupsDialog({ onClose }: DialogProps) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const onClickSecondDevice = () =>
    openDialog(ImportQrCode, {
      subtitle: tx('multidevice_open_settings_on_other_device'),
    })

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

  const onClickLogin = () => window.__changeScreen(Screens.Login)

  return (
    <Dialog onClose={onClose}>
      <DialogHeader onClose={onClose} />
      <DialogBody>
        <DialogContent>
          <Button onClick={onClickSecondDevice}>
            {tx('multidevice_receiver_title')}
          </Button>
          <Button onClick={onClickImportBackup}>
            {tx('import_backup_title')}
          </Button>
          <Button onClick={onClickLogin}>{tx('login_header')}</Button>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}