import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './ThemeManager'
import SettingsContext from './contexts/SettingsContext'
import ScreenController from './ScreenController'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import { remote, ipcRenderer } from 'electron'
import logger from '../logger'

const log = logger.getLogger('render/main')
const localize = require('../localize')
const moment = require('moment')

addLocaleData(enLocaleData)

export default function App (props) {
  const [state, setState] = useState(remote.app.state)
  const [localeData, setLocaleData] = useState(null)

  useEffect(() => {
    ipcRenderer.send('ipcReady')
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
  }, [])

  function setupLocaleData (locale) {
    moment.locale(locale)
    const localeData = ipcRenderer.sendSync('locale-data', locale)
    window.localeData = localeData
    window.translate = localize.translate(localeData.messages)
    setLocaleData(localeData)
  }

  const logALL = (e, eName, ...args) => console.debug('ipcRenderer', eName, ...args)
  const logError = (e, ...args) => log.error(...args)
  const onRender = (e, state) => setState(state)
  const onChooseLanguage = (e, locale) => {
    setupLocaleData(locale)
    ipcRenderer.send('chooseLanguage', locale)
  }

  useEffect(() => {
    setupLocaleData(state.saved.locale)
    ipcRenderer.on('ALL', logALL)
    ipcRenderer.on('error', logError)
    return () => {
      ipcRenderer.removeListener('ALL', logALL)
      ipcRenderer.removeListener('ALL', logError)
    }
  }, [])

  useEffect(() => {
    ipcRenderer.on('render', onRender)
    return () => {
      ipcRenderer.removeListener('render', onRender)
    }
  }, [state])

  useEffect(() => {
    ipcRenderer.on('chooseLanguage', onChooseLanguage)
    return () => {
      ipcRenderer.removeListener('chooseLanguage', onChooseLanguage)
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
