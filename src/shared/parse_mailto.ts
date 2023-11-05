export function parseMailto(
  mailtoURL: string
): { to?: string | null; subject?: string; body?: string } {
  const mailto_url = new URL(mailtoURL)

  if (mailto_url.protocol.toLowerCase() !== 'mailto:') {
    throw new Error(
      "not a mailto link, doesn't start with 'mailto:': " + mailtoURL
    )
  }

  const query: {
    to?: string
    subject?: string
    body?: string
    cc?: string
    bcc?: string
  } = mailto_url.searchParams as any
  const address = mailto_url.pathname || query.to || null

  return {
    to: address && decodeURIComponent(address).trim(),
    subject: query.subject,
    body: query.body,
  }
}
