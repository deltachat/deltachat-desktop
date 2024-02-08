import React from 'react'
import { Component } from 'react'
import { DcEventType } from '@deltachat/jsonrpc-client'
import { debounce } from 'debounce'

import MainScreen from './components/screens/MainScreen'
import processOpenQrUrl from './components/helpers/OpenQrUrl'
import { getLogger } from '../shared/logger'
import { ActionEmitter, KeybindAction } from './keybindings'
import AccountSetupScreen from './components/screens/AccountSetupScreen'
import AccountListScreen from './components/screens/AccountListScreen'
import WelcomeScreen from './components/screens/WelcomeScreen'
import { BackendRemote, EffectfulBackendActions } from './backend-com'
import { updateDeviceChats } from './deviceMessages'
import { runtime } from './runtime'
import { updateTimestamps } from './components/conversations/Timestamp'
import { ScreenContext } from './contexts/ScreenContext'
import About from './components/dialogs/About'
import { KeybindingsContextProvider } from './contexts/KeybindingsContext'
import { DialogContext } from './contexts/DialogContext'
import WebxdcSaveToChatDialog from './components/dialogs/WebxdcSendToChat'
import { AccountListSidebar } from './components/screens/AccountListSidebar/AccountListSidebar'
import SettingsStoreInstance from './stores/settings'
import { AccountDeletionScreen } from './components/screens/AccountDeletionScreen/AccountDeletionScreen'

const log = getLogger('renderer/ScreenController')

export interface userFeedback {
  type: 'error' | 'success'
  text: string
}

export enum Screens {
  Welcome = 'welcome',
  Main = 'main',
  Login = 'login',
  Loading = 'loading',
  AccountList = 'accountSelection',
  DeleteAccount = 'deleteAccount',
}

export default class ScreenController extends Component {
  state: { message: userFeedback | false; screen: Screens }
  onShowAbout: any
  onShowKeybindings: any
  onShowSettings: any
  selectedAccountId: number | undefined
  openSendToDialogId?: string

  constructor(public props: {}) {
    super(props)
    this.state = {
      message: false,
      screen: Screens.Loading,
    }

    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.changeScreen = this.changeScreen.bind(this)
    this.onShowAbout = this.showAbout.bind(this)
    this.onShowKeybindings = this.showKeyBindings.bind(this)
    this.onShowSettings = this.showSettings.bind(this)
    this.selectAccount = this.selectAccount.bind(this)
    this.unSelectAccount = this.unSelectAccount.bind(this)
    this.openAccountDeletionScreen = this.openAccountDeletionScreen.bind(this)
    this.onDeleteAccount = this.onDeleteAccount.bind(this)

    window.__userFeedback = this.userFeedback.bind(this)
    window.__changeScreen = this.changeScreen.bind(this)
    window.__selectAccount = this.selectAccount.bind(this)
    window.__screen = this.state.screen
  }

  private async startup() {
    const lastLoggedInAccountId = await this._getLastUsedAccount()
    if (lastLoggedInAccountId) {
      await this.selectAccount(lastLoggedInAccountId)
    } else {
      const allAccountIds = await BackendRemote.rpc.getAllAccountIds()
      if (allAccountIds && allAccountIds.length > 0) {
        this.changeScreen(Screens.AccountList)
      } else {
        await this.addAndSelectAccount()
      }
    }
  }

  private async _getLastUsedAccount(): Promise<number | undefined> {
    const lastLoggedInAccountId = (await runtime.getDesktopSettings())
      .lastAccount
    try {
      if (lastLoggedInAccountId) {
        await BackendRemote.rpc.getAccountInfo(lastLoggedInAccountId)
        return lastLoggedInAccountId
      } else {
        return undefined
      }
    } catch (error) {
      log.warn(
        `getLastUsedAccount: account with id ${lastLoggedInAccountId} does not exist`
      )
      return undefined
    }
  }

  async selectAccount(accountId: number) {
    if (accountId === this.selectedAccountId) {
      log.info('account is already selected')
      return
    }

    await this.unSelectAccount()

    this.selectedAccountId = accountId
    ;(window.__selectedAccountId as number) = accountId

    const account = await BackendRemote.rpc.getAccountInfo(
      this.selectedAccountId
    )
    if (account.kind === 'Configured') {
      this.changeScreen(Screens.Main)
      updateDeviceChats(this.selectedAccountId)
    } else {
      this.changeScreen(Screens.Welcome)
    }

    await BackendRemote.rpc.startIo(accountId)
    runtime.setDesktopSetting('lastAccount', accountId)
    log.info('system_info', await BackendRemote.rpc.getSystemInfo())
    log.info('account_info', await BackendRemote.rpc.getInfo(accountId))
  }

  async unSelectAccount() {
    if (this.selectedAccountId === undefined) {
      return
    }
    const previousAccountId = this.selectedAccountId

    SettingsStoreInstance.effect.clear()

    if (!(await runtime.getDesktopSettings()).syncAllAccounts) {
      await BackendRemote.rpc.stopIo(previousAccountId)
      // does not work if previous account will be disabled, so better close it
      runtime.closeAllWebxdcInstances()
    }

    runtime.setDesktopSetting('lastAccount', undefined)
    ;(window.__selectedAccountId as any) = this.selectedAccountId = undefined
  }

  async addAndSelectAccount(): Promise<number> {
    const accountId = await BackendRemote.rpc.addAccount()
    updateDeviceChats(accountId, true) // skip changelog
    await this.selectAccount(accountId)
    return accountId
  }

  async openAccountDeletionScreen(accountId: number) {
    await this.selectAccount(accountId)
    this.changeScreen(Screens.DeleteAccount)
  }

  async onDeleteAccount(accountId: number) {
    await this.unSelectAccount()
    await EffectfulBackendActions.removeAccount(accountId)
    this.changeScreen(Screens.AccountList) // TODO: change to no account selected screen
  }

  userFeedback(message: userFeedback | false) {
    if (message !== false && this.state.message === message) return // one at a time, cowgirl
    this.setState({ message })
  }

  userFeedbackClick() {
    this.userFeedback(false)
  }

  changeScreen(screen: Screens) {
    log.debug('Changing screen to:', screen)
    this.setState({ screen })
    window.__screen = screen
    if (Screens.Welcome) {
      // remove user feedback error message - https://github.com/deltachat/deltachat-desktop/issues/2261
      this.userFeedback(false)
    }
  }

  componentDidMount() {
    BackendRemote.on('Error', this.onError)

    runtime.onShowDialog = kind => {
      if (kind === 'about') {
        this.onShowAbout()
      } else if (kind === 'keybindings') {
        this.onShowKeybindings()
      } else if (kind === 'settings') {
        this.onShowSettings()
      }
    }

    runtime.onOpenQrUrl = (url: string) => {
      processOpenQrUrl(this.context.openDialog, this.context.closeDialog, url)
    }

    runtime.onWebxdcSendToChat = (file, text) => {
      if (this.openSendToDialogId) {
        this.context.closeDialog(this.openSendToDialogId)
        this.openSendToDialogId = undefined
      }

      this.openSendToDialogId = this.context.openDialog(
        WebxdcSaveToChatDialog,
        {
          messageText: text,
          file,
        }
      )
    }

    runtime.onResumeFromSleep = debounce(() => {
      log.info('onResumeFromSleep')
      // update timestamps
      updateTimestamps()
      // call maybe network
      BackendRemote.rpc.maybeNetwork()
    }, 1000)

    this.startup().then(() => {
      runtime.emitUIFullyReady()
    })
  }

  componentWillUnmount() {
    BackendRemote.off('Error', this.onError)
  }

  onError(accountId: number, { msg }: DcEventType<'Error'>) {
    if (
      this.selectedAccountId !== accountId ||
      this.state.screen === Screens.Welcome
    ) {
      return
    }
    this.userFeedback({ type: 'error', text: msg })
  }

  onSuccess(_event: any, text: string) {
    this.userFeedback({ type: 'success', text })
  }

  showAbout() {
    this.context.openDialog(About)
  }

  showSettings() {
    ActionEmitter.emitAction(KeybindAction.Settings_Open)
  }

  showKeyBindings() {
    ActionEmitter.emitAction(KeybindAction.KeybindingCheatSheet_Open)
  }

  renderScreen() {
    switch (this.state.screen) {
      case Screens.Main:
        // the key attribute here is a hack to force a clean rerendering when account changes
        return <MainScreen key={String(this.selectedAccountId)} />
      case Screens.Login:
        if (this.selectedAccountId === undefined) {
          throw new Error('Selected account not defined')
        }
        return (
          <AccountSetupScreen
            selectAccount={this.selectAccount}
            accountId={this.selectedAccountId}
          />
        )
      case Screens.Welcome:
        if (this.selectedAccountId === undefined) {
          throw new Error('Selected account not defined')
        }
        return (
          <WelcomeScreen
            selectedAccountId={this.selectedAccountId}
            onUnSelectAccount={this.unSelectAccount}
          />
        )
      case Screens.AccountList:
        return (
          <AccountListScreen
            {...{
              selectAccount: this.selectAccount,
              onAddAccount: this.addAndSelectAccount.bind(this),
            }}
          />
        )
      case Screens.DeleteAccount:
        if (this.selectedAccountId === undefined) {
          throw new Error('Selected account not defined')
        }
        return (
          <AccountDeletionScreen
            selectedAccountId={this.selectedAccountId}
            onDeleteAccount={this.onDeleteAccount.bind(this)}
          />
        )
      default:
        return null
    }
  }

  render() {
    return (
      <div>
        {this.state.message && (
          <div
            onClick={this.userFeedbackClick}
            className={`user-feedback ${this.state.message.type}`}
          >
            <p>{this.state.message.text}</p>
          </div>
        )}
        <ScreenContext.Provider
          value={{
            userFeedback: this.userFeedback,
            changeScreen: this.changeScreen,
            screen: this.state.screen,
          }}
        >
          <KeybindingsContextProvider>
            <div className='main-container'>
              <AccountListSidebar
                selectedAccountId={this.selectedAccountId}
                onAddAccount={this.addAndSelectAccount.bind(this)}
                onSelectAccount={this.selectAccount.bind(this)}
                openAccountDeletionScreen={this.openAccountDeletionScreen.bind(
                  this
                )}
              />
              {this.renderScreen()}
            </div>
          </KeybindingsContextProvider>
        </ScreenContext.Provider>
      </div>
    )
  }
}

ScreenController.contextType = DialogContext

export function selectedAccountId(): number {
  const selectedAccountId = window.__selectedAccountId
  if (selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  return selectedAccountId
}
