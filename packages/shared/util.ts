export function truncateText(text: string, max_len: number) {
  if (text.length > max_len) {
    return text.slice(0, max_len) + '…'
  } else {
    return text
  }
}

/**
 * @returns Whether the `url` is a contact or a group invite link.
 * (https://github.com/deltachat/invite/blob/1b5b2e2a9bfcaf87c4f44929fb7734819d1d9679/README.md?plain=1#L6-L7)
 */
export function isInviteLink(url: string) {
  return url.startsWith('https://i.delta.chat/') && url.includes('#')
}
