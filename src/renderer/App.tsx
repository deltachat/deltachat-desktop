import React, { useState, useEffect, useLayoutEffect } from 'react'
import { SettingsContext, i18nContext } from './contexts'
import ScreenController from './ScreenController'
import { sendToBackend, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'
import { AppState, DesktopSettings } from '../shared/shared-types'

import { translate, LocaleData } from '../shared/localize'
import { getLogger } from '../shared/logger'
const log = getLogger('renderer/App')
import { DeltaBackend } from './delta-remote'
import { ThemeManager, ThemeContext } from './ThemeManager'

import moment from 'moment'
import { CrashScreen } from './components/screens/CrashScreen'

attachKeybindingsListener()

export default function App(_props: any) {
  const [state, setState] = useState<AppState | null>(null)

  const [localeData, setLocaleData] = useState<LocaleData | null>(null)

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

  useLayoutEffect(() => {
    startBackendLogging()
    ;(async () => {
      const state = await DeltaBackend.call('getState')
      await reloadLocaleData(state.saved.locale)

      setState(state)
    })()
  }, [])

  async function reloadLocaleData(locale: string) {
    const localeData: LocaleData = await DeltaBackend.call(
      'extras.getLocaleData',
      locale
    )
    window.localeData = localeData
    window.static_translate = translate(localeData.messages)
    setLocaleData(localeData)
    moment.locale(localeData.locale)
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
      <SettingsContextWrapper>
        <i18nContext.Provider value={window.static_translate}>
          <ScreenController />
        </i18nContext.Provider>
      </SettingsContextWrapper>
    </CrashScreen>
  )
}
function SettingsContextWrapper({ children }: { children: React.ReactChild }) {
  const [
    desktopSettings,
    _setDesktopSettings,
  ] = useState<DesktopSettings | null>(null)
  window.__desktopSettings = desktopSettings

  useEffect(() => {
    ;(async () => {
      const desktopSettings = await DeltaBackend.call(
        'settings.getDesktopSettings'
      )
      _setDesktopSettings(desktopSettings)
      window.__desktopSettings = desktopSettings
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
      _setDesktopSettings((prevState: DesktopSettings | null) => {
        if (prevState === null) {
          log.warn(
            'trying to update local version of desktop settings object, but it was not loaded yet'
          )
          return prevState
        }
        const newState = { ...prevState, [key]: value }
        window.__desktopSettings = newState
        return newState
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
    <SettingsContext.Provider value={{ desktopSettings, setDesktopSetting }}>
      <ThemeContext.Provider value={theme_rand}>
        {children}
      </ThemeContext.Provider>
    </SettingsContext.Provider>
  )
}
