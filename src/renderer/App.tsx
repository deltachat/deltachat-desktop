import React, { useState, useEffect, useLayoutEffect } from 'react'
import { SettingsContext, i18nContext } from './contexts'
import ScreenController, { Screens } from './ScreenController'
import { sendToBackend, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'
import {
  AppState,
  DeltaChatAccount,
  DesktopSettings,
} from '../shared/shared-types'

import { translate, LocaleData } from '../shared/localize'
import { getLogger } from '../shared/logger'
import { DeltaBackend } from './delta-remote'
import { ThemeManager } from './ThemeManager'

const log = getLogger('renderer/App')
import moment from 'moment'
import { CrashScreen } from './components/CrashScreen'
import { getDefaultState } from '../shared/state'
const { ipcRenderer } = window.electron_functions

attachKeybindingsListener()

// This export is just used to activate the theme manager for now
export const theme_manager = ThemeManager

export default function App(props: any) {
  const [state, setState] = useState<AppState>(null)

  const [localeData, setLocaleData] = useState<LocaleData | null>(null)
  const [account, setAccount] = useState<DeltaChatAccount>(null)

  useEffect(() => {
    sendToBackend('ipcReady')
    window.addEventListener('keydown', function(ev: KeyboardEvent) {
      if (ev.code === 'KeyA' && (ev.metaKey || ev.ctrlKey)) {
        let stop = true
        if (
          (ev.target as HTMLElement).localName === 'textarea' ||
          (ev.target as HTMLElement).localName === 'input'
        ) {
          stop = false
        } else {
          // KeyboardEvent ev.path does ONLY exist in CHROMIUM
          const invokePath: HTMLElement[] = (ev as any).path
          for (let index = 0; index < invokePath.length; index++) {
            const element: HTMLElement = invokePath[index]
            if (
              element.localName === 'textarea' ||
              element.localName === 'input'
            )
              stop = false
          }
        }
        if (stop) {
          ev.stopPropagation()
          ev.preventDefault()
        }
      }
    })
  }, [])

  const loadAccount = async (account: DeltaChatAccount) => {
    await DeltaBackend.call('login.loadAccount', account)
    setAccount(account)
    if (typeof window.__changeScreen === 'function') {
      window.__changeScreen(Screens.Main)
    } else {
      window.addEventListener('frontendReady', () => {
        window.__changeScreen(Screens.Main)
      })
    }
  }

  useLayoutEffect(() => {
    startBackendLogging()
    ;(async () => {
      const state = await DeltaBackend.call('getState')
      await reloadLocaleData(state.saved.locale)
      const lastLoggedInAccount: DeltaChatAccount = await DeltaBackend.call(
        'login.getLastLoggedInAccount'
      )

      if (lastLoggedInAccount) loadAccount(lastLoggedInAccount)

      setState(state)
    })()
  }, [])

  async function reloadLocaleData(locale: string) {
    moment.locale(locale)
    const localeData: LocaleData = await DeltaBackend.call(
      'extras.getLocaleData',
      locale
    )
    window.localeData = localeData
    window.static_translate = translate(localeData.messages)
    setLocaleData(localeData)
    moment.locale(locale)
  }

  const onChooseLanguage = async (e: any, locale: string) => {
    await DeltaBackend.call('extras.setLocale', locale)
    await reloadLocaleData(locale)
  }
  useEffect(() => {
    ipcBackend.on('chooseLanguage', onChooseLanguage)
    return () => {
      ipcBackend.removeListener('chooseLanguage', onChooseLanguage)
    }
  }, [localeData])

  if (!localeData || !state) return null
  return (
    <CrashScreen>
      <SettingsContextWrapper account={account}>
        <i18nContext.Provider value={window.static_translate}>
          <ScreenController account={account} loadAccount={loadAccount} />
        </i18nContext.Provider>
      </SettingsContextWrapper>
    </CrashScreen>
  )
}
export function SettingsContextWrapper({
  account,
  children,
}: {
  account: DeltaChatAccount
  children: React.ReactChild
}) {
  const [desktopSettings, _setDesktopSettings] = useState<DesktopSettings>(null)

  useEffect(() => {
    ;(async () => {
      const desktopSettings = await DeltaBackend.call(
        'settings.getDesktopSettings'
      )
      _setDesktopSettings(desktopSettings)
    })()
  }, [])

  const setDesktopSetting = async (
    key: keyof DesktopSettings,
    value: string | number | boolean
  ) => {
    if (
      (await DeltaBackend.call('settings.setDesktopSetting', key, value)) ===
      true
    ) {
      _setDesktopSettings((prevState: DesktopSettings) => {
        return { ...prevState, [key]: value }
      })
    }
  }

  if (!desktopSettings) return null

  return (
    <SettingsContext.Provider
      value={{ desktopSettings, setDesktopSetting, account }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
