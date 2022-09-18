import { C } from 'deltachat-node/node/dist/constants'

export function getDirection({ fromId }: { fromId: number }) {
  return fromId === C.DC_CONTACT_ID_SELF ? 'outgoing' : 'incoming'
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

export function truncateText(text: string, max_len: number) {
  if (text.length > max_len) {
    return text.slice(0, max_len) + '…'
  } else {
    return text
  }
}
