import { Store, useStore } from './store'
import { ActionEmitter, KeybindAction } from '../keybindings'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { debouncedUpdateBadgeCounter } from '../system-integration/badge-counter'
import { clearNotificationsForChat } from '../system-integration/notifications'
import { saveLastChatId } from './chat/chat_sideeffects'
import { onReady } from '../onready'
import { C } from '@deltachat/jsonrpc-client'

export const PAGE_SIZE = 11

export enum ChatView {
  MessageList,
  Media,
  Map,
}
export interface ChatStoreState {
  activeView: ChatView
  accountId: number | null
  chat: Type.FullChat | null
}

const defaultState: () => ChatStoreState = () => ({
  activeView: ChatView.MessageList,
  accountId: null,
  chat: null,
})

class ChatStore extends Store<ChatStoreState> {
  guardReducerIfChatIdIsDifferent(payload: { id: number }) {
    if (
      typeof payload.id !== 'undefined' &&
      payload.id !== this.state.chat?.id
    ) {
      log.debug(
        'REDUCER',
        'seems like an old action because the chatId changed in between'
      )
      return true
    }
    return false
  }
  reducer = {
    setView: (view: ChatView) => {
      this.setState(prev => {
        const modifiedState: ChatStoreState = {
          ...prev,
          activeView: view,
        }
        return modifiedState
      }, 'setChatView')
    },
    selectedChat: (payload: Partial<ChatStoreState>) => {
      this.setState(_ => {
        const modifiedState: ChatStoreState = {
          ...defaultState(),
          ...payload,
        }
        return modifiedState
      }, 'selectedChat')
    },
    unselectChat: () => {
      this.setState(_ => {
        const modifiedState: ChatStoreState = { ...defaultState() }
        return modifiedState
      }, 'unselectChat')
    },
    modifiedChat: (payload: { id: number } & Partial<ChatStoreState>) => {
      this.setState(state => {
        const modifiedState: ChatStoreState = {
          ...state,
          ...payload,
        }
        if (this.guardReducerIfChatIdIsDifferent(payload)) return
        return modifiedState
      }, 'modifiedChat')
    },
    modifiedEphemeralTimer: (id: number, timer: number) => {
      this.setState(state => {
        if (!state.chat) {
          return
        }
        const modifiedState: ChatStoreState = {
          ...state,
          chat: { ...state.chat, ephemeralTimer: timer },
        }
        if (this.guardReducerIfChatIdIsDifferent({ id })) return
        return modifiedState
      }, 'modifiedChat')
    },
  }

  effect = {
    setView: (view: ChatView) => {
      this.reducer.setView(view)
    },
    selectChat: async (chatId: number) => {
      const accountId = selectedAccountId()
      const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
      if (chat.id === null) {
        log.debug(
          'SELECT CHAT chat does not exist, id is null. chatId:',
          chat.id
        )
        return
      }

      BackendRemote.rpc.marknoticedChat(accountId, chatId)
      debouncedUpdateBadgeCounter()
      clearNotificationsForChat(accountId, chatId)
      saveLastChatId(chatId)

      ActionEmitter.emitAction(
        chat.archived
          ? KeybindAction.ChatList_SwitchToArchiveView
          : KeybindAction.ChatList_SwitchToNormalView
      )
      if (this.state.chat?.id === chatId) {
        // jump down if reselecting the same chat
        window.__internal_jump_to_message?.(undefined, false, undefined)
      } else {
        this.reducer.selectedChat({
          chat,
          accountId,
        })
      }
    },

    jumpToMessage: async (
      msgId: number,
      highlight = true,
      msgParentId?: number
    ) => {
      log.debug('jumpToMessage with messageId: ', msgId)
      const accountId = selectedAccountId()

      // check if jump to message is in same chat, if not switch
      const message = await BackendRemote.rpc.getMessage(
        accountId,
        msgId as number
      )

      if (
        message.chatId !== this.state.chat?.id ||
        this.state.accountId !== accountId
      ) {
        const chat = await BackendRemote.rpc.getFullChatById(
          accountId,
          message.chatId
        )
        if (chat.id === null) {
          log.debug(
            'SELECT CHAT chat does not exist, id is null. chatId:',
            chat.id
          )
          return
        }

        await this.effect.selectChat(chat.id)
      }

      if (this.state.activeView !== ChatView.MessageList) {
        this.reducer.setView(ChatView.MessageList)
      }

      setTimeout(() => {
        // jump to message
        window.__internal_jump_to_message?.(msgId, highlight, msgParentId)
      }, 0)
    },

    mute: async (payload: {
      chatId: number
      muteDuration: Type.MuteDuration
    }) => {
      if (payload.chatId !== this.state.chat?.id) return

      await BackendRemote.rpc.setChatMuteDuration(
        selectedAccountId(),
        payload.chatId,
        payload.muteDuration
      )
    },
    onEventChatModified: async (chatId: number) => {
      if (this.state.chat?.id !== chatId) {
        return
      }
      if (!this.state.accountId) {
        throw new Error('no account set')
      }
      this.reducer.modifiedChat({
        id: chatId,
        chat: await BackendRemote.rpc.getFullChatById(
          this.state.accountId,
          chatId
        ),
      })
    },
    onEventChatEphemeralTimerModified: (chatId: number, timer: number) => {
      if (this.state.chat?.id !== chatId) {
        return
      }
      if (!this.state.accountId) {
        throw new Error('no account set')
      }
      this.reducer.modifiedEphemeralTimer(chatId, timer)
    },
    onEventContactModified: async (contactId: number) => {
      if (!this.state.chat) {
        return
      }
      if (!this.state.accountId) {
        throw new Error('no account set')
      }
      if (this.state.chat.contactIds.includes(contactId)) {
        this.reducer.modifiedChat({
          id: this.state.chat.id,
          chat: await BackendRemote.rpc.getFullChatById(
            this.state.accountId,
            this.state.chat.id
          ),
        })
      }
    },
    onEventContactsChanged: async (contactId: number) => {
      if (!this.state.accountId) {
        throw new Error('no account set')
      }
      if (!this.state.chat) {
        return
      }
      const chatId = this.state.chat.id
      if (this.state.chat.chatType === C.DC_CHAT_TYPE_SINGLE) {
        if (this.state.chat.contactIds.includes(contactId)) {
          // would be better if contact change would also send a chat modified event for the DM chats
          this.reducer.modifiedChat({
            id: chatId,
            chat: await BackendRemote.rpc.getFullChatById(
              this.state.accountId,
              chatId
            ),
          })
        }
      }
    },
  }

  stateToHumanReadable(state: ChatStoreState): any {
    return {
      ...state,
    }
  }
}

const chatStore = new ChatStore({ ...defaultState() }, 'ChatStore')

chatStore.dispatch = (..._args) => {
  throw new Error('Deprecated')
}

const log = chatStore.log

export const useChatStore = () => useStore(chatStore)[0]
export const useChatStore2 = () => {
  const [selectedChat, _chatStoreDispatch] = useStore(chatStore)
  return { selectedChat }
}

export default chatStore
window.__chatStore = chatStore

export type ChatStoreDispatch = Store<ChatStoreState>['dispatch']

export type ChatStoreStateWithChatSet = {
  chat: NonNullable<ChatStoreState['chat']>
} & Exclude<ChatStoreState, 'chat'>

onReady(() => {
  BackendRemote.on('ChatModified', (accountId, { chatId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    chatStore.effect.onEventChatModified(chatId)
  })
  BackendRemote.on('ContactsChanged', (accountId, { contactId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    if (contactId) {
      chatStore.effect.onEventContactModified(contactId)
    }
  })
  BackendRemote.on(
    'ChatEphemeralTimerModified',
    (accountId, { chatId, timer }) => {
      if (accountId !== window.__selectedAccountId) {
        return
      }
      chatStore.effect.onEventChatEphemeralTimerModified(chatId, timer)
    }
  )
  BackendRemote.on('ContactsChanged', (accountId, { contactId }) => {
    if (accountId !== window.__selectedAccountId) {
      return
    }
    if (contactId !== null) {
      chatStore.effect.onEventContactsChanged(contactId)
    }
  })
})
