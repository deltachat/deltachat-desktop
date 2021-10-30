import { ipcBackend, saveLastChatId } from '../ipc'
import { Store, useStore } from './store'
import { FullChat } from '../../shared/shared-types'
import { DeltaBackend } from '../delta-remote'
import { runtime } from '../runtime'
import { ActionEmitter, KeybindAction } from '../keybindings'
import {selectChat} from '../components/helpers/ChatMethods'

export const PAGE_SIZE = 10

class state {
  chat: FullChat | null = null
}

const defaultState = new state()

const chatStore = new Store<state>(new state(), 'ChatStore')
const log = chatStore.log

chatStore.attachReducer(({ type, payload, id }, state) => {
  if (type === 'SELECTED_CHAT') {
    return { ...defaultState, ...payload }
  }

  if (typeof id !== 'undefined' && id !== state.chat?.id) {
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

chatStore.attachEffect(async ({ type, payload }, _state) => {
  if (type === 'SELECT_CHAT') {
    const chatId = payload
    // these methods were called in backend before
    // might be an issue if DeltaBackend.call has a significant delay
    const chat = <FullChat>(
      await DeltaBackend.call('chatList.selectChat', chatId)
    )
    if (chat.id === null) {
      log.debug(
        'SELECT CHAT chat does not exsits, id is null. chatId:',
        chat.id
      )
      return
    }
    chatStore.dispatch({
      type: 'SELECTED_CHAT',
      payload: {
        chat,
        id: chatId,
      } as Partial<state>,
    })
    ActionEmitter.emitAction(
      chat.archived
        ? KeybindAction.ChatList_SwitchToArchiveView
        : KeybindAction.ChatList_SwitchToNormalView
    )
    runtime.updateBadge()
    saveLastChatId(chatId)
  } else if (type === 'MUTE') {
    if (payload[0] !== chatStore.state.chat?.id) return
    if (
      !(await DeltaBackend.call('chat.setMuteDuration', payload[0], payload[1]))
    ) {
      return
    }
  }
})

ipcBackend.on('ClickOnNotification', (_ev, { chatId }) => {
  selectChat(chatId)
})

export const useChatStore = () => useStore(chatStore)
export const useChatStore2 = () => {
  const [selectedChat, chatStoreDispatch] = useStore(chatStore)
  return { selectedChat, chatStoreDispatch }
}

export default chatStore

export type ChatStoreDispatch = Store<state>['dispatch']

export type ChatStoreState = {
  chat: FullChat | null
}


export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>
