import { registerCustomProtocol } from 'linkifyjs'

/**
 * Delta Chat URI schemes that are rendered as links in messages.
 * Clicking them is handled by `useProcessQr`.
 * @see https://github.com/deltachat/interface/blob/main/uri-schemes.md
 */
export const deltachatSchemes = ['openpgp4fpr', 'dcaccount', 'dclogin']

export function registerDeltachatSchemes() {
  for (const scheme of deltachatSchemes) {
    // these URIs usually have no "//" after the scheme,
    // e.g. "dclogin:alice@example.org?p=…" or "dcaccount:https://…"
    registerCustomProtocol(scheme, true)
  }
}

// must happen before linkify tokenizes anything,
// as it builds its scanner only once
registerDeltachatSchemes()
