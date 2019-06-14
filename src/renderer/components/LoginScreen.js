import React, {useState} from 'react'
import { ipcRenderer, remote } from 'electron'
import NavbarWrapper from './NavbarWrapper'
import confirmation from './dialogs/confirmationDialog'
import styled from 'styled-components'
import Login from './Login'
import {
  Button,
  Intent,
  H5,
  Card,
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core'
import { DeltaHeadline, DeltaBlueButton, DeltaProgressBar } from './Login-Styles'


const LoginWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: calc(100vh);

  .bp3-card {
    width: 400px;
    margin-top: 20px;
  }

  .window { 
    padding-left: calc((100vw - 400px) / 2)
  }

`

const LoginItem = styled.li`
  display: flex;
  justify-content: space-between;
  border-right: 1px solid grey;
  border-left: 1px solid grey;
  border-bottom: 1px solid grey;
  min-width: 300px;
  border-radius: 0;

  :hover {
    button.bp3-intent-danger {
      display: inline-flex;
    }
  }

  button.bp3-intent-danger {
    display: none;
  }

  &:first-child {
    border-top: 1px solid grey;
  }

  button.bp3-large {
    width: 90%;
  }
`

export default function LoginScreen (props) {
  const tx = window.translate
  
  const [importProgress, setImportProgress] = useState(false)
  function onClickLogin (login) {
    ipcRenderer.send('login', { addr: login, mail_pw: true })
  }

  function forgetLogin (login) {
    const message = tx('forget_login_confirmation_desktop')
    confirmation(message, (yes) => {
      if (yes) ipcRenderer.send('forgetLogin', login)
    })
  }

  function onClickImportBackup() {
    const opts = {
      title: tx('import_backup_title'),
      properties: ['openFile'],
      filters: [{ name: 'DeltaChat .bak', extensions: ['bak'] }]
    }
    ipcRenderer.on('DC_EVENT_IMEX_PROGRESS', (progress, err) => {
      setImportProgress(progress)
    })

    ipcRenderer.once('DD_EVENT_BACKUP_IMPORTED', (addr) => {
      alert(addr)
      setImportProgress(false)
    })

    remote.dialog.showOpenDialog(opts, filenames => {
      if (!filenames || !filenames.length) return
      ipcRenderer.send('backupImport', filenames[0])
    })
  }

  return (
    <LoginWrapper>
      <NavbarWrapper>
        <Navbar fixedToTop>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>{tx('welcome_desktop')}</NavbarHeading>
          </NavbarGroup>
        </Navbar>
      </NavbarWrapper>
      <div className='window'>
        { props.logins.length > 0 && <Card>
          <DeltaHeadline>{tx('login_known_accounts_title_desktop')}</DeltaHeadline>
          <ul>
            {props.logins.map((login) => <LoginItem key={login}>
              <Button large minimal onClick={() => onClickLogin(login)}>
                {login}
              </Button>
              <Button intent={Intent.DANGER} minimal icon='cross' onClick={() => forgetLogin(login)} />
            </LoginItem>
            )}
          </ul>
          <DeltaBlueButton onClick={onClickImportBackup} >
            <p>{tx('import_backup_title') }</p>
          </DeltaBlueButton>
          {
            importProgress &&
              <DeltaProgressBar
                value={importProgress / 1000}
                intent={Intent.SUCCESS}
              />
          }
        </Card>
        }
        <Card>
          <DeltaHeadline>{tx('login_title')}</DeltaHeadline>
          <Login onSubmit={onClickLogin} loading={props.deltachat.configuring}>
            <br />
            <Button type='submit' text={tx('login_title')} />
            <Button type='cancel' text={tx('cancel')} />
          </Login>
        </Card>
      </div>
    </LoginWrapper>
  )
}
