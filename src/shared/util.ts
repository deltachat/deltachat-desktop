import { MessageType, FullChat } from './shared-types'

import { C } from 'deltachat-node/dist/constants'

export function getDirection({ fromId }: MessageType) {
  return fromId === C.DC_CONTACT_ID_SELF ? 'outgoing' : 'incoming'
}

export function isChatReadonly(
  chat: Pick<
    FullChat,
    'isContactRequest' | 'isDeviceChat' | 'type' | 'isGroup' | 'selfInGroup'
  >
): [boolean, string] {
  if (chat.isContactRequest) {
    return [true, 'messaging_disabled_deaddrop']
  } else if (chat.isDeviceChat === true) {
    return [true, 'messaging_disabled_device_chat']
  } else if (chat.type === C.DC_CHAT_TYPE_MAILINGLIST) {
    return [true, 'messaging_disabled_mailing_list']
  } else if (chat.isGroup && !chat.selfInGroup) {
    return [true, 'messaging_disabled_not_in_group']
  } else {
    return [false, '']
  }
}

/** wraps a callback so that `event.preventDefault()` is called before it */
export function preventDefault<EventType extends React.SyntheticEvent | Event>(
  callback: Function
) {
  const wrapper = (cb: Function, ev: EventType) => {
    ev.preventDefault()
    cb()
  }
  return wrapper.bind(null, callback)
}
