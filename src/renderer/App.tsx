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
// import { getLogger } from '../shared/logger'
// const log = getLogger('renderer/App')
import { DeltaBackend } from './delta-remote'
import { ThemeManager, ThemeContext } from './ThemeManager'

import moment from 'moment'
import { CrashScreen } from './components/CrashScreen'

attachKeybindingsListener()

export default function App(_props: any) {
  const [state, setState] = useState<AppState>(null)

  const [localeData, setLocaleData] = useState<LocaleData | null>(null)
  const [account, setAccount] = useState<DeltaChatAccount>(null)

  useEffect(() => {
    sendToBackend('ipcReady')
    window.addEventListener('keydown', function (ev: KeyboardEvent) {
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

  const selectAccount = async (accountId: number) => {
    await DeltaBackend.call('login.selectAccount', accountId)
    const account = await DeltaBackend.call('login.accountInfo')
    setAccount(account)
    if (typeof window.__changeScreen === 'function') {
      window.__changeScreen(Screens.Main)
    } else {
      window.addEventListener('frontendReady', () => {
        window.__changeScreen(Screens.Main)
      })
    }
  }

  const removeAccount = async (accountId: number) => {
    await DeltaBackend.call('login.removeAccount', accountId)
  } 

  useLayoutEffect(() => {
    startBackendLogging()
    ;(async () => {
      const state = await DeltaBackend.call('getState')
      await reloadLocaleData(state.saved.locale)
      const lastLoggedInAccountId = await DeltaBackend.call(
        'login.getLastLoggedInAccount'
      )

      if (lastLoggedInAccountId) selectAccount(lastLoggedInAccountId)

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

  useEffect(() => {
    const onChooseLanguage = async (_e: any, locale: string) => {
      await DeltaBackend.call('extras.setLocale', locale)
      await reloadLocaleData(locale)
    }
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
          <ScreenController account={account} selectAccount={selectAccount} removeAccount={removeAccount} />
        </i18nContext.Provider>
      </SettingsContextWrapper>
    </CrashScreen>
  )
}
function SettingsContextWrapper({
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

  /** on each theme change this var changes */
  const [theme_rand, setThemeRand] = useState(0)
  useEffect(() => {
    ThemeManager.setUpdateHook(() => setThemeRand(Math.random()))
  }, [])

  if (!desktopSettings) return null

  return (
    <SettingsContext.Provider
      value={{ desktopSettings, setDesktopSetting, account }}
    >
      <ThemeContext.Provider value={theme_rand}>
        {children}
      </ThemeContext.Provider>
    </SettingsContext.Provider>
  )
}
