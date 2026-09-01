import type * as linkify from 'linkifyjs'

export type PunycodeWarning = {
  original_hostname_or_full_url: string
  ascii_hostname: string
  punycode_encoded_url: string
}

export type LinkDestination = {
  target: string
  hostname: null | string
  punycode: null | PunycodeWarning
  scheme: null | string
  linkText?: string
}

function stripLastSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

/**
 * Turn a linkify `url` token into the destination of a link.
 *
 * @returns `null` if the token is not a parsable URL, in which case it should
 * be rendered as plain text instead of as a link.
 */
export function getLinkDestination(
  elm: linkify.MultiToken
): LinkDestination | null {
  // linkifyJS does even identify URLs without scheme as URL, e.g.
  // "www.example.com" or "example.com/test" or "example.com?param=value" etc.
  // It does only identify valid TLDs based on
  // https://data.iana.org/TLD/tlds-alpha-by-domain.txt
  //
  // `toHref` adds the given scheme to those, and leaves URLs that already have
  // one untouched, including custom protocols like "mailto:" that have a
  // `SCHEME` instead of a `SLASH_SCHEME` token.

  const fullUrl = elm.toHref('https')

  const url = URL.parse(fullUrl)
  if (url == null) {
    return null
  }

  // according to https://developer.mozilla.org/docs/Web/API/URL/hostname
  // domain names will be transformed to punycode automatically
  // so we just need to check if the original hostname is different
  // from the punycode one
  const suspicousUrl = stripLastSlash(url.href) !== stripLastSlash(fullUrl)

  return {
    target: fullUrl,
    hostname: url.hostname,
    punycode: suspicousUrl
      ? {
          ascii_hostname: url.hostname,
          punycode_encoded_url: url.href,
          original_hostname_or_full_url: elm.v,
        }
      : null,
    scheme: url.protocol.replace(':', ''),
    linkText: elm.v,
  }
}
