import { Store, useStore } from './store'
import { NormalMessage } from '../../shared/shared-types'

class MessageListStoreState {
  messageIds: number[] = []
  messages: { [key: number]: NormalMessage | null } = {}
}

const messageListStore = new Store<MessageListStoreState>(
  new MessageListStoreState(),
  'MessageListStore'
)

export const useChatStore = () => useStore(messageListStore)

export default messageListStore
