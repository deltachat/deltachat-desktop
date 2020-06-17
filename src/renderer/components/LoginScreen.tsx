import React, { useState, useEffect, Fragment, useContext } from 'react'
import { sendToBackend, ipcBackend } from '../ipc'
import { Credentials } from '../../shared/shared-types' 
import LoginForm, { defaultCredentials, ConfigureProgressDialog } from './LoginForm'
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
import { any } from 'prop-types'
import { DeltaBackend } from '../delta-remote'
import { Screens } from '../ScreenController'

const log = getLogger('renderer/components/LoginScreen')

const ImportDialogContent = React.memo(function ImportDialogContent(props: {
  onClose: (ev: React.SyntheticEvent) => void
}) {
  const tx = window.translate
  const [importProgress, setImportProgress] = useState(0)
  const [error, setError] = useState(null)
  const [importState, setImportState] = useState(['INIT', {}])

  let addr = ''

  useEffect(() => {
    log.debug('useEffect', ipcBackend)
    let wasCanceled = false
    ipcBackend.on('ALL', (eventName, data1, data2) =>
      log.debug('ALL core events: ', eventName, data1, data2)
    )
    ipcBackend.on('DD_EVENT_CHATLIST_UPDATED', () => log.debug('test'))
    ipcBackend.on('DD_EVENT_IMPORT_PROGRESS', (evt, progress) => {
      log.debug('DC_EVENT_IMEX_PROGRESS', progress)
      if (!wasCanceled) {
        setImportProgress(progress)
      }
    })

    ipcBackend.on('DC_EVENT_ERROR', (data1, data2) => {
      setError('DC_EVENT_ERROR: ' + data2)
    })

    ipcBackend.on('DD_EVENT_BACKUP_IMPORTED', (evt, a) => {
      addr = a
      if (!wasCanceled) {
        setImportProgress(1000)
        setImportState(['IMPORT_COMPLETE', {}])
      }
    })

    ipcBackend.on('DD_EVENT_BACKUP_IMPORT_EXISTS', (evt, exists) => {
      log.debug('DD_EVENT_BACKUP_IMPORT_EXISTS', exists)
      if (!wasCanceled) {
        setImportState(['IMPORT_EXISTS', {}])
      }
    })
    return () => {
      wasCanceled = true
    }
  }, [])

  function overwriteBackup() {
    sendToBackend('DU_EVENT_BACKUP_IMPORT_OVERWRITE')
  }

  return (
    <div className={Classes.DIALOG_BODY}>
      <Card elevation={Elevation.ONE}>
        {error && <p>Error: {error}</p>}
        {importState[0] === 'INIT' && <p />}
        {importState[0] === 'IMPORT_EXISTS' && (
          <>
            {`Seems like there's already an existing Account with the ${addr} address.
            To import this backup you need to overwrite the existing account. Do you want to?`}
            <br />
            <Button
              onClick={overwriteBackup}
              type='submit'
              text='Yes!'
              className='override-backup'
            />
            <Button onClick={props.onClose} text={tx('cancel')} />
          </>
        )}
        {importState[0] === 'IMPORT_COMPLETE' && 'Successfully imported backup'}
        {importState[0] !== 'IMPORT_COMPLETE' && (
          <DeltaProgressBar
            progress={importProgress}
            intent={error === false ? Intent.SUCCESS : Intent.DANGER}
          />
        )}
      </Card>
    </div>
  )
})

const ImportButton = function ImportButton(props: any) {
  const tx = window.translate
  const [showDialog, setShowDialog] = useState(false)

  function onClickImportBackup() {
    remote.dialog.showOpenDialog(
      {
        title: tx('import_backup_title'),
        properties: ['openFile'],
        filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }],
      },
      (filenames: string[]) => {
        if (!filenames || !filenames.length) return
        sendToBackend('backupImport', filenames[0])
        setShowDialog(true)
      }
    )
  }
  const onHandleClose = () => {
    setShowDialog(false)
    props.refreshAccounts()
  }

  return (
    <>
      <div className='delta-blue-button' onClick={onClickImportBackup}>
        <p>{tx('import_backup_title')}</p>
      </div>
      {showDialog && (
        <DeltaDialog
          onClose={onHandleClose}
          title={tx('import_backup_title')}
          // canOutsideClickClose
          isOpen={showDialog}
          style={{ top: '40%' }}
        >
          <ImportDialogContent onClose={onHandleClose} />
        </DeltaDialog>
      )}
    </>
  )
}

const ScanQRCode = React.memo(function ScanQRCode(_) {
  const { openDialog } = useContext(ScreenContext)
  const tx = window.translate
  const [showDialog, setShowDialog] = useState(false)

  function onClickScanQr() {
    openDialog('ImportQrCode')
  }
  const onHandleClose = () => {
    setShowDialog(false)
  }

  return (
    <Fragment>
      <div className='delta-blue-button' onClick={onClickScanQr}>
        <p>{tx('qrscan_title')}</p>
      </div>
      {showDialog && (
        <DeltaDialog
          onClose={onHandleClose}
          title={tx('qrscan_title')}
          isOpen={showDialog}
          style={{ top: '40%' }}
        >
          <ImportDialogContent onClose={onHandleClose} />
        </DeltaDialog>
      )}
    </Fragment>
  )
})


export default function LoginScreen(props: any) {
  const tx = window.translate
  const { openDialog, changeScreen } = useContext(ScreenContext)

  const [credentials, setCredentials] = useState<Credentials>(defaultCredentials())
  const [logins, setLogins] = useState(null)

  const refreshAccounts = async () => {
    const logins = await DeltaBackend.call('login.getLogins')
    setLogins(logins)
  }

  useEffect(() => {
    refreshAccounts()
  }, [])

  const onClickLogin = () => {
    console.log('hallo')

    const onSuccess = () => changeScreen(Screens.Main)
    openDialog(ConfigureProgressDialog, {credentials, onSuccess})    
  }

  const onClickLoadAccount = async (login: DeltaChatAccount) => {
    if(await DeltaBackend.call('login.loadAccount', login) === true) {
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
        {logins !== null && (
          <>
            {logins.length > 0 && (
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
              <LoginForm credentials={credentials} setCredentials={setCredentials} />
              <Button type='submit' text={tx('login_title')} onClick={onClickLogin} />
              <ImportButton refreshAccounts={refreshAccounts} />
              <ScanQRCode />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
