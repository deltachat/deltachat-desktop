const countCalls: { [key: string]: number } = {}
export function countCall(label: string) {
  if (countCalls[label]) {
    countCalls[label]++
  } else {
    countCalls[label] = 1
  }
}
export function printCallCounterResult() {
  console.table(countCalls)
}

/** Visualize drag/no-drag regions for debuging.
 * This is important because on MacOS there is no window title bar,
 * so the navbar and other elements need to take that role to make the window dragable.
 * But whats draggable is not clickable, so buttons need to be excluded.
 *
 * See https://github.com/deltachat/deltachat-desktop/issues/4018 to get an idea why this is important to get right.
 */
export class DragRegionOverlay {
  debugDragAreaActive: boolean = false
  debugDragAreaUpdateInterval: ReturnType<typeof setInterval> | null
  toggle() {
    let element: HTMLCanvasElement | undefined = document.getElementById(
      'drag-area-visualisation'
    ) as HTMLCanvasElement
    if (!element) {
      element = document.createElement('canvas')
      element.height = window.visualViewport.height
      element.width = window.visualViewport.width
      element.id = 'drag-area-visualisation'
      element.popover = 'manual'
      document.body.append(element)
    }

    if (this.debugDragAreaActive) {
      element.hidePopover()
      clearInterval(this.debugDragAreaUpdateInterval)
      this.debugDragAreaUpdateInterval = null
      this.debugDragAreaActive = false
    } else {
      element.showPopover()
      const drawing = element.getContext('2d')
      drawing.translate(0.5, 0.5)
      this.debugDragAreaUpdateInterval = setInterval(() => {
        element.height = window.visualViewport.height
        element.width = window.visualViewport.width
        // hack to make it show on top of dialogs
        element.hidePopover()
        element.showPopover()

        const { height, width } = element.getBoundingClientRect()
        drawing.clearRect(0, 0, width, height)

        function drawElement(rect: DOMRect | undefined, color: string) {
          if (!rect) {
            return
          }
          drawing.fillStyle = color
          drawing.fillRect(rect.x, rect.y, rect.width, rect.height)
        }

        function traverseDOMRecursively(element: HTMLElement) {
          // element.computedStyleMap
          const styles = window.getComputedStyle(element)

          //@ts-ignore
          const role = styles.webkitAppRegion

          if (role !== 'none') {
            const boundingRect = element.getClientRects()[0]
            if (role === 'no-drag') {
              drawElement(boundingRect, 'green')
            } else if (role === 'drag') {
              drawElement(boundingRect, 'red')
            }
            drawing.moveTo(0, 0)
          }

          for (const child of element.children) {
            if (child instanceof HTMLElement) {
              traverseDOMRecursively(child)
            }
          }
        }

        traverseDOMRecursively(document.documentElement)
      }, 50)
      this.debugDragAreaActive = true
    }
  }
}
