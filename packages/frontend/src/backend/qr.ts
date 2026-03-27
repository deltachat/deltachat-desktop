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
