import React, { createRef } from 'react'
import { Component } from 'react'
import { DcEventType } from '@deltachat/jsonrpc-client'
import { throttle } from '@deltachat-desktop/shared/util'

import MainScreen from './components/screens/MainScreen/MainScreen'
import { getLogger } from '../../shared/logger'
import AccountSetupScreen from './components/screens/AccountSetupScreen'
import WelcomeScreen from './components/screens/WelcomeScreen'
import { BackendRemote, EffectfulBackendActions } from './backend-com'
import { updateDeviceChat, updateDeviceChats } from './deviceMessages'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { updateTimestamps } from './components/conversations/Timestamp'
import { ScreenContext } from './contexts/ScreenContext'
import { KeybindingsContextProvider } from './contexts/KeybindingsContext'
import { DialogContextProvider } from './contexts/DialogContext'
import AccountListSidebar from './components/AccountListSidebar/AccountListSidebar'
import SettingsStoreInstance from './stores/settings'
import { NoAccountSelectedScreen } from './components/screens/NoAccountSelectedScreen/NoAccountSelectedScreen'
import AccountDeletionScreen from './components/screens/AccountDeletionScreen/AccountDeletionScreen'
import RuntimeAdapter from './components/RuntimeAdapter'
import { ChatProvider, UnselectChat } from './contexts/ChatContext'
import { ContextMenuProvider } from './contexts/ContextMenuContext'
import { InstantOnboardingProvider } from './contexts/InstantOnboardingContext'
import { SmallScreenModeMacOSTitleBar } from './components/SmallScreenModeMacOSTitleBar'

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
  DeleteAccount = 'deleteAccount',
  NoAccountSelected = 'noAccountSelected',
}

const BREAKPOINT_FOR_SMALLSCREEN_MODE = 720

function isSmallScreenMode(): boolean {
  return window.innerWidth <= BREAKPOINT_FOR_SMALLSCREEN_MODE
}

export default class ScreenController extends Component {
  state: {
    message: userFeedback | false
    screen: Screens
    smallScreenMode: boolean
  }
  selectedAccountId: number | undefined
  lastAccountBeforeAddingNewAccount: number | null = null
  unselectChatRef = createRef<UnselectChat>()

  constructor(public props: {}) {
    super(props)
    this.state = {
      message: false,
      screen: Screens.Loading,
      smallScreenMode: isSmallScreenMode(),
    }

    this.onError = this.onError.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.userFeedback = this.userFeedback.bind(this)
    this.userFeedbackClick = this.userFeedbackClick.bind(this)
    this.changeScreen = this.changeScreen.bind(this)
    this.addAndSelectAccount = this.addAndSelectAccount.bind(this)
    this.selectAccount = this.selectAccount.bind(this)
    this.unSelectAccount = this.unSelectAccount.bind(this)
    this.openAccountDeletionScreen = this.openAccountDeletionScreen.bind(this)
    this.onDeleteAccount = this.onDeleteAccount.bind(this)
    this.onExitWelcomeScreen = this.onExitWelcomeScreen.bind(this)
    this.updateSmallScreenMode = this.updateSmallScreenMode.bind(this)

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
        this.changeScreen(Screens.NoAccountSelected)
      } else {
        await this.addAndSelectAccount()
      }
    }
    updateDeviceChats()

    BackendRemote.rpc.getAllAccountIds().then(accountIds => {
      for (const accountId of accountIds) {
        BackendRemote.rpc
          .setConfig(accountId, 'disable_idle', null)
          .catch(() => log.error("failed to reset 'disable_idle' config key"))
      }
    })
  }

  private async _getLastUsedAccount(): Promise<number | undefined> {
    let lastLoggedInAccountId
    const desktopSettingsLastAccount = (await runtime.getDesktopSettings())
      .lastAccount
    if (desktopSettingsLastAccount != undefined) {
      lastLoggedInAccountId = desktopSettingsLastAccount
      runtime.setDesktopSetting('lastAccount', undefined)
    } else {
      lastLoggedInAccountId = await BackendRemote.rpc.getSelectedAccountId()
    }
    try {
      if (lastLoggedInAccountId) {
        await BackendRemote.rpc.getAccountInfo(lastLoggedInAccountId)
        return lastLoggedInAccountId
      } else {
        return undefined
      }
    } catch (_error) {
      log.warn(
        `getLastUsedAccount: account with id ${lastLoggedInAccountId} does not exist`
      )
      return undefined
    }
  }

  async selectAccount(accountId: number, dontStartIo = false) {
    if (accountId !== this.selectedAccountId) {
      await this.unSelectAccount()
      this.selectedAccountId = accountId
      ;(window.__selectedAccountId as number) = accountId
      // forcing to load settings here so when we for example switch to Settings
      // from context menu they're already present and we avoid crashing
      SettingsStoreInstance.effect.load()
    } else {
      log.info('account is already selected')
      // do not return here as this can be the state transition between unconfigured to configured
    }

    const account = await BackendRemote.rpc.getAccountInfo(
      this.selectedAccountId
    )
    if (account.kind === 'Configured') {
      this.changeScreen(Screens.Main)
    } else {
      this.changeScreen(Screens.Welcome)
    }

    if (!dontStartIo) {
      await BackendRemote.rpc.startIo(accountId)
    }

    await BackendRemote.rpc.selectAccount(accountId)
  }

  async unSelectAccount() {
    if (this.selectedAccountId === undefined) {
      return
    }

    this.unselectChatRef.current?.()

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
    if (this.selectedAccountId) {
      this.lastAccountBeforeAddingNewAccount = this.selectedAccountId
    }
    const accountId = await BackendRemote.rpc.addAccount()
    updateDeviceChat(accountId, true) // skip changelog
    await this.selectAccount(accountId)
    return accountId
  }

  async onExitWelcomeScreen(): Promise<void> {
    if (this.lastAccountBeforeAddingNewAccount) {
      try {
        await this.selectAccount(this.lastAccountBeforeAddingNewAccount)
      } catch (_error) {
        this.changeScreen(Screens.NoAccountSelected)
      }
    } else {
      const accounts = await BackendRemote.rpc.getAllAccountIds()
      if (accounts.length > 0) {
        this.changeScreen(Screens.NoAccountSelected)
      } else {
        // special case: there is no account at all
        // we should avoid a state with no selected
        // account, since instant onboarding expects
        // at least an unconfigured account to exist
        this.addAndSelectAccount()
      }
    }
    this.lastAccountBeforeAddingNewAccount = null
  }

  async openAccountDeletionScreen(accountId: number) {
    const dontStartIo = true
    await this.selectAccount(accountId, dontStartIo)
    this.changeScreen(Screens.DeleteAccount)
  }

  async onDeleteAccount(accountId: number) {
    await this.unSelectAccount()
    await EffectfulBackendActions.removeAccount(accountId)
    this.changeScreen(Screens.NoAccountSelected)
  }

  userFeedback(message: userFeedback | false, clickToClose = false) {
    if (message !== false && this.state.message === message) return // one at a time, cowgirl
    this.setState({ message })
    if (!clickToClose && message && message.type !== 'error') {
      window.setTimeout(() => {
        this.userFeedback(false)
      }, 3000)
    }
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

  updateSmallScreenMode() {
    const newIsSmallScreen = isSmallScreenMode()
    if (this.state.smallScreenMode !== newIsSmallScreen) {
      this.setState({ smallScreenMode: newIsSmallScreen })
    }
  }

  componentDidMount() {
    BackendRemote.on('Error', this.onError)

    runtime.onResumeFromSleep = throttle(() => {
      log.info('onResumeFromSleep')
      // update timestamps
      updateTimestamps()
      // call maybe network
      BackendRemote.rpc.maybeNetwork()
    }, 2000)

    this.startup().then(() => {
      runtime.emitUIFullyReady()
    })

    window.addEventListener('resize', this.updateSmallScreenMode)
  }

  componentWillUnmount() {
    BackendRemote.off('Error', this.onError)

    window.removeEventListener('resize', this.updateSmallScreenMode)
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

  renderScreen(key: React.Key | null | undefined) {
    switch (this.state.screen) {
      case Screens.Main:
        return <MainScreen accountId={this.selectedAccountId} key={key} />
      case Screens.Login:
        if (this.selectedAccountId === undefined) {
          throw new Error('Selected account not defined')
        }
        return (
          <AccountSetupScreen
            selectAccount={this.selectAccount}
            accountId={this.selectedAccountId}
            key={key}
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
            onExitWelcomeScreen={this.onExitWelcomeScreen}
            key={key}
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
            key={key}
          />
        )
      case Screens.NoAccountSelected:
        return <NoAccountSelectedScreen />
      default:
        return null
    }
  }

  render() {
    return (
      <div data-testid={`selected-account:${this.selectedAccountId}`}>
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
            smallScreenMode: this.state.smallScreenMode,
          }}
        >
          <InstantOnboardingProvider>
            <ChatProvider
              accountId={this.selectedAccountId}
              unselectChatRef={this.unselectChatRef}
            >
              <ContextMenuProvider>
                <DialogContextProvider>
                  <RuntimeAdapter accountId={this.selectedAccountId} />
                  <KeybindingsContextProvider>
                    <div className='main-container-container'>
                      {this.state.smallScreenMode &&
                        runtime.getRuntimeInfo().isMac && (
                          <SmallScreenModeMacOSTitleBar />
                        )}
                      <div className='main-container'>
                        <AccountListSidebar
                          selectedAccountId={this.selectedAccountId}
                          onAddAccount={this.addAndSelectAccount}
                          onSelectAccount={this.selectAccount.bind(this)}
                          openAccountDeletionScreen={this.openAccountDeletionScreen.bind(
                            this
                          )}
                        />
                        {this.renderScreen(this.selectedAccountId)}
                      </div>
                    </div>
                  </KeybindingsContextProvider>
                </DialogContextProvider>
              </ContextMenuProvider>
            </ChatProvider>
          </InstantOnboardingProvider>
        </ScreenContext.Provider>
      </div>
    )
  }
}

export function selectedAccountId(): number {
  const selectedAccountId = window.__selectedAccountId
  if (selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  return selectedAccountId
}
