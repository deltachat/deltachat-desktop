import React, { useState, useEffect, Fragment, useContext } from 'react'
import { remote } from 'electron'
import { sendToBackend, ipcBackend } from '../ipc'
import Login from './Login'
import {
  Button,
  Classes,
  Elevation,
  Intent,
  Card,
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core'
import { DeltaProgressBar } from './Login-Styles'
import logger from '../../shared/logger'
import { ScreenContext } from '../contexts'
import DeltaDialog from './dialogs/DeltaDialog'

const log = logger.getLogger('renderer/components/LoginScreen')

const ImportDialogContent = React.memo(function ImportDialogContent (props) {
  const tx = window.translate
  const [importProgress, setImportProgress] = useState(0)
  const [error, setError] = useState(null)
  const [importState, setImportState] = useState(['INIT', {}])

  let addr = ''

  useEffect(() => {
    log.debug('useEffect', ipcBackend)
    let wasCanceled = false
    ipcBackend.on('ALL', (eventName, data1, data2) => log.debug('ALL core events: ', eventName, data1, data2))
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

  function overwriteBackup () {
    sendToBackend('DU_EVENT_BACKUP_IMPORT_OVERWRITE')
  }

  return (
    <div className={Classes.DIALOG_BODY}>
      <Card elevation={Elevation.ONE}>
        { error && <p>Error: {error}</p> }
        { importState[0] === 'INIT' && <p /> }
        { importState[0] === 'IMPORT_EXISTS' &&
          <>
            {`Seems like there's already an existing Account with the ${addr} address.
            To import this backup you need to overwrite the existing account. Do you want to?`}
            <br />
            <Button onClick={overwriteBackup} type='submit' text='Yes!' className='override-backup' />
            <Button onClick={props.onClose} type='cancel' text={tx('cancel')} />
          </>
        }
        { importState[0] === 'IMPORT_COMPLETE' && 'Successfully imported backup' }
        { importState[0] !== 'IMPORT_COMPLETE' &&
          <DeltaProgressBar progress={importProgress} intent={error === false ? Intent.SUCCESS : Intent.ERROR} /> }
      </Card>
    </div>
  )
})

const ImportButton = React.memo(function ImportButton (props) {
  const tx = window.translate
  const [showDialog, setShowDialog] = useState(false)

  function onClickImportBackup () {
    const opts = {
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }]
    }

    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      sendToBackend('backupImport', filenames[0])
      setShowDialog(true)
    })
  }
  const onHandleClose = () => {
    setShowDialog(false)
    sendToBackend('updateLogins')
  }

  return (
    <Fragment>
      <div className='delta-blue-button' onClick={onClickImportBackup} >
        <p>{tx('import_backup_title') }</p>
      </div>
      {showDialog &&
        <DeltaDialog
          onClose={onHandleClose}
          title={tx('import_backup_title')}
          canOutsideClickClose
          isOpen={showDialog}
          style={{ top: '40%' }}
        >
          <ImportDialogContent onClose={onHandleClose} />
        </DeltaDialog> }
    </Fragment>
  )
})

export default function LoginScreen (props) {
  const tx = window.translate
  const { openDialog } = useContext(ScreenContext)

  function onClickLogin (credentials) {
    sendToBackend('login', credentials)
  }

  function onClickLoadAccount (login) {
    sendToBackend('loadAccount', login)
  }

  function forgetLogin (login) {
    const message = tx('forget_login_confirmation_desktop')
    openDialog('ConfirmationDialog', {
      message,
      confirmLabel: tx('remove_account'),
      cb: yes => { if (yes) sendToBackend('forgetLogin', login) }
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
        { props.logins.length > 0 && <Card>
          <p className='delta-headline'>{tx('login_known_accounts_title_desktop')}</p>
          <ul>
            {props.logins.map((login) => <li className='login-item' key={login.path}>
              <Button large minimal onClick={() => onClickLoadAccount(login)} title={login.path}>
                {login.addr}
              </Button>
              <Button
                intent={Intent.DANGER} minimal icon='cross'
                onClick={() => forgetLogin(login)}
                aria-label={tx('a11y_remove_account_btn_label')} />
            </li>
            )}
          </ul>
        </Card>
        }
        <Card>
          <p className='delta-headline'>{tx('login_title')}</p>
          <Login onSubmit={onClickLogin} loading={props.deltachat.configuring}>
            <br />
            <Button type='submit' text={tx('login_title')} />
            <Button type='cancel' text={tx('cancel')} />
          </Login>
          <ImportButton />
        </Card>
      </div>
    </div>
  )
}
