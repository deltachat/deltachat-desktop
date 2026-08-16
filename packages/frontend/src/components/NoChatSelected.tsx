import React from 'react'

import { getBackgroundImageStyle } from './message/MessageListAndComposer'
import { useSettingsStore } from '../stores/settings'

export default function NoChatSelected({
  messages,
}: {
  messages: React.ReactNode
}) {
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
        {messages}
      </div>
    </div>
  )
}
