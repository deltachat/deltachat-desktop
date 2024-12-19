import React, { useRef } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'
import { useRovingTabindex } from '../../contexts/RovingTabindex'

type Props = {
  chat: T.FullChat
}

export default function EmptyChatMessage({ chat }: Props) {
  const tx = useTranslationFunction()

  const ref = useRef<HTMLLIElement>(null)
  const rovingTabindex = useRovingTabindex(ref)

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
    <li
      ref={ref}
      className={rovingTabindex.className}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <div className='info-message big'>
        <div className='bubble'>{emptyChatMessage}</div>
      </div>
    </li>
  )
}
