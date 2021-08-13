import { MessageType } from './shared-types'

import { C } from 'deltachat-node/dist/constants'

export function getDirection({ fromId }: MessageType) {
  return fromId === C.DC_CONTACT_ID_SELF ? 'outgoing' : 'incoming'
}
