import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './ThemeManager'
import SettingsContext from './contexts/SettingsContext'
import ScreenController from './ScreenController'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import { remote } from 'electron'
import { callDcMethod, sendToBackend, sendToBackendSync, ipcBackend } from './ipc'
import logger from '../logger'

const log = logger.getLogger('render/App')
const localize = require('../localize')
const moment = require('moment')

addLocaleData(enLocaleData)

export default function App (props) {
  const [state, setState] = useState(remote.app.state)
  const [localeData, setLocaleData] = useState(null)

  useEffect(() => {
    sendToBackend('ipcReady')
    window.addEventListener('keydown', function (ev) {
      if (ev.code === 'KeyA' && (ev.metaKey || ev.ctrlKey)) {
        let stop = true
        if (ev.target.localName === 'textarea' || ev.target.localName === 'input') {
          stop = false
        } else {
          for (let index = 0; index < ev.path.length; index++) {
            const element = ev.path[index]
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

  function setupLocaleData (locale) {
    moment.locale(locale)
    const localeData = sendToBackendSync('locale-data', locale)
    window.localeData = localeData
    window.translate = localize.translate(localeData.messages)
    setLocaleData(localeData)
  }

  const logALL = (e, eName, ...args) => console.debug('ipcRenderer', eName, ...args)
  const logError = (e, ...args) => log.error(...args)
  const onRender = (e, state) => setState(state)
  const onChooseLanguage = (e, locale) => {
    setupLocaleData(locale)
    sendToBackend('chooseLanguage', locale)
  }

  useEffect(() => {
    setupLocaleData(state.saved.locale)
    ipcBackend.on('ALL', logALL)
    ipcBackend.on('error', logError)
    return () => {
      ipcBackend.removeListener('ALL', logALL)
      ipcBackend.removeListener('ALL', logError)
    }
  }, [])

  useEffect(() => {
    ipcBackend.on('render', onRender)
    return () => {
      ipcBackend.removeListener('render', onRender)
    }
  }, [state])

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
