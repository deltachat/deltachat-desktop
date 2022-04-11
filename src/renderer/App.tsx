import React, { useState, useEffect, useLayoutEffect } from 'react'
import { SettingsContext, i18nContext } from './contexts'
import ScreenController from './ScreenController'
import { sendToBackend, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'

import { translate, LocaleData } from '../shared/localize'
import { getLogger } from '../shared/logger'
const log = getLogger('renderer/App')
import { DeltaBackend } from './delta-remote'
import { ThemeManager, ThemeContext } from './ThemeManager'

import { CrashScreen } from './components/screens/CrashScreen'
import { runtime } from './runtime'
import { DesktopSettingsType } from '../shared/shared-types'

import dayjs from 'dayjs'
const dayjsLocales = {
    ar: [ 'ar', () => import('dayjs/locale/ar') ],
    az: [ 'az', () => import('dayjs/locale/az') ],
    bg: [ 'bg', () => import('dayjs/locale/bg') ],
    ca: [ 'ca', () => import('dayjs/locale/ca') ],
    cs: [ 'cs', () => import('dayjs/locale/cs') ],
    ckb: [ 'en', () => import('dayjs/locale/en') ], // FIXME
    da: [ 'da', () => import('dayjs/locale/da') ],
    de: [ 'de', () => import('dayjs/locale/de') ],
    // TODO
}

attachKeybindingsListener()

export default function App(_props: any) {
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
      const desktop_settings = await runtime.getDesktopSettings()
      await reloadLocaleData(desktop_settings.locale || 'en')
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
    dayjsLocale = dayjsLocales[localeData.locale]
    await dayjsLocale[1]()
    dayjs.locale(dayjsLocale[0])
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

  if (!localeData) return null
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
  ] = useState<DesktopSettingsType | null>(null)
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
    key: keyof DesktopSettingsType,
    value: string | number | boolean
  ) => {
    if (
      (await DeltaBackend.call('settings.setDesktopSetting', key, value)) ===
      true
    ) {
      _setDesktopSettings((prevState: DesktopSettingsType | null) => {
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
