import React, { useState, useEffect, useContext } from 'react'
import { ipcBackend } from '../ipc'
import { Credentials } from '../../shared/shared-types'
import LoginForm, {
  defaultCredentials,
  ConfigureProgressDialog,
} from './LoginForm'
import { Classes, Elevation, Intent, Card, Icon } from '@blueprintjs/core'
import { DeltaProgressBar } from './Login-Styles'
import { getLogger } from '../../shared/logger'
import { ScreenContext, useTranslationFunction } from '../contexts'
import DeltaDialog, {
  DeltaDialogFooter,
  DeltaDialogFooterActions,
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogContent,
  DeltaDialogHeader,
} from './dialogs/DeltaDialog'
import { DeltaChatAccount } from '../../shared/shared-types'
import filesizeConverter from 'filesize'
import { DialogProps } from './dialogs/DialogController'
import { DeltaBackend } from '../delta-remote'
import { IpcRendererEvent } from 'electron'
import { Avatar } from './Avatar'
import { PseudoContact } from './contact/Contact'
import { runtime } from '../runtime'

const log = getLogger('renderer/components/LoginScreen')

function ImportBackupProgressDialog({
  onClose,
  isOpen,
  backupFile,
}: DialogProps) {
  const [importProgress, setImportProgress] = useState(0.0)
  const [error, setError] = useState(null)

  const onAll = (eventName: IpcRendererEvent, data1: string, data2: string) => {
    log.debug('ALL core events: ', eventName, data1, data2)
  }
  const onImexProgress = (_evt: any, [progress, _data2]: [number, any]) => {
    log.debug('DC_EVENT_IMEX_PROGRESS xxx', progress)
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
        return
      }
      onClose()
      window.__loadAccount(account)
    })()

    ipcBackend.on('ALL', onAll)
    ipcBackend.on('DC_EVENT_IMEX_PROGRESS', onImexProgress)
    ipcBackend.on('DC_EVENT_ERROR', onError)

    return () => {
      ipcBackend.removeListener('ALL', onAll)
      ipcBackend.removeListener('DC_EVENT_IMEX_PROGRESS', onImexProgress)
      ipcBackend.removeListener('DC_EVENT_ERROR', onError)
    }
  }, [])

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
            intent={error === false ? Intent.SUCCESS : Intent.DANGER}
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

export default function LoginScreen({
  loadAccount,
}: {
  loadAccount: (account: DeltaChatAccount) => {}
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

  const [credentials, setCredentials] = useState<Credentials>(
    defaultCredentials()
  )
  const [logins, setLogins] = useState(null)
  const [view, setView] = useState('main')

  const refreshAccounts = async () => {
    const logins = await DeltaBackend.call('login.getLogins')
    setLogins(logins)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const logins = await DeltaBackend.call('login.getLogins')
      if (mounted === true) {
        setLogins(logins)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const onClickLogin = () => {
    const onSuccess = (account: DeltaChatAccount) => {
      loadAccount(account)
    }
    openDialog(ConfigureProgressDialog, { credentials, onSuccess })
  }

  if (logins === null) return null

  return (
    <div className='login-screen'>
      <div className='window'>
        <DeltaDialogBase
          isOpen={true}
          backdropProps={{ className: 'no-backdrop' }}
          onClose={() => {}}
          fixed={true}
        >
          {view === 'login' && (
            <>
              <DeltaDialogHeader title={tx('add_account')} />
              <DeltaDialogBody>
                <DeltaDialogContent>
                  <div className='login'>
                    <LoginForm
                      credentials={credentials}
                      setCredentials={setCredentials}
                    />
                  </div>
                </DeltaDialogContent>
              </DeltaDialogBody>
              <DeltaDialogFooter>
                <DeltaDialogFooterActions>
                  <p
                    className={'delta-button bold primary'}
                    onClick={() => setView('main')}
                  >
                    {tx('cancel')}
                  </p>
                  <p
                    id='action-login'
                    className={'delta-button bold primary'}
                    onClick={onClickLogin}
                  >
                    {tx('login_title')}
                  </p>
                </DeltaDialogFooterActions>
              </DeltaDialogFooter>
            </>
          )}

          {view === 'main' && (
            <>
              {(!logins || logins.length === 0) && (
                <DeltaDialogBody>
                  <DeltaDialogContent>
                    <div className='welcome-deltachat'>
                      <img
                        className='delta-icon'
                        src='../images/deltachat.png'
                      />
                      <p className='f1'>{tx('welcome_desktop')}</p>
                      <p className='f2'>{tx('welcome_intro1_message')}</p>
                      <div
                        id='action-go-to-login'
                        className='welcome-button'
                        onClick={() => setView('login')}
                      >
                        {tx('login_header')}
                      </div>
                    </div>
                  </DeltaDialogContent>
                </DeltaDialogBody>
              )}
              {logins && logins.length > 0 && (
                <>
                  <DeltaDialogHeader
                    title={tx('login_known_accounts_title_desktop')}
                  />
                  <DeltaDialogBody>
                    <DeltaDialogContent noPadding={true}>
                      <AccountSelection
                        {...{ refreshAccounts, setView, logins, loadAccount }}
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
          )}
        </DeltaDialogBase>
      </div>
    </div>
  )
}

function AccountSelection({
  refreshAccounts,
  setView,
  logins,
  loadAccount,
}: {
  refreshAccounts: () => Promise<void>
  setView: React.Dispatch<React.SetStateAction<string>>
  logins: any
  loadAccount: (account: DeltaChatAccount) => void
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

  const removeAccount = (login: DeltaChatAccount) => {
    const header = tx('ask_delete_value', login.addr)
    const message = tx('delete_account_explain_with_name', login.addr)
    openDialog('ConfirmationDialog', {
      header,
      message,
      confirmLabel: tx('delete_account'),
      isConfirmDanger: true,
      cb: async (yes: boolean) => {
        if (yes) {
          await DeltaBackend.call('login.forgetAccount', login)
          refreshAccounts()
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
        onClick={() => setView('login')}
        tabIndex={0}
      >
        <PseudoContact cutoff='+' text={tx('add_account')}></PseudoContact>
      </div>
      {logins.map((login: DeltaChatAccount, index: Number) => (
        <AccountItem
          key={`login-${index}`}
          login={login}
          loadAccount={loadAccount}
          removeAccount={removeAccount}
        />
      ))}
    </div>
  )
}

function AccountItem({
  login,
  loadAccount,
  removeAccount,
}: {
  login: DeltaChatAccount
  loadAccount: (account: DeltaChatAccount) => void
  removeAccount: (account: DeltaChatAccount) => void
}) {
  const removeAction = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    ev?.stopPropagation()
    removeAccount(login)
  }

  const title = window.static_translate('account_info_hover_tooltip_desktop', [
    login.addr,
    filesizeConverter(login.size),
    'accounts' + login.path.split('accounts')[1],
  ])

  return (
    <div
      role='menu-item'
      className='contact-list-item'
      onClick={() => loadAccount(login)}
      tabIndex={0}
    >
      <div className='contact'>
        <Avatar
          {...{
            avatarPath: login.profileImage,
            color: login.color,
            displayName: login.displayname,
            addr: login.addr,
          }}
        />
        <div className='contact-name'>
          <div className='display-name'>{login.displayname || login.addr}</div>
          <div
            className='email'
            style={{ display: 'inline-block' }}
            title={title}
          >
            {login.addr}
          </div>
        </div>
      </div>
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
