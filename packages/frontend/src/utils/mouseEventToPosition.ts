/**
 * This function is useful for opening a context menu (or something alike)
 * with a 'click' event instead of 'contextmenu event.
 *
 * The 'click' event might not have `clientX` and `clientY` set
 * if it was activated with the keyboard (or via other means?).
 * FYI it is not the case for 'contextmenu' event where
 * `clientY` and `clientX` are already set to the center of the element,
 * at least in Chromium.
 */
export function mouseEventToPosition(event: React.MouseEvent): {
  x: number
  y: number
} {
  if (event.clientX > 0 && event.clientY > 0) {
    return {
      x: event.clientX,
      y: event.clientY,
    }
  }

  const boundingBox = (event.target as HTMLElement).getBoundingClientRect()
  return {
    // The middle of the element
    x: boundingBox.x + boundingBox.width / 2,
    y: boundingBox.y + boundingBox.height / 2,
  }
}
