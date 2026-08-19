import React from 'react'

import useTranslationFunction from '../hooks/useTranslationFunction'
import { getBackgroundImageStyle } from './message/MessageListAndComposer'
import { useDesktopSettingsStore } from '../stores/settings'

export default function NoChatSelected() {
  const tx = useTranslationFunction()
  const desktopSettingsStore = useDesktopSettingsStore()[0]

  const style: React.CSSProperties = desktopSettingsStore
    ? getBackgroundImageStyle(desktopSettingsStore)
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
