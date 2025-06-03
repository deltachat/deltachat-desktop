import React from 'react'

import useTranslationFunction from '../hooks/useTranslationFunction'
import { getBackgroundImageStyle } from './message/MessageListAndComposer'
import { useSettingsStore } from '../stores/settings'

export default function NoChatSelected() {
  const tx = useTranslationFunction()
  const settingsStore = useSettingsStore()[0]

  const style: React.CSSProperties = settingsStore
    ? getBackgroundImageStyle(settingsStore.desktopSettings)
    : {}

  return (
    <div className='message-list-and-composer' style={style}>
      <div
        className='message-list-and-composer__message-list'
        style={{ display: 'flex' }}
      >
        <div className='info-message big' style={{ alignSelf: 'center' }}>
          <div className='bubble'>
            {tx('no_chat_selected_suggestion_desktop')}
          </div>
        </div>
      </div>
    </div>
  )
}
