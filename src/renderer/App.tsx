import React, { useState, useEffect, useLayoutEffect } from 'react'
import { i18nContext } from './contexts'
import ScreenController from './ScreenController'
import { sendToBackend, ipcBackend } from './ipc'
import attachKeybindingsListener from './keybindings'

import { translate, LocaleData } from '../shared/localize'
import { ThemeManager, ThemeContext } from './ThemeManager'

import moment from 'moment'
import { CrashScreen } from './components/screens/CrashScreen'
import { runtime } from './runtime'
import { updateCoreStrings } from './stockStrings'
import { getLogger } from '../shared/logger'
import { BackendRemote } from './backend-com'
import { runPostponedFunctions } from './onready'

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
    runPostponedFunctions()
    ;(async () => {
      const desktop_settings = await runtime.getDesktopSettings()
      await reloadLocaleData(desktop_settings.locale || 'en')
    })()
  }, [])

  async function reloadLocaleData(locale: string) {
    const localeData = await runtime.getLocaleData(locale)
    window.localeData = localeData
    window.static_translate = translate(localeData.messages)
    setLocaleData(localeData)
    moment.locale(localeData.locale)
    updateCoreStrings()
  }

  useEffect(() => {
    const onChooseLanguage = async (_e: any, locale: string) => {
      await runtime.setLocale(locale)
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
    ThemeManager.refresh()
  }, [])

  return (
    <ThemeContext.Provider value={theme_rand}>{children}</ThemeContext.Provider>
  )
}

const log = getLogger('renderer/App')
let backendLoggingStarted = false
export function startBackendLogging() {
  if (backendLoggingStarted === true)
    return log.error('Backend logging is already started!')
  backendLoggingStarted = true

  const log2 = getLogger('renderer')
  window.addEventListener('error', event => {
    log2.error('Unhandled Error:', event.error)
  })
  window.addEventListener('unhandledrejection', event => {
    log2.error('Unhandled Rejection:', event, event.reason)
  })

  const rc = runtime.getRC_Config()
  if (rc['log-debug']) {
    BackendRemote.on('ALL', (accountId, event) => {
      const isActiveAccount = window.__selectedAccountId == accountId
      let data: any,
        accountColor = 'rgba(125,125,125,0.25)'
      const eventColor = 'rgba(125,125,125,0.15)'

      if (isActiveAccount) {
        accountColor = 'rgba(0,125,0,0.25)'
      }

      if (
        event.type == 'Info' ||
        event.type == 'Warning' ||
        event.type == 'Error'
      ) {
        data = event.msg
      } else if (event.type == 'ConnectivityChanged') {
        // has no arguments
        data = ''
      } else {
        const event_clone = Object.assign({}, event) as Partial<typeof event>
        delete event_clone.type
        data = event_clone
      }

      /* ignore-console-log */
      console.debug(
        `%c${isActiveAccount ? '👤' : '👻'}${accountId}%c📡 ${event.type}`,
        `background:${accountColor};border-radius:8px 0 0 8px;padding:2px 4px;`,
        `background:${eventColor};border-radius:0 2px 2px 0;padding:2px 4px;`,
        data
      )
    })
  }
}
