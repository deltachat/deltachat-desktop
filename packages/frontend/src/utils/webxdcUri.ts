const WEBXDC_URI_REGEX = /^dcwebxdc:(\d+)\/(\d+)\/?$/i

/**
 * Parses a `dcwebxdc:<accountId>/<msgId>` URI,
 * which is used e.g. by desktop shortcuts to open a webxdc app directly.
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
