import { ipcBackend, mainProcessUpdateBadge, saveLastChatId } from '../ipc'
import { Store, useStore, Action } from './store'
import { JsonContact, FullChat, MessageType } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'

export const PAGE_SIZE = 10

class state implements FullChat {
  contactIds: number[]
  isDeviceChat: boolean
  selfInGroup: boolean
  id: number | null = null
  name = ''
  isVerified = false
  profileImage: string = null

  archived = false
  subtitle = ''
  type: number = null
  isUnpromoted = false
  isSelfTalk = false

  contacts: JsonContact[] = []
  color = ''
  freshMessageCounter = 0
  isGroup = false
  isDeaddrop = false
  draft: string | null = null

  muted = false
  jump_to_messageId: number = null
}

export { state as ChatStoreState }

const defaultState = new state()

const chatStore = new Store<state>(new state(), 'ChatStore')
const log = chatStore.log

chatStore.attachReducer(({ type, payload, id }, state) => {
  if (type === 'SELECTED_CHAT') {
    return {
      ...defaultState,
      ...payload,
      jump_to_messageId: payload.jump_to_messageId || null,
    }
  }

  if (typeof id !== 'undefined' && id !== state.id) {
    log.debug(
      'REDUCER',
      'seems like an old action because the chatId changed in between'
    )
    return state
  }

  if (type === 'UI_UNSELECT_CHAT') {
    return { ...defaultState }
  } else if (type === 'MODIFIED_CHAT') {
    return { ...state, ...payload }
  }
  return state
})

chatStore.attachEffect(async ({ type, payload }, state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    // these methods were called in backend before
    // might be an issue if DeltaBackend.call has a significant delay
    const chat = <FullChat>(
      await DeltaBackend.call('chatList.selectChat', chatId)
    )
    chatStore.dispatch({
      type: 'SELECTED_CHAT',
      payload: {
        ...chat,
        id: chatId,
      },
    })
    mainProcessUpdateBadge()
    saveLastChatId(chatId)
  }
  if (type === 'JUMP_TO_MESSAGE') {
    const messageId = payload
    // these methods were called in backend before
    // might be an issue if DeltaBackend.call has a significant delay

    const message = await DeltaBackend.call('messageList.getMessage', messageId)

    let chat = {}

    if (state.id !== message.msg.chatId) {
      // switch To the required chat
      chat = await DeltaBackend.call('chatList.selectChat', message.msg.chatId)
    }

    chatStore.dispatch({
      type: 'SELECTED_CHAT',
      payload: {
        ...state,
        ...chat,
        jump_to_messageId: messageId,
      },
    })
    mainProcessUpdateBadge()
    saveLastChatId(message.msg.chatId)
  }
})

ipcBackend.on('DD_EVENT_CHAT_MODIFIED', (evt, payload) => {
  const { chatId, chat } = payload
  const state = chatStore.getState()
  if (state.id !== chatId) {
    return
  }
  chatStore.dispatch({
    type: 'MODIFIED_CHAT',
    payload: {
      profileImage: chat.profileImage,
      name: chat.name,
      subtitle: chat.subtitle,
      contacts: chat.contacts,
      selfInGroup: chat.selfInGroup,
      muted: chat.muted,
    },
  })
})

ipcBackend.on('DC_EVENT_MSG_DELIVERED', (evt, [id, msgId]) => {
  chatStore.dispatch({
    type: 'MESSAGE_DELIVERED',
    id,
    payload: msgId,
  })
})

ipcBackend.on('ClickOnNotification', (ev, { chatId }) => {
  selectChat(chatId)
})

export const useChatStore = () => useStore(chatStore)
export const useChatStore2 = () => {
  const [selectedChat, chatStoreDispatch] = useStore(chatStore)
  return { selectedChat, chatStoreDispatch }
}

export const selectChat = (chatId: number) =>
  chatStore.dispatch({ type: 'SELECT_CHAT', payload: chatId })

export default chatStore

export type ChatStoreDispatch = Store<state>['dispatch']
