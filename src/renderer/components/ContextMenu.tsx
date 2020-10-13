import React, { useState, useEffect, useLayoutEffect, useContext } from 'react'
import { useRef } from 'react'
import { ScreenContext, unwrapContext } from '../contexts'

export type ContextMenuItem = { label: string; action: () => void }

type showFnArguments = {
  cursorX: number
  cursorY: number
  items: ContextMenuItem[]
}

export type showFnType = (args: showFnArguments) => void

/**
 * character count that is considdered to fill a line, used to estimate linebreaks
 * might depend on fontsize and font-family
 * */
const overFlowLineCharacterCount = 19

const ScrollKeysToBlock = ['Space', 'PageUp', 'PageDown', 'End', 'Home']

export function ContextMenuLayer({
  setShowFunction,
}: {
  setShowFunction: (showFn: showFnType) => void
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [currentItems, setCurrentItems] = useState<ContextMenuItem[]>([])
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  function show({ cursorX, cursorY, items: rawItems }: showFnArguments) {
    if (!layerRef.current) {
      throw new Error('Somehow the ContextMenuLayer went missing')
    }
    // Filter out empty null items
    // (can happen when constructing the array with inline conditions,
    // look at the chatlistitem context menu for an example)
    const items = rawItems.filter(item => !!item)
    // Get required information
    var style = window.getComputedStyle(layerRef.current)

    const getValue = (key: string) =>
      Number(style.getPropertyValue(key).replace('px', ''))

    const ContextMenuWidth = getValue('--local-menu-width')
    const ContextMenuItemLineHeight = getValue('--local-menu-item-Line-height')
    const ContextMenuItemVerticalMargin = getValue(
      '--local-menu-item-vertical-padding'
    )
    // the margin that the context menu should have to the window border
    const BorderMargin = getValue('--local-border-clearance')

    const ContextMenuItemHeight =
      ContextMenuItemVerticalMargin * 2 + ContextMenuItemLineHeight

    const space = {
      height: getValue('height'),
      width: getValue('width'),
    }
    const [x, y] = [cursorX, cursorY]

    let overflowingLines = estimateOverflowingLines(items)

    const menu = {
      height:
        items.length * ContextMenuItemHeight +
        overflowingLines * ContextMenuItemLineHeight,
      width: ContextMenuWidth,
    }

    // Finding Orientation
    let top = 0,
      left = 0

    // Right or Left
    if (x + menu.width + BorderMargin <= space.width) {
      // Right
      left = x
    } else {
      // Left
      left = x - menu.width
    }

    // Bottom or Top
    if (y + menu.height + BorderMargin <= space.height) {
      // Bottom
      top = y
    } else {
      // Top
      top = y - menu.height
    }

    // Displaying Menu
    setPosition({ top, left })
    setCurrentItems(items)
    window.__contextMenuActive = true
    setActive(true)
  }

  function cancel() {
    window.__contextMenuActive = false
    setActive(false)
    setCurrentItems([])
  }

  useEffect(() => {
    if (typeof setShowFunction === 'function') setShowFunction(show)
  }, [setShowFunction])

  return (
    <div
      ref={layerRef}
      className={`dc-context-menu-layer ${active ? 'active' : ''}`}
      onClick={cancel}
    >
      {active && currentItems.length > 0 && (
        <ContextMenu
          top={position.top}
          left={position.left}
          items={currentItems}
          closeCallback={cancel}
        />
      )}
    </div>
  )
}

/**
 * line Overflow detection
 *
 * detect if labels overflow the lines and estimate the overflow
 *  */
function estimateOverflowingLines(items: ContextMenuItem[]) {
  let overflowingLines = 0
  for (let { label } of items) {
    if (label.length > overFlowLineCharacterCount) {
      let words = label.split(' '),
        currentLength = 0,
        overSize = 0
      for (let word of words) {
        if (currentLength + word.length > overFlowLineCharacterCount) {
          overSize++
          currentLength = word.length
        } else {
          currentLength += word.length
        }
        if (currentLength >= overFlowLineCharacterCount) {
          currentLength -= overFlowLineCharacterCount
          overSize++
        }
      }
      overflowingLines += overSize
    }
  }
  return overflowingLines
}

export function ContextMenu(props: {
  top: number
  left: number
  items: ContextMenuItem[]
  closeCallback: () => void
}) {
  useLayoutEffect(() => {
    document.querySelector<HTMLDivElement>('div.dc-context-menu')?.focus()
  })

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      const parent = document.querySelector<HTMLDivElement>(
        'div.dc-context-menu'
      )
      const current = parent?.querySelector(':focus')

      if (ev.key == 'ArrowDown') {
        if (current && current.nextElementSibling) {
          ;(current.nextElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.firstElementChild as HTMLDivElement).focus()
        }
      } else if (ev.key == 'ArrowUp') {
        if (current && current.previousElementSibling) {
          ;(current.previousElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.lastElementChild as HTMLDivElement).focus()
        }
      } else if (ev.key == 'Enter') {
        if (current) {
          ;(current as HTMLDivElement)?.click()
        }
      } else if (ev.key == 'Escape') {
        props.closeCallback()
      }
      // preventDefaultForScrollKeys
      else if (ScrollKeysToBlock.includes(ev.code)) {
        ev.preventDefault()
        return false
      }
    }

    const onOutsideClick = (ev: MouseEvent) => {
      const parent = document.querySelector('div.dc-context-menu')
      if (!parent) {
        return
      }

      let isOnMenu = ev.target === parent
      for (let child of parent.children) {
        if (ev.target === child) {
          isOnMenu = true
        }
      }

      if (!isOnMenu) {
        props.closeCallback()
      }
    }

    const onResize = (_ev: UIEvent) => props.closeCallback()

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onOutsideClick)
    document.addEventListener('touchstart', onOutsideClick)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onOutsideClick)
      document.removeEventListener('touchstart', onOutsideClick)
      window.removeEventListener('resize', onResize)
    }
  })

  return (
    <div
      className='dc-context-menu'
      style={{
        top: `${props.top}px`,
        left: `${props.left}px`,
      }}
      role='menu'
      tabIndex={-1}
    >
      {props.items.map((item, index) => (
        <div
          className='item'
          onClick={() => {
            props.closeCallback()
            item.action()
          }}
          tabIndex={-1}
          role='menuitem'
          key={index}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export function makeContextMenu(
  items: ContextMenuItem[],
  screenContext: unwrapContext<typeof ScreenContext>
) {
  return (ev: React.MouseEvent<any, MouseEvent>) => {
    const [cursorX, cursorY] = [ev.clientX, ev.clientY]

    screenContext.openContextMenu({
      cursorX,
      cursorY,
      items,
    })
  }
}

export function useContextMenu(items: ContextMenuItem[]) {
  const screenContext = useContext(ScreenContext)
  return makeContextMenu(items, screenContext)
}

/**
 * disables scrolling on the app as long as the component is mounted
 * inspired by https://stackoverflow.com/a/4770179
 *
 * this is outside of an use function because
 * for some reason removing the listeners doesn't work for those
 */
function preventDefault(e: Event) {
  if (window.__contextMenuActive) {
    e.preventDefault()
  }
}
const wheelEvent: 'wheel' | 'mousewheel' =
  'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel'
document.addEventListener(wheelEvent, preventDefault, { passive: false })
document.addEventListener('touchmove', preventDefault, { passive: false })
