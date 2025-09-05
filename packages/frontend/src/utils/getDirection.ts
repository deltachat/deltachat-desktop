import { C } from '@deltachat/jsonrpc-client'

// TODO: move to frontend
/*
 * Is this a message that we sent out, or someone sent to us?
 */
export function getDirection({
  fromId,
}: {
  fromId: number
}): 'outgoing' | 'incoming' {
  return fromId === C.DC_CONTACT_ID_SELF ? 'outgoing' : 'incoming'
}
