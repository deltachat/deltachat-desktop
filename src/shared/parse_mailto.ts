export function parseMailto(mailtoURL: string): {
  to?: string | null
  subject?: string
  body?: string
} {
  const mailto_url = new URL(mailtoURL)

  if (mailto_url.protocol.toLowerCase() !== 'mailto:') {
    throw new Error(
      "not a mailto link, doesn't start with 'mailto:': " + mailtoURL
    )
  }

  const query: URLSearchParams = mailto_url.searchParams
  const address = mailto_url.pathname || query.get('to') || null

  return {
    to: address && decodeURIComponent(address).trim(),
    subject: query.get('subject') || undefined,
    body: query.get('body') || undefined,
  }
}
