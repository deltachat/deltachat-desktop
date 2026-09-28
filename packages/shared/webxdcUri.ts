const WEBXDC_URI_REGEX = /^dcwebxdc:(\d+)\/(\d+)\/?$/i

/**
 * Link that opens a webxdc app directly,
 * e.g. from a desktop shortcut created by the webxdc window's menu.
 * The ids are local, so it only works on this device and in this profile.
 */
export function getWebxdcUri(accountId: number, msgId: number): string {
  return `dcwebxdc:${accountId}/${msgId}`
}

/**
 * Parses a `dcwebxdc:<accountId>/<msgId>` URI, see {@link getWebxdcUri}.
 * Returns `null` if `uri` is not such a URI.
 */
export function parseWebxdcUri(
  uri: string
): { accountId: number; msgId: number } | null {
  const match = WEBXDC_URI_REGEX.exec(uri.trim())
  if (!match) {
    return null
  }
  return { accountId: Number(match[1]), msgId: Number(match[2]) }
}
