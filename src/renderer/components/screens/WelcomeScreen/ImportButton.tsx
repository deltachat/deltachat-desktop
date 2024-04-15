import React from 'react'
import { dirname } from 'path'

import { runtime } from '../../../runtime'
import useDialog from '../../../hooks/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import {
  LastUsedSlot,
  rememberLastUsedPath,
} from '../../../utils/lastUsedPaths'
import Button from '../../Button'
import ImportBackupProgressDialog from './ImportBackupProgressDialog'

import styles from './styles.module.scss'

export default function ImportButton() {
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
