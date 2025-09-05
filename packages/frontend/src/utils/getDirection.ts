import { C } from '@deltachat/jsonrpc-client'

// TODO: move to frontend
/*
 * For a given contact ID, is the message to this account or to another account?
 * In other words, for a given contact ID, is it id of self or another contact?
 *
 * @return "outgoing" | "incoming"
  */
export function getDirection({ fromId }: { fromId: number }): "outgoing" | "incoming" {
  return fromId === C.DC_CONTACT_ID_SELF ? 'outgoing' : 'incoming'
}
