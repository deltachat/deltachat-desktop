const INVITE_URL_HOST = 'i.delta.chat'

/** Converts an invite QR code to an HTTP invite URL */
export function qrCodeToInviteUrl(qrData: string): string {
  // We only want to replace the first match, passing a string literal
  // into JavaScript's `replace` does exactly that
  const code = qrData.split(':', 2)[1].replace('#', '&')
  return `https://${INVITE_URL_HOST}/#${code}`
}
