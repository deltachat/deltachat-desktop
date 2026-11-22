export function throttleWhilePageHidden(fn: () => void) {
  const invokeIfVisible = () => {
    if (document.visibilityState !== 'visible') {
      return
    }

    document.removeEventListener('visibilitychange', invokeIfVisible)
    fn()
  }

  const ret = () => {
    if (document.visibilityState === 'visible') {
      fn()
      return
    }

    document.addEventListener('visibilitychange', invokeIfVisible)
  }
  ret.cancel = () => {
    document.removeEventListener('visibilitychange', invokeIfVisible)
  }

  return ret
}
