import { BrowserWindow, screen } from 'electron'

/** set min window dimensions, or turns them off on screens smaller than the min dimensions
 *
 * @returns function to remove the listeners again
 */
export function initMinWinDimensionHandling(
  main_window: BrowserWindow,
  minWidth: number,
  minHeight: number
): () => void {
  const update_min_size = () => {
    const { workAreaSize } = screen.getPrimaryDisplay()
    if (
      // A multiplier to make space for the taskbar and the window header.
      // Remember that the taskbar could also be placed vertically.
      workAreaSize.width * 0.75 < minWidth ||
      workAreaSize.height * 0.75 < minHeight
    ) {
      main_window.setMinimumSize(0, 0)
    } else {
      main_window.setMinimumSize(minWidth, minHeight)
    }
  }
  screen.addListener('display-added', update_min_size)
  screen.addListener('display-metrics-changed', update_min_size)
  screen.addListener('display-removed', update_min_size)
  update_min_size()
  return () => {
    screen.removeListener('display-added', update_min_size)
    screen.removeListener('display-metrics-changed', update_min_size)
    screen.removeListener('display-removed', update_min_size)
  }
}
