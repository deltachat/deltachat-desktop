import React from 'react'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { ChatStoreStateWithChatSet } from '../../stores/chat'
import { C } from '@deltachat/jsonrpc-client'

export default function EmptyChatMessage({
  chatStore,
}: {
  chatStore: ChatStoreStateWithChatSet
}) {
  const tx = useTranslationFunction()
  const { chat } = chatStore

  let emptyChatMessage = tx('chat_new_one_to_one_hint', [chat.name, chat.name])

  if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
    emptyChatMessage = tx('chat_new_broadcast_hint')
  } else if (chat.chatType === C.DC_CHAT_TYPE_GROUP && !chat.isContactRequest) {
    emptyChatMessage = chat.isUnpromoted
      ? tx('chat_new_group_hint')
      : tx('chat_no_messages')
  } else if (chat.isSelfTalk) {
    emptyChatMessage = tx('saved_messages_explain')
  } else if (chat.isDeviceChat) {
    emptyChatMessage = tx('device_talk_explain')
  } else if (chat.isContactRequest) {
    emptyChatMessage = tx('chat_no_messages')
  }

  return (
    <li>
      <div className='info-message big'>
        <div className='bubble'>{emptyChatMessage}</div>
      </div>
    </li>
  )
}
