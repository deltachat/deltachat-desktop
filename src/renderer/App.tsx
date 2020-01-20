import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './ThemeManager'
import SettingsContext from './contexts/SettingsContext'
import ScreenController from './ScreenController'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import { remote } from 'electron'
import { callDcMethod, sendToBackend, sendToBackendSync, ipcBackend, startBackendLogging } from './ipc'
import attachKeybindingsListener from './keybindings'
import { ExtendedApp, AppState } from '../shared/shared-types'

import { translate, LocaleData } from '../shared/localize'
const moment = require('moment')

addLocaleData(enLocaleData)

attachKeybindingsListener()

export default function App (props:any) {
  const [state, setState] = useState<AppState>((remote.app as ExtendedApp).state)
  const [localeData, setLocaleData] = useState<LocaleData | null>(null)

  useEffect(() => {
    sendToBackend('ipcReady')
    window.addEventListener('keydown', function (ev: KeyboardEvent) {
      if (ev.code === 'KeyA' && (ev.metaKey || ev.ctrlKey)) {
        let stop = true
        if ((ev.target as HTMLElement).localName === 'textarea' || (ev.target as HTMLElement).localName === 'input') {
          stop = false
        } else {
          // KeyboardEvent ev.path does ONLY exist in CHROMIUM
          const invokePath:HTMLElement[] = (ev as any).path
          for (let index = 0; index < invokePath.length; index++) {
            const element: HTMLElement = invokePath[index]
            if (element.localName === 'textarea' || element.localName === 'input') stop = false
          }
        }
        if (stop) {
          ev.stopPropagation()
          ev.preventDefault()
        }
      }
    })

    window.addEventListener('online', () => {
      callDcMethod('context.maybeNetwork')
    })
  }, [])

  useEffect(() => {
    startBackendLogging()
    setupLocaleData(state.saved.locale)
  }, [])
  const onRender = (e:any, state:AppState) => setState(state)
  useEffect(() => {
    ipcBackend.on('render', onRender)
    return () => {
      ipcBackend.removeListener('render', onRender)
    }
  }, [state])

  function setupLocaleData (locale:string) {
    moment.locale(locale)
    const localeData: LocaleData = sendToBackendSync('locale-data', locale);
    (window as any).localeData = localeData;
    (window as any).translate = translate(localeData.messages)
    setLocaleData(localeData)
  }

  const onChooseLanguage = (e:any, locale:string) => {
    setupLocaleData(locale)
    sendToBackend('chooseLanguage', locale)
  }
  useEffect(() => {
    ipcBackend.on('chooseLanguage', onChooseLanguage)
    return () => {
      ipcBackend.removeListener('chooseLanguage', onChooseLanguage)
    }
  }, [localeData])

  if (!localeData) return null
  return (
    <SettingsContext.Provider value={state.saved}>
      <IntlProvider locale={localeData.locale}>
        <ThemeProvider>
          <ScreenController
            logins={state.logins}
            deltachat={state.deltachat} />
        </ThemeProvider>
      </IntlProvider>
    </SettingsContext.Provider>
  )
}
