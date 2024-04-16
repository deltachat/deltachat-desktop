import React from 'react'

import Gallery from './Gallery'
import MapComponent from './map/MapComponent'
import MessageListAndComposer from './message/MessageListAndComposer'
import NoChatSelected from './NoChatSelected'
import useChat from '../hooks/chat/useChat'
import useMessage from '../hooks/chat/useMessage'
import { ChatView } from '../contexts/ChatContext'
import { RecoverableCrashScreen } from './screens/RecoverableCrashScreen'

import type { AlternativeView } from './screens/MainScreen'

type Props = {
  accountId?: number
  alternativeView: AlternativeView
  galleryRef: any
  onUpdateGalleryView: () => void
}

export default function MessageListView({
  accountId,
  galleryRef,
  alternativeView,
  onUpdateGalleryView,
}: Props) {
  const { activeView, chat } = useChat()
  const { sendMessage } = useMessage()

  if (chat && accountId) {
    switch (activeView) {
      case ChatView.Media:
        return (
          <Gallery
            ref={galleryRef}
            chatId={chat.id}
            onUpdateView={onUpdateGalleryView}
          />
        )
      case ChatView.Map:
        return <MapComponent sendMessage={sendMessage} selectedChat={chat} />
      case ChatView.MessageList:
      default:
        return (
          <RecoverableCrashScreen reset_on_change_key={chat.id}>
            <MessageListAndComposer accountId={accountId} chat={chat} />
          </RecoverableCrashScreen>
        )
    }
  } else if (alternativeView === 'global-gallery') {
    return (
      <Gallery
        chatId={'all'}
        ref={galleryRef}
        onUpdateView={onUpdateGalleryView}
      />
    )
  }

  return <NoChatSelected />
}
