import React from 'react'
import { Component } from 'react'
import { DcEventType } from '@deltachat/jsonrpc-client'
import { debounce } from 'debounce'

import MainScreen from './components/screens/MainScreen'
import processOpenQrUrl from './components/helpers/OpenQrUrl'
import { getLogger } from '../shared/logger'
import { ContextMenuLayer, OpenContextMenu } from './components/ContextMenu'
import { ActionEmitter, KeybindAction } from './keybindings'
import AccountSetupScreen from './components/screens/AccountSetupScreen'
import AccountListScreen from './components/screens/AccountListScreen'
import WelcomeScreen from './components/screens/WelcomeScreen'
import { BackendRemote } from './backend-com'
import { debouncedUpdateBadgeCounter } from './system-integration/badge-counter'
import { updateDeviceChats } from './deviceMessages'
import { runtime } from './runtime'
import WebxdcSaveToChatDialog from './components/dialogs/WebxdcSendToChatDialog'
import { updateTimestamps } from './components/conversations/Timestamp'
import { ScreenContext } from './contexts/ScreenContext'
import { DialogContext, DialogContextProvider } from './contexts/DialogContext'
import About from './components/dialogs/About'

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
}

export default class ScreenController extends Component {
  contextMenuShowFn: OpenContextMenu | null = null
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
    this.openContextMenu = this.openContextMenu.bind(this)
    this.changeScreen = this.changeScreen.bind(this)
    this.onShowAbout = this.showAbout.bind(this)
    this.onShowKeybindings = this.showKeyBindings.bind(this)
    this.onShowSettings = this.showSettings.bind(this)
    this.selectAccount = this.selectAccount.bind(this)

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
        const accountId = await BackendRemote.rpc.addAccount()
        await this.selectAccount(accountId)
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
    debouncedUpdateBadgeCounter()

    await BackendRemote.rpc.startIo(accountId)
    runtime.setDesktopSetting('lastAccount', accountId)
    log.info('system_info', await BackendRemote.rpc.getSystemInfo())
    log.info('account_info', await BackendRemote.rpc.getInfo(accountId))
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

  /**
   * Shows a context menu.
   *
   * @returns a promise with no return value that gets resolved when the context menu disapears again
   * regardless what action the user took or if they canceled the dialog
   */
  openContextMenu(...args: Parameters<OpenContextMenu>): Promise<void> {
    if (!this.contextMenuShowFn) {
      throw new Error('Context Menu Controller not available')
    }
    return this.contextMenuShowFn(...args)
  }

  renderScreen() {
    switch (this.state.screen) {
      case Screens.Main:
        return <MainScreen />
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
        return <WelcomeScreen selectedAccountId={this.selectedAccountId} />
      case Screens.AccountList:
        return (
          <AccountListScreen
            {...{
              selectAccount: this.selectAccount,
              onAddAccount: async () => {
                const accountId = await BackendRemote.rpc.addAccount()
                await this.selectAccount(accountId)
              },
            }}
          />
        )
      default:
        return null
    }
  }

  render() {
    return (
      <div>
        <ContextMenuLayer
          setShowFunction={showFn => {
            this.contextMenuShowFn = showFn
          }}
        />
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
            openContextMenu: this.openContextMenu,
            userFeedback: this.userFeedback,
            changeScreen: this.changeScreen,
            screen: this.state.screen,
          }}
        >
          <DialogContextProvider>{this.renderScreen()}</DialogContextProvider>
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
