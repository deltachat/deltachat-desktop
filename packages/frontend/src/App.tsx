import React, { useState, useEffect, useLayoutEffect } from 'react'
import moment from 'moment'

import ScreenController from './ScreenController'
import { translate, LocaleData } from '../../shared/localize'
import { ThemeManager, ThemeContext } from './ThemeManager'
import { CrashScreen } from './components/screens/CrashScreen'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { updateCoreStrings } from './stockStrings'
import { getLogger } from '../../shared/logger'
import { BackendRemote } from './backend-com'
import { runPostponedFunctions } from './onready'
import { I18nContext } from './contexts/I18nContext'

export default function App(_props: any) {
  useEffect(() => {
    runtime.emitUIReady()
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
  }, [])

  return (
    <CrashScreen>
      <ThemeContextWrapper>
        <I18nContextWrapper>
          <ScreenController />
        </I18nContextWrapper>
      </ThemeContextWrapper>
    </CrashScreen>
  )
}

function I18nContextWrapper({ children }: { children: React.ReactElement }) {
  const [localeData, setLocaleData] = useState<LocaleData | null>(null)

  async function reloadLocaleData(locale: string) {
    const localeData = await runtime.getLocaleData(locale)
    window.localeData = localeData
    window.static_translate = translate(localeData.locale, localeData.messages)
    setLocaleData(localeData)
    moment.locale(localeData.locale)
    updateCoreStrings()
  }

  useLayoutEffect(() => {
    ;(async () => {
      const desktop_settings = await runtime.getDesktopSettings()
      await reloadLocaleData(desktop_settings.locale || 'en')
    })()
  }, [])

  useEffect(() => {
    runtime.onChooseLanguage = async (locale: string) => {
      await runtime.setLocale(locale)
      await reloadLocaleData(locale)
    }
  }, [localeData])

  if (!localeData) return null
  return (
    <I18nContext.Provider
      value={{
        tx: window.static_translate,
        writingDirection: window.localeData.dir,
      }}
    >
      <div dir={window.localeData.dir}>{children}</div>
    </I18nContext.Provider>
  )
}
function ThemeContextWrapper({ children }: { children: React.ReactElement }) {
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
    log2.error(`Unhandled Error: ${event?.error?.message}`, event.error)
  })
  window.addEventListener('unhandledrejection', event => {
    log2.error(
      `Unhandled Rejection: ${event?.reason?.message}`,
      event,
      event.reason
    )
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
        event.kind == 'Info' ||
        event.kind == 'Warning' ||
        event.kind == 'Error'
      ) {
        data = event.msg
      } else if (event.kind == 'ConnectivityChanged') {
        // has no arguments
        data = ''
      } else {
        const event_clone = Object.assign({}, event) as Partial<typeof event>
        delete event_clone.kind
        data = event_clone
      }

      // eslint-disable-next-line no-console
      console.debug(
        `%c${isActiveAccount ? '👤' : '👻'}${accountId}%c📡 ${event.kind}`,
        `background:${accountColor};border-radius:8px 0 0 8px;padding:2px 4px;`,
        `background:${eventColor};border-radius:0 2px 2px 0;padding:2px 4px;`,
        data
      )
    })
  }
}
