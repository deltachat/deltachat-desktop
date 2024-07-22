export function truncateText(text: string, max_len: number) {
  if (text.length > max_len) {
    return text.slice(0, max_len) + '…'
  } else {
    return text
  }
}

export function isInviteLink(url: string) {
  return url.startsWith('https://i.delta.chat/') && url.includes('#')
}
