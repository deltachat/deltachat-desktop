import { Store, useStore } from './store'
import { MessageType } from '../../shared/shared-types'

class MessageListStoreState {
  messageIds: number[] = []
  messages: { [key: number]: MessageType | { msg: null } } = {}
}

const messageListStore = new Store<MessageListStoreState>(
  new MessageListStoreState(),
  'MessageListStore'
)

export const useChatStore = () => useStore(messageListStore)

export default messageListStore
