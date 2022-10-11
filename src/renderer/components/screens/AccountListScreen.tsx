import { Classes, Switch, Alignment, Icon } from '@blueprintjs/core'
import classNames from 'classnames'
import { getLogger } from '../../../shared/logger'
import debounce from 'debounce'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslationFunction, ScreenContext } from '../../contexts'
import { ipcBackend } from '../../ipc'
import ScreenController from '../../ScreenController'
import { Avatar } from '../Avatar'
import { PseudoContact } from '../contact/Contact'
import {
  DeltaDialogBase,
  DeltaDialogBody,
  DeltaDialogContent,
} from '../dialogs/DeltaDialog'
import filesizeConverter from 'filesize'
import { BackendRemote, EffectfulBackendActions, Type } from '../../backend-com'
import { runtime } from '../../runtime'

const log = getLogger('renderer/components/AccountsScreen')

export default function AccountListScreen({
  selectAccount,
  onAddAccount,
}: {
  selectAccount: typeof ScreenController.prototype.selectAccount
  onAddAccount: () => void
}) {
  const tx = useTranslationFunction()

  const [logins, setLogins] = useState<Type.Account[] | null>(null)

  const [syncAllAccounts, setSyncAllAccounts] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const desktopSettings = await runtime.getDesktopSettings()
      setSyncAllAccounts(desktopSettings.syncAllAccounts)
    })()
  }, [])

  const refreshAccounts = async () => {
    const logins = await BackendRemote.listAccounts()
    setLogins(logins)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const logins = await BackendRemote.listAccounts()
      if (mounted === true) {
        setLogins(logins)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

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
          canEscapeKeyClose={true}
        >
          <>
            <div
              className={classNames(
                Classes.DIALOG_HEADER,
                'bp4-dialog-header-border-bottom'
              )}
            >
              <h4 className='bp4-heading'>
                {tx('login_known_accounts_title_desktop')}
              </h4>
              {syncAllAccounts !== null && (
                <Switch
                  checked={syncAllAccounts}
                  label={tx('sync_all')}
                  onChange={async () => {
                    const new_state = !syncAllAccounts
                    await runtime.setDesktopSetting(
                      'syncAllAccounts',
                      new_state
                    )
                    if (new_state) {
                      BackendRemote.rpc.startIoForAllAccounts()
                    } else {
                      BackendRemote.rpc.stopIoForAllAccounts()
                    }
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
                    selectAccount,
                    logins,
                    showUnread: syncAllAccounts || false,
                    onAddAccount,
                  }}
                />
              </DeltaDialogContent>
            </DeltaDialogBody>
          </>
        </DeltaDialogBase>
      </div>
    </div>
  )
}

function AccountSelection({
  refreshAccounts,
  selectAccount,
  logins,
  showUnread,
  onAddAccount,
}: {
  refreshAccounts: () => Promise<void>
  selectAccount: typeof ScreenController.prototype.selectAccount
  logins: Type.Account[]
  showUnread: boolean
  onAddAccount: () => void
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useContext(ScreenContext)

  const removeAccount = (account: Type.Account) => {
    const header = tx(
      'ask_delete_value',
      account.type == 'Configured' ? account.addr || '?' : '[unconfigured]'
    )
    const message = tx(
      'delete_account_explain_with_name',
      account.type == 'Configured' ? account.addr || '?' : '[unconfigured]'
    )
    openDialog('ConfirmationDialog', {
      header,
      message,
      confirmLabel: tx('delete_account'),
      isConfirmDanger: true,
      cb: async (yes: boolean) => {
        if (yes) {
          try {
            await EffectfulBackendActions.removeAccount(account.id)
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
        onClick={onAddAccount}
        tabIndex={0}
      >
        <PseudoContact cutoff='+' text={tx('add_account')}></PseudoContact>
      </div>
      {logins.map((login: Type.Account, index: Number) => (
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
  login: Type.Account
  selectAccount: typeof ScreenController.prototype.selectAccount
  removeAccount: (account: Type.Account) => void
  showUnread: boolean
}) {
  const removeAction = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    ev?.stopPropagation()
    removeAccount(login)
  }

  const [account_size, setSize] = useState<string>('?')
  useEffect(() => {
    BackendRemote.rpc
      .getAccountFileSize(login.id)
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
          BackendRemote.rpc
            .getFreshMsgs(login.id)
            .catch(log.error)
            .then(u => setUnreadCount(u?.length || 0))
        }
      }, 200),
    [login.id]
  )

  useEffect(() => {
    updateUnreadCount(null, login.id)
    // TODO use onIncomingMsg event directly after we changed the events to be filtered for active account in the frontend
    ipcBackend.on('DD_EVENT_INCOMING_MESSAGE_ACCOUNT', updateUnreadCount)
    return () => {
      ipcBackend.removeListener(
        'DD_EVENT_INCOMING_MESSAGE_ACCOUNT',
        updateUnreadCount
      )
    }
  }, [login.id, updateUnreadCount])

  const tx = useTranslationFunction()

  let inner
  if (login.type === 'Configured') {
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
              avatarPath: login.profileImage || undefined,
              color: login.color,
              displayName: login.displayName || '',
              addr: login.addr || undefined,
            }}
          />
          <div className='contact-name'>
            <div className='display-name'>
              {login.displayName || login.addr}
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
