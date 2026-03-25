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
  return (
    url.toLowerCase().startsWith('https://i.delta.chat/') && url.includes('#')
  )
}

/**
 * Whether a potentially untrustworthy link,
 * coming from places such as WebXDC apps or HTML email viewer,
 * can and should be handled by the main app.
 * @see `useProcessQR`
 */
export function shouldHandleLinkInMainApp(url: string): boolean {
  return (
    url.startsWith('mailto:') ||
    url.startsWith('openpgp4fpr:') ||
    isInviteLink(url)
  )
}

/**
 * Like [Lodash `throttle`](https://lodash.com/docs/4.17.15#throttle)
 * with default options (`{ leading: true, trailing: true }`).
 */
export function throttle<R, A extends any[]>(
  fn: (...args: A) => R,
  wait: number
) {
  let inThrottle: boolean,
    timeout: ReturnType<typeof setTimeout>,
    lastTime: number
  const ret = (...args: A) => {
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
  ret.cancel = () => {
    clearTimeout(timeout)
  }
  return ret
}
