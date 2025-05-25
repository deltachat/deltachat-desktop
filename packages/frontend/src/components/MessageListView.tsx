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
          accountId={accountId}
          chat={chatWithLinger}
        />
      </RecoverableCrashScreen>
    )
  }

  return <NoChatSelected />
}
