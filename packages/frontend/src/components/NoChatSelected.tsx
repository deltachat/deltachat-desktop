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
    <div
      role='tabpanel'
      // See MessageListAndComposer as to why this is commented out.
      // aria-labelledby='tab-message-list-view'

      // The main MessageListAndComposer also has this ID and class.
      id='message-list-and-composer'
      className='message-list-and-composer'
      style={style}
    >
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
