import type { QrWithUrl } from '../../../backend/qr'

// URL to list of various other chatmail instances
export const CHATMAIL_INSTANCES_LIST_URL = 'https://delta.chat/chatmail'

// Hostname of the default chatmail instance
export const DEFAULT_CHATMAIL_HOSTNAME = 'nine.testrun.org'

// Full URL for the default chatmail instance, used in DCACCOUNT QR codes
export const DEFAULT_CHATMAIL_QR_URL = `https://${DEFAULT_CHATMAIL_HOSTNAME}/cgi-bin/newemail.py`

// URL to privacy policy of default DeltaChat Chatmail instance
export const DEFAULT_INSTANCE_PRIVACY_POLICY_URL = `https://${DEFAULT_CHATMAIL_HOSTNAME}/privacy.html`

export function isDefaultInstance(value: string): boolean {
  return value.includes(DEFAULT_CHATMAIL_HOSTNAME)
}

export function isQRWithDefaultInstance(qrWithUrl?: QrWithUrl): boolean {
  if (qrWithUrl && qrWithUrl.qr.kind === 'account') {
    return isDefaultInstance(qrWithUrl.qr.domain)
  }

  return true
}
