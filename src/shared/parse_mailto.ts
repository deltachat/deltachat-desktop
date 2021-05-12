import UrlParser from 'url-parse'

export function parseMailto(
  mailtoURL: string
): { to?: string; subject?: string; body?: string } {
  const mailto_url = UrlParser(mailtoURL)

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
  } = UrlParser.qs.parse(
    (mailto_url.query as any) as string /* typings package is old and doesn't reflect reality*/
  )

  const address = mailto_url.pathname || query.to || null

  return {
    to: address,
    subject: query.subject,
    body: query.body,
  }
}
