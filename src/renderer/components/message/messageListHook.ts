import { useEffect, useState } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import { MessageType } from '../../../shared/shared-types'
import { Index, IndexRange } from 'react-virtualized'

export const enum LoadStatus {
  FETCHING = 1,
  LOADED = 2,
}

export function useMessageIdList(chatId: number) {
  const [state, setState] = useState<number[]>([])

  const refresh = () => {
    DeltaBackend.call('messageList.getMessageIds', chatId).then(newState => {
      setState(newState)
    })
  }

  useEffect(refresh, [chatId])

  // on some events refresh
  useKeyBindingAction(KeybindAction.ChatView_RefreshMessageList, refresh)

  // reload on events
  // 'DC_EVENT_INCOMING_MSG'

  return state
}

export function useMessageList(messageIds: number[]) {
  const [messageCache, setMessageCache] = useState<{
    [id: number]: MessageType | { msg: null }
  }>({})
  const [messageLoadState, setMessageLoading] = useState<{
    [id: number]: undefined | LoadStatus.FETCHING | LoadStatus.LOADED
  }>({})

  const isMessageLoaded: (params: Index) => boolean = ({ index }) =>
    !!messageLoadState[messageIds[index]]
  const loadMessages: (params: IndexRange) => Promise<void> = async ({
    startIndex,
    stopIndex,
  }) => {
    const ids =
      startIndex == stopIndex
        ? [messageIds[startIndex]]
        : messageIds.slice(startIndex, stopIndex + 1)

    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.FETCHING))
      return state
    })
    const messages = await DeltaBackend.call('messageList.getMessages', ids)
    setMessageCache(cache => ({ ...cache, ...messages }))
    setMessageLoading(state => {
      ids.forEach(id => (state[id] = LoadStatus.LOADED))
      return state
    })
  }

  //   // discard cached message when recieving a changed event

  //   'DC_EVENT_MSGS_CHANGED'

  //   // modify cached message accordingly on status change
  //   'DC_EVENT_MSG_READ'
  //   'DC_EVENT_MSG_DELIVERED'

  console.log({
    isMessageLoaded,
    messageLoadState,
    loadMessages,
    messageCache,
  })

  return {
    isMessageLoaded,
    loadMessages,
    messageCache,
  }
}
