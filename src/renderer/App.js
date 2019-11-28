import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './ThemeManager'
import SettingsContext from './contexts/SettingsContext'
import ScreenController from './ScreenController'
import { addLocaleData, IntlProvider } from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import { remote } from 'electron'
import { callDcMethod, sendToBackend, sendToBackendSync, ipcBackend, startBackendLogging } from './ipc'

const localize = require('../localize')
const moment = require('moment')

addLocaleData(enLocaleData)

function selectFirstChatListItem() {
  let chatItemToSelect = document.querySelector('.chat-list-item')
  if (chatItemToSelect.classList.contains('chat-list-item--is-deaddrop')) {
    chatItemToSelect = chatItemToSelect.nextSibling
  }
  chatItemToSelect.click()
}

function selectChatItem(domChatItem) {
  if (domChatItem.classList.contains('chat-list-item--is-deaddrop')) return
  domChatItem.click()
  domChatItem.scrollIntoView({block: 'nearest'})
}

document.addEventListener ("keydown", function (Event) {
  if (Event.altKey  &&  Event.key === "ArrowDown") {
    const selectedChatItems = document.getElementsByClassName('chat-list-item--is-selected')
    if (selectedChatItems.length == 0) return selectFirstChatListItem()
    const nextChatItem = selectedChatItems[0].nextSibling
    selectChatItem(nextChatItem)
  } else if(Event.altKey && Event.key === 'ArrowUp') {
    const selectedChatItems = document.getElementsByClassName('chat-list-item--is-selected')
    if (selectedChatItems.length == 0) return selectFirstChatListItem()
    const previousChatItem = selectedChatItems[0].previousSibling
    selectChatItem(previousChatItem)
  }
});

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

  useEffect(() => {
    startBackendLogging()
    setupLocaleData(state.saved.locale)
  }, [])
  const onRender = (e, state) => setState(state)
  useEffect(() => {
    ipcBackend.on('render', onRender)
    return () => {
      ipcBackend.removeListener('render', onRender)
    }
  }, [state])

  function setupLocaleData (locale) {
    moment.locale(locale)
    const localeData = sendToBackendSync('locale-data', locale)
    window.localeData = localeData
    window.translate = localize.translate(localeData.messages)
    setLocaleData(localeData)
  }

  const onChooseLanguage = (e, locale) => {
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
