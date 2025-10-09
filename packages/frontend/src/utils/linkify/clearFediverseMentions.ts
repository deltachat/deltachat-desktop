import * as linkify from 'linkifyjs'
/**
 * Do not render fediverse mentions like  @user@domain.tld as email addresses
 *
 * this is a workaround for https://github.com/nfrasser/linkifyjs/issues/476
 */
export function clearFediverseMentions(
  elements: linkify.MultiToken[]
): linkify.MultiToken[] {
  const result: linkify.MultiToken[] = []

  for (let i = 0; i < elements.length; i++) {
    const lastTokenIsAtSign = (token: linkify.MultiToken['tk']) =>
      token.length > 0 && token[token.length - 1].v === '@'
    if (
      i + 1 < elements.length &&
      elements[i].t === 'text' &&
      elements[i + 1].t === 'email' &&
      lastTokenIsAtSign(elements[i].tk || [])
    ) {
      // Combine the elements into one text element
      const combinedValue = `${elements[i].v}${elements[i + 1].v}`

      // Extend the text element with the content of the email element
      const combinedElement = {
        ...elements[i],
        v: combinedValue,
        tk: [...(elements[i].tk || []), ...(elements[i + 1].tk || [])],
      } as linkify.MultiToken

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
