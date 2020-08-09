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
import { ScreenContext, useTranslationFunction } from '../contexts'
import DeltaDialog, { DeltaDialogFooter, DeltaDialogFooterActions, DeltaDialogBase, DeltaDialogBody, DeltaDialogContent, DeltaDialogHeader } from './dialogs/DeltaDialog'
import { DeltaChatAccount } from '../../shared/shared-types'
const { remote } = window.electron_functions
import filesizeConverter from 'filesize'
import { DialogProps } from './dialogs/DialogController'
import { DeltaBackend } from '../delta-remote'
import { Screens } from '../ScreenController'
import { IpcRendererEvent } from 'electron'
import { Avatar } from './Avatar'
import { PseudoListItemAddContact } from './helpers/PseudoListItem'

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

const ImportButton = function ImportButton(props: any) {
  const tx = useTranslationFunction()

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
    <p className={'delta-button light-bold primary'} onClick={onClickImportBackup}>{tx('import_backup_title')}</p>
  )
}

const ScanQRCodeButton = React.memo(function ScanQRCode(_) {
  const { openDialog } = useContext(ScreenContext)
  const tx = useTranslationFunction()

  const onClickScanQr = () => openDialog('ImportQrCode')

  return (
    <p className={'delta-button light-bold primary'} onClick={onClickScanQr}>{tx('qrscan_title')}</p>
  )
})

export default function LoginScreen({ loadAccount }: { loadAccount: (account: DeltaChatAccount) => {} }) {
  const tx = useTranslationFunction()
  const { openDialog, changeScreen } = useContext(ScreenContext)

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
    refreshAccounts()
  }, [])

  const onClickLogin = () => {
    const onSuccess = () => changeScreen(Screens.Main)
    openDialog(ConfigureProgressDialog, { credentials, onSuccess })
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
      <div className='window'>
        <div className='bp3-overlay-backdrop'>
          <DeltaDialogBase isOpen={true} onClose={() => {}} fixed={true}>
            
              { view === 'login' && 
                  <>
                    <DeltaDialogHeader title={tx('login_title')} />
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
                        <p className={'delta-button bold primary'} onClick={() => setView('main')}>{tx('cancel')}</p>
                        <p className={'delta-button bold primary'} onClick={onClickLogin}>{tx('login_title')}</p>
                      </DeltaDialogFooterActions>
                    </DeltaDialogFooter>
                  </>
                }

                { view === 'main' && 
                  <>
                    { (!logins || logins.length === 0) && 
                      <DeltaDialogBody>
                        <DeltaDialogContent>
                            <div className='welcome-deltachat'>
                              <img className='delta-icon' src='../images/deltachat.png' />
                              <p className='f1'>{tx('welcome_desktop')}</p>
                              <p className='f2'>{tx('welcome_intro1_message')}</p>
                              <div className='welcome-button' onClick={() => setView('login')}>{tx('login_header')}</div>
                            </div>
                          </DeltaDialogContent>
                      </DeltaDialogBody>
                    }
                    { logins && logins.length > 0 &&
                    <>
                      <DeltaDialogHeader title={tx('login_known_accounts_title_desktop')}/>
                      <DeltaDialogBody>
                        <DeltaDialogContent noPadding={true}>
                          <div className='accounts'>
                            <ul>
                              <PseudoAccountItemAddAccount onClick={() => setView('login')} />
                              {logins.map((login: DeltaChatAccount) => (
                                <AccountItem login={login} loadAccount={loadAccount} />
                              ))}
                              </ul>
                          </div>
                        </DeltaDialogContent>
                      </DeltaDialogBody>
                    </>
                    }
                    <DeltaDialogFooter style={{padding: '10px'}}>
                      <DeltaDialogFooterActions style={{justifyContent: 'space-between'}}>
                          <ScanQRCodeButton/>
                          <ImportButton/>
                      </DeltaDialogFooterActions>
                    </DeltaDialogFooter>
                  </>
                }
          </DeltaDialogBase>
        </div>              
      </div>
    </div>
  )
}


export function PseudoAccountItemAddAccount({onClick} : {onClick?: todo}) {
  const tx = useTranslationFunction()
  return (
    <li className='login-item' key='add-account' onClick={onClick}>
      <div className="contact">
        <div className="avatar">
          <div className="content" color="#505050" style={{backgroundColor: 'rgb(80, 80, 80)'}}>+</div>
        </div>
        <div className="contact-name">
          <div className="display-name">{tx('add_account')}</div>
        </div>
      </div>
    </li>
  )
}

export function AccountItem({login, loadAccount} : { login: DeltaChatAccount, loadAccount: todo}) {
  
  return (
    <li className='login-item' key={login.addr} onClick={() => loadAccount(login)}>
      <div className="contact">
        <Avatar  displayName={login.displayname || login.addr} color={login.color} avatarPath={login.profileImage} />
        <div className="contact-name">
          <div className="display-name">{login.displayname || login.addr}</div>
        </div>
      </div>
    </li>
  )
}