import React, { useState, useEffect, Fragment, useContext } from 'react'
import { sendToBackend, ipcBackend } from '../ipc'
import { Credentials } from '../../shared/shared-types'
import LoginForm, {
  defaultCredentials,
  ConfigureProgressDialog,
} from './LoginForm'
import {
  Button,
  Classes,
  Elevation,
  Intent,
  Card,
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
} from '@blueprintjs/core'
import { DeltaProgressBar } from './Login-Styles'
import { getLogger } from '../../shared/logger'
import { ScreenContext } from '../contexts'
import DeltaDialog from './dialogs/DeltaDialog'
import { DeltaChatAccount } from '../../shared/shared-types'
const { remote } = window.electron_functions
import filesizeConverter from 'filesize'
import { DialogProps } from './dialogs/DialogController'
import { DeltaBackend } from '../delta-remote'
import { Screens } from '../ScreenController'
import { IpcRendererEvent } from 'electron'

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
  const onImexProgress = (evt: any, [progress, _data2]: [number, any]) => {
    log.debug('DC_EVENT_IMEX_PROGRESS xxx', progress)
    setImportProgress(progress)
  }

  const onError = (data1: any, data2: string) => {
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
      if ((await DeltaBackend.call('login.loadAccount', account)) === true) {
        window.__changeScreen(Screens.Main)
      }
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

  const tx = window.translate
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
          {error && <p>Error: {error}</p>}
          <DeltaProgressBar
            progress={importProgress}
            intent={error === false ? Intent.SUCCESS : Intent.DANGER}
          />
        </Card>
      </div>
    </DeltaDialog>
  )
}

const ImportButton = function ImportButton(props: any) {
  const tx = window.translate

  function onClickImportBackup() {
    remote.dialog.showOpenDialog(
      {
        title: tx('import_backup_title'),
        properties: ['openFile'],
        filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }],
      },
      (filenames: string[]) => {
        if (!filenames || !filenames.length) return
        window.__openDialog(ImportBackupProgressDialog, {
          backupFile: filenames[0],
        })
      }
    )
  }

  return (
    <>
      <div className='delta-blue-button' onClick={onClickImportBackup}>
        <p>{tx('import_backup_title')}</p>
      </div>
    </>
  )
}

const ScanQRCodeButton = React.memo(function ScanQRCode(_) {
  const { openDialog } = useContext(ScreenContext)
  const tx = window.translate

  const onClickScanQr = () => openDialog('ImportQrCode')

  return (
    <>
      <div className='delta-blue-button' onClick={onClickScanQr}>
        <p>{tx('qrscan_title')}</p>
      </div>
    </>
  )
})

export default function LoginScreen(props: any) {
  const tx = window.translate
  const { openDialog, changeScreen } = useContext(ScreenContext)

  const [credentials, setCredentials] = useState<Credentials>(
    defaultCredentials()
  )
  const [logins, setLogins] = useState(null)

  const refreshAccounts = async () => {
    const logins = await DeltaBackend.call('login.getLogins')
    setLogins(logins)
  }

  useEffect(() => {
    refreshAccounts()
  }, [])

  const onClickLogin = () => {
    const onSuccess = () => changeScreen(Screens.Main)
    openDialog(ConfigureProgressDialog, { credentials, onSuccess })
  }

  const onClickLoadAccount = async (login: DeltaChatAccount) => {
    if ((await DeltaBackend.call('login.loadAccount', login)) === true) {
      changeScreen(Screens.Main)
    }
  }

  const forgetLogin = (login: DeltaChatAccount) => {
    const message = tx('forget_login_confirmation_desktop')
    openDialog('ConfirmationDialog', {
      message,
      confirmLabel: tx('remove_account'),
      cb: async (yes: boolean) => {
        if (yes) {
          await DeltaBackend.call('login.forgetAccount', login)
          refreshAccounts()
        }
      },
    })
  }

  return (
    <div className='login-screen'>
      <div className='navbar-wrapper'>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT} style={{ width: 'unset' }}>
            <NavbarHeading>{tx('welcome_desktop')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
      </div>
      <div className='window'>
        {logins !== null && logins.length > 0 && (
          <Card>
            <p className='delta-headline'>
              {tx('login_known_accounts_title_desktop')}
            </p>
            <ul>
              {logins.map((login: DeltaChatAccount) => (
                <li className='login-item' key={login.path}>
                  <Button
                    large
                    minimal
                    onClick={() => onClickLoadAccount(login)}
                    title={login.path}
                  >
                    {login.displayname} {login.addr} [
                    {filesizeConverter(login.size)}]
                  </Button>
                  <Button
                    intent={Intent.DANGER}
                    minimal
                    icon='cross'
                    onClick={() => forgetLogin(login)}
                    aria-label={tx('a11y_remove_account_btn_label')}
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card>
          <p className='delta-headline'>{tx('login_title')}</p>
          <LoginForm
            credentials={credentials}
            setCredentials={setCredentials}
          />
          <Button
            disabled={
              credentials.addr.length == 0 || credentials.mail_pw.length == 0
            }
            type='submit'
            text={tx('login_title')}
            onClick={onClickLogin}
          />
          <ImportButton refreshAccounts={refreshAccounts} />
          <ScanQRCodeButton />
        </Card>
      </div>
    </div>
  )
}
