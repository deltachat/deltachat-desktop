import { DeltaBackend } from '../../delta-remote'
import chatStore from '../../stores/chat'
import { ScreenContext, unwrapContext } from '../../contexts'
import {
  ChatListItemType,
  JsonContact,
  FullChat,
  DCContact,
  BasicWebRTCOptions,
} from '../../../shared/shared-types'
import { MuteDuration } from '../../../shared/constants'
import { C } from 'deltachat-node/dist/constants'
import { runtime } from '../../runtime'

type Chat = ChatListItemType | FullChat

const unselectChat = () => {
  chatStore.dispatch({ type: 'UI_UNSELECT_CHAT' })
}

export async function setChatVisibility(
  chatId: number,
  visibility:
    | C.DC_CHAT_VISIBILITY_NORMAL
    | C.DC_CHAT_VISIBILITY_ARCHIVED
    | C.DC_CHAT_VISIBILITY_PINNED,
  shouldUnselectChat: boolean = false
) {
  await DeltaBackend.call('chat.setVisibility', chatId, visibility)
  if (shouldUnselectChat || visibility === C.DC_CHAT_VISIBILITY_ARCHIVED)
    unselectChat()
}

export function openLeaveChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  const tx = window.static_translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_leave_group'),
    confirmLabel: tx('menu_leave_group'),
    cb: (yes: boolean) => yes && DeltaBackend.call('chat.leaveGroup', chatId),
  })
}

export function openDeleteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chat: Chat
) {
  const tx = window.static_translate
  screenContext.openDialog('ConfirmationDialog', {
    message: tx('ask_delete_chat_desktop', chat.name),
    confirmLabel: tx('delete'),
    cb: (yes: boolean) =>
      yes && DeltaBackend.call('chat.delete', chat.id).then(unselectChat),
  })
}

export function openBlockContactDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  const tx = window.static_translate
  if (selectedChat && selectedChat.contactIds.length) {
    screenContext.openDialog('ConfirmationDialog', {
      message: tx('ask_block_contact'),
      confirmLabel: tx('menu_block_contact'),
      cb: (yes: boolean) =>
        yes &&
        DeltaBackend.call(
          'contacts.blockContact',
          selectedChat.contactIds[0]
        ).then(unselectChat),
    })
  }
}

export function openEncryptionInfoDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatListItem: ChatListItemType
) {
  screenContext.openDialog('EncryptionInfo', { chatListItem })
}

export function openEditGroupDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: FullChat
) {
  screenContext.openDialog('EditGroup', { chat: selectedChat })
}

export function openMapDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  selectedChat: Chat
) {
  screenContext.openDialog('MapDialog', { selectedChat })
}

export async function openViewProfileDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  contact_id: number
) {
  screenContext.openDialog('ViewProfile', {
    contact: await DeltaBackend.call('contacts.getContact', contact_id),
  })
}

export async function openMuteChatDialog(
  screenContext: unwrapContext<typeof ScreenContext>,
  chatId: number
) {
  // todo open dialog to ask for duration
  screenContext.openDialog('MuteChat', { chatId })
}

export async function unMuteChat(chatId: number) {
  await DeltaBackend.call('chat.setMuteDuration', chatId, MuteDuration.OFF)
}

export async function sendCallInvitation(chatId: number) {
  const roomname =
    Date.now() +
    '' +
    Math.random()
      .toString()
      .replace('.', '')
  const signalingServer = await DeltaBackend.call(
    'settings.getConfig',
    'basic_web_rtc_instance'
  )
  if (!signalingServer || signalingServer.length < 2) {
    throw new Error('No default signaling server was set')
  }
  const callUrl =
    '::CALL::' + signalingServer + `#roomname=${roomname}&camon=true`
  chatStore.dispatch({
    type: 'SEND_MESSAGE',
    payload: [chatId, callUrl, null],
  })
  await joinCall(callUrl)
}

/**
 *
 * @param rawCallURL expects the raw call url like its in the text message '::CALL::https://example.com/p2p#roomname=alpha&camon=true'
 */
export async function joinCall(rawCallURL: string) {
  // decode call url
  const callURL = rawCallURL.replace('::CALL::', '')
  const hastagPos = callURL.indexOf('#')
  const socketdomain = callURL.slice(0, hastagPos)
  const params = parseVars(callURL.slice(hastagPos + 1))

  // validate if everything is there
  if (!socketdomain || !params['roomname']) {
    throw new Error('Socketdomain or roomname missing')
  }

  const options: BasicWebRTCOptions = {
    socketdomain: btoa(socketdomain),
    base64domain: true,
    roomname: params['roomname'],
    camon: (params['camon'] && JSON.parse(params['camon'])) || false,
    username: encodeURIComponent(
      (await DeltaBackend.call('settings.getConfig', 'displayname')) ||
        (await DeltaBackend.call('settings.getConfig', 'addr')).split('@')[0]
    ),
  }

  runtime.openCallWindow(options)
}

const parseVars = (str: string) => {
  if (str.length <= 1) {
    return {}
  }
  const keyValuePairs = str.split('&')
  const res: { [key: string]: string } = {}
  for (let i = 0; i < keyValuePairs.length; i++) {
    const keyValuePair = keyValuePairs[i]
    const [key, value] = keyValuePair.split('=')
    res[key] = value
  }
  return res
}
