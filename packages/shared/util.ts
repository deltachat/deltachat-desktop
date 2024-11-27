export function truncateText(text: string, max_len: number) {
  if (text.length > max_len) {
    return text.slice(0, max_len) + '…'
  } else {
    return text
  }
}

/**
 * @returns Whether the `url` is an invite link (for contact or a group).
 * - https://github.com/deltachat/invite
 * - https://github.com/deltachat/interface/blob/main/uri-schemes.md#invite-links-httpsideltachat-
 */
export function isInviteLink(url: string) {
  return url.startsWith('https://i.delta.chat/') && url.includes('#')
}

export function throttle<R, A extends any[]>(
  fn: (...args: A) => R,
  wait: number
) {
  let inThrottle: boolean,
    timeout: ReturnType<typeof setTimeout>,
    lastTime: number
  return (...args: A) => {
    if (!inThrottle) {
      fn(...args)
      lastTime = performance.now()
      inThrottle = true
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(
        () => {
          fn(...args)
          lastTime = performance.now()
        },
        Math.max(wait - (performance.now() - lastTime), 0)
      )
    }
  }
}
