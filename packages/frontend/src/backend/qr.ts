import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'

export type AccountQr = Extract<T.Qr, { kind: 'account' }>

export type VerifyContactQr = Extract<T.Qr, { kind: 'askVerifyContact' }>

export type VerifyGroupQr = Extract<T.Qr, { kind: 'askVerifyGroup' }>

export type JoinBroadcastQr = Extract<T.Qr, { kind: 'askJoinBroadcast' }>

export type LoginQr = Extract<T.Qr, { kind: 'login' }>

export type QrWithUrl<Q = T.Qr> = {
  qr: Q
  url: string
}

/**
 * Processes an unchecked string which was scanned from a QR code and returns
 * a parsed result when it was valid, throws an error if string is invalid.
 *
 * See list of supported DeltaChat URI-schemes here:
 * - https://github.com/deltachat/interface/blob/main/uri-schemes.md
 * - https://c.delta.chat/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c
 */
export async function processQr(
  accountId: number,
  url: string
): Promise<QrWithUrl> {
  const qr = await BackendRemote.rpc.checkQr(accountId, url)

  if (!qr) {
    throw new Error('Could not parse string')
  }

  return {
    qr,
    url,
  }
}
