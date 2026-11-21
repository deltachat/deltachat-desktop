import React, { useState, useEffect, useCallback } from 'react'
import { basename } from 'path'

import { DeltaProgressBar } from '../Login-Styles'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsButton from './SettingsButton'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/dialog/useDialog'

import type { DcEventType } from '@deltachat/jsonrpc-client'
import { LastUsedSlot, rememberLastUsedPath } from '../../utils/lastUsedPaths'
import { RuntimeOpenDialogOptions } from '@deltachat-desktop/shared/shared-types'
import { DialogProps } from '../../contexts/DialogContext'
import AlertDialog from '../dialogs/AlertDialog'
import { unknownErrorToString } from '@deltachat-desktop/shared/unknownErrorToString'

import styles from './styles.module.scss'

const log = getLogger('renderer/Settings/Backup')

type ExportChoice = 'this' | 'all' | null

export default function Backup() {
  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const { openDialog, closeDialog } = useDialog()

  const onBackupExport = useCallback(async () => {
    const configuredAccounts = (await BackendRemote.rpc.getAllAccounts())
      .filter(account => account.kind === 'Configured')
      .map(account => ({
        id: account.id,
        label:
          (account.displayName || tx('unnamed')) +
          (account.privateTag ? ` (${account.privateTag})` : ''),
      }))
    const configuredAccountIds = configuredAccounts.map(account => account.id)

    const choice = await new Promise<ExportChoice>(resolve => {
      openDialog(ExportBackupConfirmationDialog, {
        allProfilesCount:
          configuredAccountIds.length > 1 ? configuredAccountIds.length : 0,
        cb: resolve,
      })
    })
    if (choice === null) {
      return
    }
    const accountIds = choice === 'all' ? configuredAccountIds : [accountId]
    const isBrowser = runtime.getRuntimeInfo().target === 'browser'

    let destination: string
    if (isBrowser) {
      destination = '<BROWSER>' // gets replaced internally by browser runtime
    } else {
      const { defaultPath, setLastPath } = await rememberLastUsedPath(
        LastUsedSlot.Backup
      )
      const opts: RuntimeOpenDialogOptions = {
        title: tx('export_backup_desktop'),
        defaultPath,
        buttonLabel: tx('save'),
        properties: ['openDirectory', 'createDirectory'],
      }
      const [chosen_destination] = await runtime.showOpenFileDialog(opts)
      if (!chosen_destination) {
        return
      }
      setLastPath(chosen_destination)
      destination = chosen_destination
    }

    const listenForOutputFile = ({ path }: DcEventType<'ImexFileWritten'>) => {
      if (isBrowser) {
        const downloadLink = `/download-backup/${basename(path)}`
        // this alert dialog is to make the opening of the link a user action, to prevent the popup warning
        openDialog(AlertDialog, {
          cb: () => window.open(downloadLink, '_blank'),
          message: tx('pref_backup_written_to_x', downloadLink),
          okBtnLabel: tx('open'),
        })
      } else if (accountIds.length === 1) {
        openDialog(AlertDialog, {
          message: tx('pref_backup_written_to_x', path),
        })
      }
    }

    const emitters = accountIds.map(id => BackendRemote.getContextEvents(id))
    emitters.forEach(emitter =>
      emitter.once('ImexFileWritten', listenForOutputFile)
    )

    let currentAccountId = accountIds[0]
    let canceled = false
    const dialogId = openDialog(ExportProgressDialog, {
      accountIds,
      accountLabels:
        accountIds.length > 1
          ? Object.fromEntries(configuredAccounts.map(a => [a.id, a.label]))
          : undefined,
      onCancel: () => {
        canceled = true
        return BackendRemote.rpc.stopOngoingProcess(currentAccountId)
      },
    })
    try {
      for (const id of accountIds) {
        if (canceled) {
          break
        }
        currentAccountId = id
        await BackendRemote.rpc.exportBackup(id, destination, null)
      }
      if (!isBrowser && accountIds.length > 1 && !canceled) {
        openDialog(AlertDialog, {
          message: tx('pref_backup_written_to_x', destination),
        })
      }
    } catch (error) {
      log.error('backup-export failed:', error)
      if (
        // Try to distinguish user cancel from other errors
        !(
          typeof error === 'object' &&
          error != null &&
          'message' in error &&
          error.message === 'canceled'
        )
      ) {
        openDialog(AlertDialog, {
          message:
            tx('export_aborted') +
            '\n' +
            tx(
              'error_x',
              'failed to export backup\n' + unknownErrorToString(error)
            ),
        })
      }
    } finally {
      closeDialog(dialogId)
      if (isBrowser) {
        // event is slower than return of exportBackup
        // TODO find better solution
        await new Promise(res => setTimeout(res, 1000))
      }
      emitters.forEach(emitter =>
        emitter.off('ImexFileWritten', listenForOutputFile)
      )
    }
  }, [accountId, closeDialog, openDialog, tx])

  return (
    <SettingsButton onClick={onBackupExport}>
      {tx('export_backup_desktop')}
    </SettingsButton>
  )
}

function ExportBackupConfirmationDialog({
  allProfilesCount,
  cb,
  onClose,
}: {
  /** 0 hides the "export all" button */
  allProfilesCount: number
  cb: (choice: ExportChoice) => void
} & DialogProps) {
  const tx = useTranslationFunction()

  const choose = (choice: ExportChoice) => {
    onClose()
    cb(choice)
  }

  return (
    <Dialog onClose={() => choose(null)} dataTestid='confirm-backup-export'>
      <DialogBody>
        <DialogContent>
          <p className='whitespace'>{tx('pref_backup_export_explain')}</p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={() => choose(null)}>
            {tx('cancel')}
          </FooterActionButton>
          {allProfilesCount > 0 && (
            <FooterActionButton onClick={() => choose('all')}>
              {tx('pref_backup_export_all', String(allProfilesCount))}
            </FooterActionButton>
          )}
          <FooterActionButton styling='primary' onClick={() => choose('this')}>
            {tx('pref_backup_export_this')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

function ExportProgressDialog({
  accountIds,
  accountLabels,
  onCancel,
  onClose,
}: {
  accountIds: number[]
  /** When set, the currently exported profile is shown below the progress bar */
  accountLabels?: Record<number, string>
  onCancel: () => Promise<unknown>
} & DialogProps) {
  const tx = useTranslationFunction()
  // Accounts are exported one after another, so the sum of all per-account
  // progress values is the overall progress.
  const [progressByAccount, setProgressByAccount] = useState<
    Record<number, number>
  >({})
  const progress = Object.values(progressByAccount).reduce((a, b) => a + b, 0)
  const [currentAccountId, setCurrentAccountId] = useState(accountIds[0])

  const cancel = () => {
    onCancel().then(onClose)
  }

  useEffect(() => {
    const cleanups = accountIds.map(accountId => {
      const onImexProgress = ({ progress }: DcEventType<'ImexProgress'>) => {
        setProgressByAccount(prev => ({ ...prev, [accountId]: progress }))
        setCurrentAccountId(accountId)
      }
      const emitter = BackendRemote.getContextEvents(accountId)
      emitter.on('ImexProgress', onImexProgress)
      return () => emitter.off('ImexProgress', onImexProgress)
    })
    return () => cleanups.forEach(cleanup => cleanup())
  }, [accountIds])

  return (
    <Dialog onClose={() => {}} canOutsideClickClose={false}>
      <DialogHeader title={tx('export_backup_desktop')} />
      <DialogBody>
        <DialogContent>
          <DeltaProgressBar
            progress={progress}
            max={1000 * accountIds.length}
          />
          {accountLabels && (
            <p className={styles.exportProgressProfile}>
              {accountIds.indexOf(currentAccountId) + 1} / {accountIds.length}
              {' · '}
              {accountLabels[currentAccountId]}
            </p>
          )}
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='end'>
          <FooterActionButton onClick={cancel}>
            {tx('cancel')}
          </FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}
