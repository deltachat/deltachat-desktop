import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'

export type QrWithUrl = {
  qr: T.Qr
  url: string
}

/**
 * Processes an unchecked string which was scanned from a QR code and returns
 * a parsed result when it was valid, throws an error if string is invalid.
 *
 * See list of supported DeltaChat URI-schemes here:
 * - https://github.com/deltachat/interface/blob/master/uri-schemes.md
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
