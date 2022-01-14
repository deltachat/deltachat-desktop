import React, { useState, useEffect, useContext, useMemo } from 'react'
import { ipcBackend } from '../../ipc'
import {
  Classes,
  Elevation,
  Intent,
  Card,
  Icon,
  Switch,
  Alignment,
} from '@blueprintjs/core'
import { DeltaProgressBar } from '../Login-Styles'
import { getLogger } from '../../../shared/logger'
import { ScreenContext, useTranslationFunction } from '../../contexts'
import DeltaDialog, {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogContent,
} from '../dialogs/DeltaDialog'
import { DeltaChatAccount } from '../../../shared/shared-types'
import filesizeConverter from 'filesize'
import { DialogProps } from '../dialogs/DialogController'
import { DeltaBackend } from '../../delta-remote'
import { IpcRendererEvent } from 'electron'
import { Avatar } from '../Avatar'
import { PseudoContact } from '../contact/Contact'
import { runtime } from '../../runtime'
import type ScreenController from '../../ScreenController'
import debounce from 'debounce'
import classNames from 'classnames'

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
    <p
      className={'delta-button light-bold primary'}
      onClick={onClickImportBackup}
    >
      {tx('import_backup_title')}
    </p>
  )
}

const ScanQRCodeButton = React.memo(function ScanQRCode(_) {
  const { openDialog } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const onClickScanQr = () => openDialog('ImportQrCode')

  return (
    <p className={'delta-button light-bold primary'} onClick={onClickScanQr}>
      {tx('qrscan_title')}
    </p>
  )
})

export default function AccountsScreen({
  selectAccount,
  logins,
  refreshAccounts
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount,
  logins: DeltaChatAccount[] | null
  refreshAccounts: () => Promise<void>
}) {
  const tx = useTranslationFunction()

  const [syncAllAccounts, setSyncAllAccounts] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const desktopSettings = await DeltaBackend.call(
        'settings.getDesktopSettings'
      )
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    })()
  }, [])


  const addAccount = async () => {
    const accountId = await DeltaBackend.call('login.addAccount')
    selectAccount(accountId)
  }

  if (logins === null)
    return (
      <div className='login-screen'>
        <div className='window'></div>
      </div>
    )

  return (
    <div className='login-screen'>
      <div className='window'>
        <DeltaDialogBase
          isOpen={true}
          backdropProps={{ className: 'no-backdrop' }}
          onClose={() => {}}
          fixed={true}
        >
          <>
            {(!logins || logins.length === 0) && (
              <DeltaDialogBody>
                <DeltaDialogContent>
                  <div className='welcome-deltachat'>
                    <img className='delta-icon' src='../images/deltachat.png' />
                    <p className='f1'>{tx('welcome_desktop')}</p>
                    <p className='f2'>{tx('welcome_intro1_message')}</p>
                    <div
                      id='action-go-to-login'
                      className='welcome-button'
                      onClick={addAccount}
                    >
                      {tx('login_header')}
                    </div>
                  </div>
                </DeltaDialogContent>
              </DeltaDialogBody>
            )}
            {logins && logins.length > 0 && (
              <>
                <div
                  className={classNames(
                    Classes.DIALOG_HEADER,
                    'bp3-dialog-header-border-bottom'
                  )}
                >
                  <h4 className='bp3-heading'>
                    {tx('login_known_accounts_title_desktop')}
                  </h4>
                  {syncAllAccounts !== null && (
                    <Switch
                      checked={syncAllAccounts}
                      label={tx('sync_all')}
                      onChange={async () => {
                        const new_state = !syncAllAccounts
                        await DeltaBackend.call(
                          'settings.setDesktopSetting',
                          'syncAllAccounts',
                          new_state
                        )
                        setSyncAllAccounts(new_state)
                      }}
                      alignIndicator={Alignment.RIGHT}
                    />
                  )}
                </div>
                <DeltaDialogBody>
                  <DeltaDialogContent noPadding={true}>
                    <AccountSelection
                      {...{
                        refreshAccounts,
                        addAccount,
                        selectAccount,
                        logins,
                        showUnread: syncAllAccounts || false,
                      }}
                    />
                  </DeltaDialogContent>
                </DeltaDialogBody>
              </>
            )}
            <DeltaDialogFooter style={{ padding: '10px' }}>
              <DeltaDialogFooterActions
                style={{ justifyContent: 'space-between' }}
              >
                <ScanQRCodeButton />
                <ImportButton />
              </DeltaDialogFooterActions>
            </DeltaDialogFooter>
          </>
        </DeltaDialogBase>
      </div>
    </div>
  )
}

function AccountSelection({
  refreshAccounts,
  addAccount,
  selectAccount,
  logins,
  showUnread,
}: {
  refreshAccounts: () => Promise<void>
  addAccount: () => {}
  selectAccount: typeof ScreenController.prototype.selectAccount
  logins: any
  showUnread: boolean
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

  const removeAccount = (account: DeltaChatAccount) => {
    const header = tx(
      'ask_delete_value',
      account.type == 'configured' ? account.addr || '?' : '[unconfigured]'
    )
    const message = tx(
      'delete_account_explain_with_name',
      account.type == 'configured' ? account.addr || '?' : '[unconfigured]'
    )
    openDialog('ConfirmationDialog', {
      header,
      message,
      confirmLabel: tx('delete_account'),
      isConfirmDanger: true,
      cb: async (yes: boolean) => {
        if (yes) {
          try {
            await DeltaBackend.call('login.removeAccount', account.id)
            refreshAccounts()
          } catch (error: any) {
            if (error instanceof Error) {
              window.__openDialog('AlertDialog', {
                message: error?.message,
                cb: () => {
                  refreshAccounts()
                },
              })
            } else {
              log.error('unexpected error type', error)
              throw error
            }
          }
        }
      },
    })
  }

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      const parent = document.querySelector<HTMLDivElement>('#accounts')
      const current = parent?.querySelector(':focus')

      if (ev.key == 'ArrowDown') {
        if (current && current.nextElementSibling) {
          ;(current.nextElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.firstElementChild as HTMLDivElement).focus()
        }
      } else if (ev.key == 'ArrowUp') {
        if (current && current.previousElementSibling) {
          ;(current.previousElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.lastElementChild as HTMLDivElement).focus()
        }
      } else if (ev.key == 'Enter') {
        if (current) {
          ;(current as HTMLDivElement)?.click()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className='accounts' id='accounts' role='menu'>
      <div
        role='menu-item'
        id='action-go-to-login'
        className='contact-list-item'
        onClick={addAccount}
        tabIndex={0}
      >
        <PseudoContact cutoff='+' text={tx('add_account')}></PseudoContact>
      </div>
      {logins.map((login: DeltaChatAccount, index: Number) => (
        <AccountItem
          key={`login-${index}`}
          login={login}
          selectAccount={selectAccount}
          removeAccount={removeAccount}
          showUnread={showUnread}
        />
      ))}
    </div>
  )
}

function AccountItem({
  login,
  selectAccount,
  removeAccount,
  showUnread,
}: {
  login: DeltaChatAccount
  selectAccount: typeof ScreenController.prototype.selectAccount
  removeAccount: (account: DeltaChatAccount) => void
  showUnread: boolean
}) {
  const removeAction = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    ev?.stopPropagation()
    removeAccount(login)
  }

  const [account_size, setSize] = useState<string>('?')
  useEffect(() => {
    DeltaBackend.call('login.getAccountSize', login.id)
      .catch(log.error)
      .then(bytes => {
        bytes && setSize(filesizeConverter(bytes))
      })
  }, [login.id])

  const [unreadCount, setUnreadCount] = useState(0)

  const updateUnreadCount = useMemo(
    () =>
      debounce((_ev: any, account_id: number) => {
        if (account_id === login.id) {
          DeltaBackend.call('login.getFreshMessageCounter', login.id)
            .catch(log.error)
            .then(u => setUnreadCount(u || 0))
        }
      }, 200),
    [login.id]
  )

  useEffect(() => {
    updateUnreadCount(null, login.id)
    // TODO use onIncomingMsg event directly after we changed the events to be filtered for active account in the frontend
    ipcBackend.on('DD_EVENT_INCOMMING_MESSAGE_ACCOUNT', updateUnreadCount)
    return () => {
      ipcBackend.removeListener(
        'DD_EVENT_INCOMMING_MESSAGE_ACCOUNT',
        updateUnreadCount
      )
    }
  }, [login.id, updateUnreadCount])

  const tx = useTranslationFunction()

  let inner
  if (login.type === 'configured') {
    const title = tx('account_info_hover_tooltip_desktop2', [
      login.addr || 'null',
      account_size,
      String(login.id),
    ])
    inner = (
      <>
        <div className='contact'>
          <Avatar
            {...{
              avatarPath: login.profile_image || undefined,
              color: login.color,
              displayName: login.display_name || '',
              addr: login.addr || undefined,
            }}
          />
          <div className='contact-name'>
            <div className='display-name'>
              {login.display_name || login.addr}
            </div>
            <div className='email' title={title}>
              {login.addr}
            </div>
          </div>
        </div>
        {showUnread && unreadCount > 0 && (
          <div className='unread-badge-container'>
            <div className='fresh-message-counter'>{unreadCount}</div>
          </div>
        )}
      </>
    )
  } else {
    inner = (
      <div className='contact'>
        <Avatar displayName={'?'} addr={'?'} />
        <div className='contact-name'>
          <div className='display-name'>{tx('unconfigured_account')}</div>
          <div className='email' style={{ display: 'inline-block' }}>
            {tx('unconfigured_account_hint')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role='menu-item'
      className='contact-list-item'
      onClick={() => selectAccount(login.id)}
      tabIndex={0}
    >
      {inner}
      <div
        role='button'
        aria-label={window.static_translate('delete_account')}
        className='remove-icon'
        onClick={removeAction}
      >
        <Icon icon='cross' />
      </div>
    </div>
  )
}
