import type { QrWithUrl } from '../../../backend/qr'

// URL to list of various other chatmail instances
// @TODO: Insert correct URL
export const CHATMAIL_INSTANCES_LIST_URL = 'https://delta.chat'

export const DEFAULT_CHATMAIL_INSTANCE = 'nine.testrun.org'

// URL to privacy policy of default DeltaChat Chatmail instance
// @TODO: Insert correct URL
export const DEFAULT_INSTANCE_PRIVACY_POLICY_URL = 'https://delta.chat/'

export function isDefaultInstance(value: string): boolean {
  return value.includes(DEFAULT_CHATMAIL_INSTANCE)
}

export function isQRWithDefaultInstance(qrWithUrl?: QrWithUrl): boolean {
  if (qrWithUrl && qrWithUrl.qr.kind === 'account') {
    return isDefaultInstance(qrWithUrl.qr.domain)
  }

  return true
}
