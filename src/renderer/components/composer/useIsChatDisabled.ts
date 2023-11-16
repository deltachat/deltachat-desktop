import { T, C } from '@deltachat/jsonrpc-client'

export enum DisabledChatReasons {
  DEADDROP,
  DEVICE_CHAT,
  MAILING_LIST,
  NOT_IN_GROUP,
}

export default function useIsChatDisabled(
  chat: Pick<
    T.FullChat,
    'isContactRequest' | 'isDeviceChat' | 'chatType' | 'selfInGroup' | 'canSend'
  >
): [isDisabled: boolean, disabledReason?: DisabledChatReasons] {
  if (chat.canSend) {
    return [false, undefined]
  }

  if (chat.isContactRequest) {
    return [true, DisabledChatReasons.DEADDROP]
  } else if (chat.isDeviceChat) {
    return [true, DisabledChatReasons.DEVICE_CHAT]
  } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
    return [true, DisabledChatReasons.MAILING_LIST]
  } else if (chat.chatType === C.DC_CHAT_TYPE_GROUP && !chat.selfInGroup) {
    return [true, DisabledChatReasons.NOT_IN_GROUP]
  }

  throw new Error(
    'Could not determine read-only state of chat due to invalid chat information'
  )
}
