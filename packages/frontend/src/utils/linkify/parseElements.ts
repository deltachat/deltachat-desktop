import * as linkify from 'linkifyjs'

/**
 * Parse message text using linkify and filter elements if needed
 *
 * @param message - The message text to parse
 * @returns Array of parsed elements or null if parsing fails
 * @throws maybe, if parsing failed. We don't expect it,
 * but must handle it gracefully.
 */
export function parseElements(message: string): linkify.MultiToken[] {
  return linkify.tokenize(message).map(element => {
    if (element.t === 'botcommand') {
      const start = element.startIndex()
      // do not render botcommands if they
      // not start at index 0 or after a space
      if (start > 0 && !/\s/.test(message[start - 1])) {
        element.t = 'text'
      }
    }
    // here we could also disable email links in fediverse mentions
    // or hashtags that have no preceeding space
    return element
  })
}
