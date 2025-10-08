import { type customMultiToken } from '../../components/message/MessageParser.js'
/**
 * Find Fediverse addresses of 2 elements where the first is
 * of type 'text' and ends with "@" and the second is an email address:
 * @user@server.tld
 *
 * this is a workaround for https://github.com/nfrasser/linkifyjs/issues/476
 */
export function convertFediverseMentions(
  elements: customMultiToken[]
): customMultiToken[] {
  const result: customMultiToken[] = []

  for (let i = 0; i < elements.length; i++) {
    const lastTokenIsAtSign = (token: customMultiToken['tk']) =>
      // TBD: should we allow any token before the @ sign?
      token.length > 0 && token[token.length - 1].v === '@'
    // Check if we have a sequence: @mail@url which is parsed as text + email
    if (
      i + 1 < elements.length &&
      elements[i].t === 'text' &&
      elements[i + 1].t === 'email' &&
      lastTokenIsAtSign(elements[i].tk || [])
    ) {
      // Split the email address into name and domain
      const [name, url] = elements[i + 1].v.split('@')
      // Combine the elements into one url element
      const combinedValue = `${url}/@${name}`

      const firstElementWithoutAt = { ...elements[i] } as customMultiToken
      if (firstElementWithoutAt.v.trim() !== '@') {
        // Remove the trailing @ from the first element
        firstElementWithoutAt.v = firstElementWithoutAt.v.replace(/@+$/, '')
        firstElementWithoutAt.tk = (firstElementWithoutAt.tk || []).slice(0, -1)
        result.push(firstElementWithoutAt)
      }
      // Create a new url element
      const combinedElement = {
        ...elements[i],
        t: 'url',
        v: combinedValue,
        initialText: '@' + elements[i + 1].v,
        tk: [...(elements[i].tk || []), ...(elements[i + 1].tk || [])],
      } as customMultiToken

      result.push(combinedElement)
      // Skip the next element as it's already processed
      i += 1
    } else {
      // Add the element as-is
      result.push(elements[i])
    }
  }

  return result
}
