import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react'
import classNames from 'classnames'
import Icon from './Icon'
import type { IconName } from './Icon'

import useContextMenu from '../hooks/useContextMenu'

type ContextMenuItemActionable = {
  icon?: IconName
  action: (event: React.MouseEvent<Element, MouseEvent>) => void
  subitems?: never
}

type ContextMenuItemExpandable = {
  icon?: IconName
  action?: never
  subitems: (ContextMenuItem | undefined)[]
}

export type ContextMenuItem = { label: string; dataTestid?: string } & (
  | ContextMenuItemActionable
  | ContextMenuItemExpandable
)

type showFnArguments = {
  cursorX: number
  cursorY: number
  items: (ContextMenuItem | false)[]
}

type ContextMenuLevel = {
  items: ContextMenuItem[]
}

/**
 * Shows a context menu with the given menu items.
 *
 * @returns A promise with no return value that gets resolved when the
 * context menu disappears again, regardless what action the user took or if
 * they cancelled the dialog.
 */
export type OpenContextMenu = (args: showFnArguments) => Promise<void>

const ScrollKeysToBlock = ['Space', 'PageUp', 'PageDown', 'End', 'Home']

export function ContextMenuLayer({
  setShowFunction,
}: {
  setShowFunction: (showFn: OpenContextMenu) => void
}) {
  const layerRef = useRef<HTMLDialogElement>(null)
  const cursorX = useRef<number>(0)
  const cursorY = useRef<number>(0)

  const [currentItems, setCurrentItems] = useState<ContextMenuItem[]>([])
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  const endPromiseRef = useRef<(() => void) | null>(null)

  const show = useCallback(
    async ({ cursorX: x, cursorY: y, items: rawItems }: showFnArguments) => {
      if (!layerRef.current) {
        throw new Error('Somehow the ContextMenuLayer went missing')
      }

      layerRef.current.showModal()

      // Filter out empty null items
      // (can happen when constructing the array with inline conditions,
      // look at the chatlistitem context menu for an example)
      cursorX.current = x
      cursorY.current = y
      const items = rawItems.filter(item => !!item) as ContextMenuItem[]

      // Get required information
      setCurrentItems(items)
      window.__setContextMenuActive(true)

      await new Promise<void>((resolve, _reject) => {
        endPromiseRef.current = resolve
      })
    },
    []
  )

  const showAfter = useCallback((menuEl: HTMLDivElement | null) => {
    if (!menuEl || !layerRef.current) {
      return
    }

    if (cursorX.current == null || cursorY.current == null) {
      throw new Error('Somehow the cursor for context menu was not set')
    }

    const { height: layerHeight, width: layerWidth } =
      layerRef.current.getBoundingClientRect()

    const menu = {
      height: menuEl.clientHeight,
      width: menuEl.clientWidth,
    }

    // Place at cursor first
    let top = cursorY.current,
      left = cursorX.current

    // If doesn't fit move to the left
    if (left + menu.width > layerWidth) {
      left -= menu.width
    }

    // If doesn't fit move down
    if (top + menu.height > layerHeight) {
      top -= menu.height
    }

    // Displaying Menu
    setPosition({ top, left })
  }, [])

  const cancel = useCallback(() => {
    window.__setContextMenuActive(false)
    setCurrentItems([])
    layerRef.current?.close()
    endPromiseRef.current?.()
  }, [])

  useEffect(() => {
    if (typeof setShowFunction === 'function') {
      setShowFunction(show)
    }
  }, [setShowFunction, show])

  return (
    <dialog
      ref={layerRef}
      className='dc-context-menu-layer'
      onClick={cancel}
      onContextMenuCapture={cancel}
    >
      {currentItems.length > 0 && (
        <ContextMenu
          rightLimit={
            (layerRef.current as HTMLElement).clientLeft +
            (layerRef.current as HTMLElement).clientWidth
          }
          top={position.top}
          left={position.left}
          items={currentItems}
          openCallback={showAfter}
          closeCallback={cancel}
        />
      )}
    </dialog>
  )
}

export function ContextMenu(props: {
  top: number
  left: number
  rightLimit: number
  items: (ContextMenuItem | false)[]
  openCallback: (el: HTMLDivElement | null) => void
  closeCallback: () => void
}) {
  const didOpen = useRef<boolean>(false)
  // References to each level menu element
  const menuLevelEls = useRef<HTMLDivElement[]>([])
  // Array of indices for ContextMenuItem picked on each level,
  // always one item less than menuLevelEls
  const [openSublevels, setSublevels] = useState<number[]>([])
  // Which one of the last sublevel items the keyboard is focused on
  const keyboardFocus = useRef<number>(-1)

  let items = props.items.filter(val => val !== false) as ContextMenuItem[]

  const { closeCallback } = props

  const levelItems: ContextMenuLevel[] = [{ items }]

  for (const idx of openSublevels) {
    items = items[idx].subitems as ContextMenuItem[]
    levelItems.push({
      items,
    })
  }
  const expandMenu = (index: number, fromLevel?: number) => {
    if (fromLevel !== undefined) {
      setSublevels(l => [...l.slice(0, fromLevel), index])
    } else {
      setSublevels(l => [...l, index])
    }
  }

  const collapseMenu = (toLevel: number) => {
    setSublevels(l => l.slice(0, toLevel))
  }

  useLayoutEffect(() => {
    if (menuLevelEls.current.length == 0) {
      throw new Error('No context menu elements available to display')
    }
    let prevOffset = props.left
    let curOffset = props.left + menuLevelEls.current[0].clientWidth

    for (let i = 0; i < openSublevels.length; ++i) {
      const prevElement = menuLevelEls.current[i] as HTMLDivElement
      const curElement = menuLevelEls.current[i + 1]
      const menuEl = prevElement.children[openSublevels[i]]
      if (!menuEl) {
        throw Error("There's no focus on previous menu")
      }
      const bounds = menuEl.getBoundingClientRect()
      const nextOffset = curOffset + curElement.clientWidth

      if (nextOffset > props.rightLimit) {
        curOffset = prevOffset - curElement.clientWidth
      }
      curElement.style.top = bounds.top + 'px'
      curElement.style.left = curOffset + 'px'

      prevOffset = nextOffset
    }
    if (didOpen.current) {
      return
    }

    didOpen.current = true
    if (typeof props.openCallback === 'function') {
      props.openCallback(menuLevelEls.current[0])
    }
  })

  useEffect(() => {
    menuLevelEls.current = menuLevelEls.current.slice(
      0,
      openSublevels.length + 1
    )
    const parent = menuLevelEls.current[openSublevels.length]

    if (keyboardFocus.current > -1) {
      ;(parent.children[keyboardFocus.current] as HTMLDivElement).focus()
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      const current = parent?.querySelector(':focus')

      if (ev.code == 'ArrowDown') {
        if (current && current.nextElementSibling) {
          ;(current.nextElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.firstElementChild as HTMLDivElement).focus()
        }
      } else if (ev.code == 'ArrowUp') {
        if (current && current.previousElementSibling) {
          ;(current.previousElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.lastElementChild as HTMLDivElement).focus()
        }
      } else if (ev.code == 'ArrowLeft') {
        setSublevels(l => l.slice(0, Math.max(0, l.length - 1)))
        keyboardFocus.current = openSublevels[openSublevels.length - 1]
      } else if (ev.code == 'ArrowRight') {
        if (current) {
          const el = current as HTMLDivElement
          const index = parseInt(el.dataset.expandableIndex as string, 10)
          if (!isNaN(index)) {
            expandMenu(index)
            keyboardFocus.current = 0
          }
        }
      } else if (ev.code == 'Enter') {
        if (current) {
          ;(current as HTMLDivElement)?.click()
        }
      } else if (ev.code == 'Escape') {
        closeCallback()
        keyboardFocus.current = -1
      }
      // preventDefaultForScrollKeys
      else if (ScrollKeysToBlock.includes(ev.code)) {
        ev.preventDefault()
        return false
      }
    }

    const onResize = (_ev: UIEvent) => closeCallback()

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [openSublevels, menuLevelEls, closeCallback])

  return (
    <div>
      {levelItems.map((level, levelIdx) => (
        <div
          ref={el => (menuLevelEls.current[levelIdx] = el as HTMLDivElement)}
          key={levelIdx}
          className='dc-context-menu'
          role='menu'
          tabIndex={-1}
          style={{
            top: `${props.top}px`,
            left: `${props.left}px`,
          }}
        >
          {level.items.map((item, index) => (
            <div
              className={classNames({
                item: true,
                selected: index === openSublevels[levelIdx],
              })}
              onClick={(ev: React.MouseEvent) => {
                if (item.subitems) {
                  expandMenu(index, levelIdx)
                  keyboardFocus.current = 0
                  ev.stopPropagation()
                } else {
                  collapseMenu(levelIdx)
                  keyboardFocus.current = -1
                  didOpen.current = false
                  closeCallback()
                  item.action(ev)
                }
              }}
              onMouseOver={() => {
                if (item.subitems) {
                  expandMenu(index, levelIdx)
                } else {
                  collapseMenu(levelIdx)
                }
              }}
              tabIndex={-1}
              data-testid={item.dataTestid}
              role='menuitem'
              key={index}
              {...(item.subitems && { 'data-expandable-index': index })}
            >
              {item.icon && <Icon className='left-icon' icon={item.icon} />}
              {item.label}
              {item.subitems && <div className='right-icon'></div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * List of menu items which are rendered in the context menu.
 */
export type ContextMenuItems = (ContextMenuItem | false)[]

/**
 * Function that generates the menu items when the context menu opens.
 */
export type ContextMenuItemsFactoryFn = () => ContextMenuItems

/**
 * @param itemsOrItemsFactoryFn menu items or a function that generates the
 * items at the time the menu opens.
 * @param openContextMenu reference to the ScreenContext's openContextMenu
 * function.
 */
export function makeContextMenu(
  itemsOrItemsFactoryFn: ContextMenuItems | ContextMenuItemsFactoryFn,
  openContextMenu: OpenContextMenu
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

export function useContextMenuWithActiveState(
  itemsOrItemsFactoryFn: ContextMenuItems | ContextMenuItemsFactoryFn
) {
  const [isContextMenuActive, setIsContextMenuActive] = useState(false)
  const openFn = useContextMenu(itemsOrItemsFactoryFn)

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
  e.preventDefault()
}
const wheelEvent: 'wheel' | 'mousewheel' =
  'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel'

window.__setContextMenuActive = (newVal: boolean): void => {
  if (newVal) {
    // Adding the same listener twice in a row has no effect.
    document.addEventListener(wheelEvent, preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })
  } else {
    document.removeEventListener(wheelEvent, preventDefault)
    document.removeEventListener('touchmove', preventDefault)
  }
  type Writable<T> = {
    -readonly [P in keyof T]: T[P]
  }
  ;(window as Writable<typeof window>).__contextMenuActive = newVal
}
