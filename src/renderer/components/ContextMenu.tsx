import React, { useState, useEffect, useLayoutEffect, useContext } from 'react'
import { useRef } from 'react'
import { ScreenContext, unwrapContext } from '../contexts'

export type ContextMenuItem = { label: string; action: () => void }

type showFnArguments = {
  cursorX: number
  cursorY: number
  items: (ContextMenuItem | false)[]
}

/** shows a context menu
 * @returns a promise with no return value that gets resolved when the context menu disapears again
 * regardless what action the user took or if they canceled the dialog
 */
export type showFnType = (args: showFnArguments) => Promise<void>

const ScrollKeysToBlock = ['Space', 'PageUp', 'PageDown', 'End', 'Home']

export function ContextMenuLayer({
  setShowFunction,
}: {
  setShowFunction: (showFn: showFnType) => void
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const cursorX = useRef<number>(0)
  const cursorY = useRef<number>(0)
  const [active, setActive] = useState(false)
  const [currentItems, setCurrentItems] = useState<ContextMenuItem[]>([])
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  const endPromiseRef = useRef<(() => void) | null>(null)

  async function show({
    cursorX: x,
    cursorY: y,
    items: rawItems,
  }: showFnArguments) {
    if (!layerRef.current) {
      throw new Error('Somehow the ContextMenuLayer went missing')
    }
    // Filter out empty null items
    // (can happen when constructing the array with inline conditions,
    // look at the chatlistitem context menu for an example)
    cursorX.current = x
    cursorY.current = y
    const items = rawItems.filter(item => !!item) as ContextMenuItem[]
    // Get required information
    setCurrentItems(items)
    window.__contextMenuActive = true
    setActive(true)
    await new Promise<void>((resolve, _reject) => {
      endPromiseRef.current = resolve
    })
  }

  function showAfter(menuEl: HTMLDivElement | null) {
    if (!menuEl || !layerRef.current) {
      return
    }
    if (cursorX.current == null || cursorY.current == null) {
      throw new Error('Somehow the cursor for context menu was not set')
    }
    const style = window.getComputedStyle(layerRef.current)

    const getValue = (key: string) =>
      Number(style.getPropertyValue(key).replace('px', ''))

    const space = {
      height: getValue('height'),
      width: getValue('width'),
    }

    const x = cursorX.current,
      y = cursorY.current

    const menu = {
      height: menuEl.clientHeight,
      width: menuEl.clientWidth,
    }

    // Finding Orientation
    let top = 0,
      left = 0

    // Right or Left
    if (x + menu.width <= space.width) {
      // Right
      left = x
    } else {
      // Left
      left = x - menu.width
    }

    // Bottom or Top
    if (y + menu.height <= space.height) {
      // Bottom
      top = y
    } else {
      // Top
      top = y - menu.height
    }

    // Displaying Menu
    setPosition({ top, left })
  }

  function cancel() {
    window.__contextMenuActive = false
    setActive(false)
    setCurrentItems([])
    endPromiseRef.current?.()
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
          openCallback={showAfter}
          closeCallback={cancel}
        />
      )}
    </div>
  )
}

export function ContextMenu(props: {
  top: number
  left: number
  items: (ContextMenuItem | false)[]
  openCallback: (el: HTMLDivElement | null) => void
  closeCallback: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const didOpen = useRef<boolean>(false)
  useLayoutEffect(() => {
    if (!menuRef.current) {
      throw new Error()
    }
    if (didOpen.current) {
      return
    }
    didOpen.current = true
    menuRef.current.focus()
    if (typeof props.openCallback === 'function')
      props.openCallback(menuRef.current)
    //document.querySelector<HTMLDivElement>('div.dc-context-menu')?.focus()
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

    const onOutsideClick = (ev: MouseEvent | TouchEvent) => {
      const parent = document.querySelector('div.dc-context-menu')
      if (!parent) {
        return
      }

      let isOnMenu = ev.target === parent
      for (const child of parent.children) {
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

  const items = props.items.filter(val => val !== false) as ContextMenuItem[]

  return (
    <div
      ref={menuRef}
      className='dc-context-menu'
      style={{
        top: `${props.top}px`,
        left: `${props.left}px`,
      }}
      role='menu'
      tabIndex={-1}
    >
      {items.map((item, index) => (
        <div
          className='item'
          onClick={() => {
            didOpen.current = false
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

type ItemsFactoryFn = () => (ContextMenuItem | false)[]

/**
 *
 * @param itemsOrItemsFactoryFn menu items or a function that generates the items at the time the menu opens
 * @param openContextMenu reference to the ScreenContext's openContextMenu function
 *
 */
export function makeContextMenu(
  itemsOrItemsFactoryFn: (ContextMenuItem | false)[] | ItemsFactoryFn,
  openContextMenu: unwrapContext<typeof ScreenContext>['openContextMenu']
) {
  return (ev: React.MouseEvent<any, MouseEvent>) => {
    ev.preventDefault() // prevent default runtime context menu from opening
    const [cursorX, cursorY] = [ev.clientX, ev.clientY]

    const items =
      typeof itemsOrItemsFactoryFn === 'function'
        ? itemsOrItemsFactoryFn()
        : itemsOrItemsFactoryFn

    return openContextMenu({
      cursorX,
      cursorY,
      items,
    })
  }
}

/**
 *
 * @param itemsOrItemsFactoryFn menu items or a function that generates the items at the time the menu opens
 */
export function useContextMenu(
  itemsOrItemsFactoryFn: Parameters<typeof makeContextMenu>[0]
) {
  const { openContextMenu } = useContext(ScreenContext)
  return makeContextMenu(itemsOrItemsFactoryFn, openContextMenu)
}

/**
 *
 * @param itemsOrItemsFactoryFn menu items or a function that generates the items at the time the menu opens
 */
export function useContextMenuWithActiveState(
  itemsOrItemsFactoryFn: Parameters<typeof makeContextMenu>[0]
) {
  const [isContextMenuActive, setIsContextMenuActive] = useState(false)
  const { openContextMenu } = useContext(ScreenContext)
  const openFn = makeContextMenu(itemsOrItemsFactoryFn, openContextMenu)
  return {
    isContextMenuActive,
    onContextMenu: async (ev: React.MouseEvent<any, MouseEvent>) => {
      setIsContextMenuActive(true)
      await openFn(ev)
      setIsContextMenuActive(false)
    },
  }
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
