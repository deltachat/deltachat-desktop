import React, { useState, useEffect, useLayoutEffect } from 'react'
import { i18nContext } from './contexts'
import ScreenController from './ScreenController'
import { sendToBackend, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'

import { translate, LocaleData } from '../shared/localize'
import { DeltaBackend } from './delta-remote'
import { ThemeManager, ThemeContext } from './ThemeManager'

import moment from 'moment'
import { CrashScreen } from './components/screens/CrashScreen'
import { runtime } from './runtime'

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

  if (!localeData) return null
  return (
    <CrashScreen>
      <ThemeContextWrapper>
        <i18nContext.Provider value={window.static_translate}>
          <ScreenController />
        </i18nContext.Provider>
      </ThemeContextWrapper>
    </CrashScreen>
  )
}
function ThemeContextWrapper({ children }: { children: React.ReactChild }) {
  /** on each theme change this var changes */
  const [theme_rand, setThemeRand] = useState(0)
  useEffect(() => {
    ThemeManager.setUpdateHook(() => setThemeRand(Math.random()))
  }, [])


  return (
    <ThemeContext.Provider value={theme_rand}>
      {children}
    </ThemeContext.Provider>
  )
}
