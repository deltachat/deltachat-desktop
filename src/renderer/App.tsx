import React, { useState, useEffect } from 'react'
import { SettingsContext } from './contexts'
import ScreenController, { Screens } from './ScreenController'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
const { remote } = window.electron_functions
import { sendToBackend, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'
import { ExtendedApp, AppState, DeltaChatAccount } from '../shared/shared-types'

import { translate, LocaleData } from '../shared/localize'
import { getLogger } from '../shared/logger'
import { DeltaBackend } from './delta-remote'
import { ThemeManager } from './ThemeManager'

const log = getLogger('renderer/App')
import moment from 'moment'
import { CrashScreen } from './components/CrashScreen'

addLocaleData(enLocaleData)

attachKeybindingsListener()

// This export is just used to activate the theme manager for now
export const theme_manager = ThemeManager

export default function App(props: any) {
  const [state, setState] = useState<AppState>(null)
  const [localeData, setLocaleData] = useState<LocaleData | null>(null)

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

  useEffect(() => {
    startBackendLogging()
    setupLocaleData('en')
    ;(async () => {
      const state = await DeltaBackend.call('getState')
      setState(state)
      const lastLoggedInAccount: DeltaChatAccount = await DeltaBackend.call(
        'login.getLastLoggedInAccount'
      )
      if (!lastLoggedInAccount) return

      await DeltaBackend.call('login.loadAccount', lastLoggedInAccount)
      if (typeof window.__changeScreen === 'function') {
        window.__changeScreen(Screens.Main)
      } else {
        throw new Error('window.__changeScreen is not a function')
      }
    })()
  }, [])

  const onRender = (e: any, state: AppState) => {
    log.debug('onRenderer')
    setState(state)
  }
  useEffect(() => {
    ipcBackend.on('render', onRender)
    return () => {
      ipcBackend.removeListener('render', onRender)
    }
  }, [state])

  async function setupLocaleData(locale: string) {
    moment.locale(locale)
    const localeData: LocaleData = await DeltaBackend.call(
      'extras.getLocaleData',
      locale
    )
    window.localeData = localeData
    window.translate = translate(localeData.messages)
    setLocaleData(localeData)
  }

  const onChooseLanguage = async (e: any, locale: string) => {
    await setupLocaleData(locale)
    sendToBackend('chooseLanguage', locale)
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
      <SettingsContext.Provider value={state.saved}>
        <IntlProvider locale={localeData.locale}>
          <ScreenController deltachat={state.deltachat} />
        </IntlProvider>
      </SettingsContext.Provider>
    </CrashScreen>
  )
}
