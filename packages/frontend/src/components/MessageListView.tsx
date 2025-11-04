import React from 'react'

import MessageListAndComposer from './message/MessageListAndComposer'
import NoChatSelected from './NoChatSelected'
import useChat from '../hooks/chat/useChat'
import { RecoverableCrashScreen } from './screens/RecoverableCrashScreen'

export default function MessageListView({
  accountId,
}: {
  accountId?: number
}): React.JSX.Element {
  const { chatWithLinger } = useChat()

  if (chatWithLinger && accountId) {
    return (
      <RecoverableCrashScreen reset_on_change_key={chatWithLinger.id}>
        <MessageListAndComposer
          // Note that `key` has not always been here.
          // Some downstream components still try to support variable `chatId`.
          // To name a few:
          // - `useDraft`'s `abortController`.
          // - `hasChatChanged` in `MessageList`.
          // - `useHasChanged2(chatId)` in `Composer`.
          //
          // However, most of that code is about resetting some state,
          // so it probably can be removed.
          // We do not and should actually rely on any kind of cross-chat state.
          key={`${accountId}_${chatWithLinger.id}`}
          accountId={accountId}
          chat={chatWithLinger}
        />
      </RecoverableCrashScreen>
    )
  }

  return <NoChatSelected />
}
