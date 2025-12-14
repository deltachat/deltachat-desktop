import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import classNames from 'classnames'
import Icon from './Icon'
import type { IconName } from './Icon'

import useContextMenu from '../hooks/useContextMenu'
import { mouseEventToPosition } from '../utils/mouseEventToPosition'

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

export type ContextMenuItem =
  | ({ type?: 'item'; label: string; dataTestid?: string } & (
      | ContextMenuItemActionable
      | ContextMenuItemExpandable
    ))
  | { type: 'separator' }

type MenuAriaAttrs = {
  'aria-label'?: string
  'aria-labelledby'?: string
} & (
  | {
      'aria-label': string
      'aria-labelledby'?: undefined
    }
  | {
      'aria-label'?: undefined
      'aria-labelledby': string
    }
)

type showFnArguments = {
  x: number
  y: number
  items: (ContextMenuItem | false)[]
  // TODO a11y: make this a required prop.
  // https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ :
  // > An element with role menu either has:
  // > - aria-labelledby set to a value that refers to the menuitem
  // >   or button that controls its display.
  // > - A label provided by aria-label.
  ariaAttrs?: MenuAriaAttrs
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

const ScrollKeysToBlock = ['PageUp', 'PageDown', 'End', 'Home']

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
  const [currentAriaAttrs, setCurrentAriaAttrs] = useState<
    undefined | MenuAriaAttrs
  >(undefined)

  const endPromiseRef = useRef<(() => void) | null>(null)

  const show = useCallback(
    async ({ x, y, items: rawItems, ariaAttrs }: showFnArguments) => {
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
      setCurrentAriaAttrs(ariaAttrs)

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
    let top = cursorY.current
    let left = cursorX.current

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

  const cancel = useCallback((evt?: React.MouseEvent) => {
    // Prevent default since ContextMenuLayer is only visible
    // when a context menu is already open
    evt?.preventDefault()
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
      // The `<dialog>` is only used to make sure that the menu is on top
      // of other content, and to trap focus.
      // The dialog semantics are not needed, and are probably confusing.
      role='presentation'
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
          ariaAttrs={currentAriaAttrs}
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
  closeCallback: (evt?: React.MouseEvent) => void
  // TODO make this a required prop.
  ariaAttrs?: MenuAriaAttrs
}) {
  const { closeCallback } = props

  const didOpen = useRef<boolean>(false)
  // References to each level menu element
  const menuLevelEls = useRef<HTMLDivElement[]>([])
  // Array of indices for ContextMenuItem picked on each level,
  // always one item less than menuLevelEls
  const [openSublevels, setSublevels] = useState<number[]>([])
  // Which one of the last sublevel items the keyboard is focused on
  const keyboardFocus = useRef<number>(-1)

  const levelItems: ContextMenuLevel[] = useMemo(() => {
    let items = props.items.filter(val => val !== false) as ContextMenuItem[]
    const levelItems = [{ items }]
    for (const idx of openSublevels) {
      if (items[idx].type === 'separator') {
        // this should never happen, as a seperator can not have a sub menu
        continue
      }
      items = items[idx].subitems as ContextMenuItem[]
      levelItems.push({
        items,
      })
    }
    return levelItems
  }, [openSublevels, props.items])

  const expandMenu = useCallback((index: number, fromLevel?: number) => {
    if (fromLevel !== undefined) {
      setSublevels(l => [...l.slice(0, fromLevel), index])
    } else {
      setSublevels(l => [...l, index])
    }
  }, [])

  const collapseMenu = (toLevel: number) => {
    setSublevels(l => l.slice(0, toLevel))
  }

  useLayoutEffect(() => {
    if (menuLevelEls.current.length === 0) {
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
      curElement.style.top = `${bounds.top}px`
      curElement.style.left = `${curOffset}px`

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

      enum Direction {
        Next = 0,
        Previous = 1,
      }

      const getNeighborElementWithoutSeperator = (
        parent: HTMLDivElement,
        current: Element | null,
        direction: Direction
      ) => {
        const skipIfSeperator: (
          nextCurrent: HTMLElement
        ) => HTMLDivElement = nextCurrent => {
          if (nextCurrent.classList.contains('separator')) {
            return getNeighborElementWithoutSeperator(
              parent,
              nextCurrent,
              direction
            )
          }
          return nextCurrent as HTMLDivElement
        }

        if (direction === Direction.Next) {
          if (current?.nextElementSibling) {
            return skipIfSeperator(current.nextElementSibling as HTMLElement)
          }
          return skipIfSeperator(parent?.firstElementChild as HTMLDivElement)
        }
        if (current?.previousElementSibling) {
          return skipIfSeperator(
            current.previousElementSibling as HTMLDivElement
          )
        }
        return skipIfSeperator(parent?.lastElementChild as HTMLDivElement)
      }

      if (ev.code === 'ArrowDown') {
        getNeighborElementWithoutSeperator(
          parent,
          current,
          Direction.Next
        )?.focus()
      } else if (ev.code === 'ArrowUp') {
        getNeighborElementWithoutSeperator(
          parent,
          current,
          Direction.Previous
        )?.focus()
      } else if (ev.code === 'ArrowLeft') {
        setSublevels(l => l.slice(0, Math.max(0, l.length - 1)))
        keyboardFocus.current = openSublevels[openSublevels.length - 1]
      } else if (ev.code === 'ArrowRight') {
        if (current) {
          const el = current as HTMLDivElement
          const index = Number.parseInt(
            el.dataset.expandableIndex as string,
            10
          )
          if (!Number.isNaN(index)) {
            expandMenu(index)
            keyboardFocus.current = 0
          }
        }
      } else if (ev.code === 'Escape') {
        closeCallback()
        keyboardFocus.current = -1
      }
      // preventDefaultForScrollKeys
      else if (ScrollKeysToBlock.includes(ev.code)) {
        ev.preventDefault()
        return false
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openSublevels, closeCallback, expandMenu])

  return (
    <div>
      {levelItems.map((level, levelIdx) => (
        <div
          ref={el => {
            menuLevelEls.current[levelIdx] = el as HTMLDivElement
          }}
          key={levelIdx}
          className='dc-context-menu'
          data-no-drag-region
          role='menu'
          aria-label={props.ariaAttrs?.['aria-label']}
          aria-labelledby={props.ariaAttrs?.['aria-labelledby']}
          tabIndex={-1}
          style={{
            top: `${props.top}px`,
            left: `${props.left}px`,
          }}
        >
          {level.items.map((item, index) => {
            if (item.type === 'separator') {
              return <hr className='separator' key={index} />
            }
            const isExpanded = index === openSublevels[levelIdx]
            return (
              <button
                type='button'
                className={classNames({
                  item: true,
                  selected: isExpanded,
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
                aria-haspopup={item.subitems ? 'menu' : undefined}
                aria-expanded={item.subitems ? isExpanded : undefined}
                {...(item.subitems && { 'data-expandable-index': index })}
              >
                {item.icon && <Icon className='left-icon' icon={item.icon} />}
                {item.label}
                {item.subitems && <div className='right-icon' />}
              </button>
            )
          })}
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
  openContextMenu: OpenContextMenu,
  ariaAttrs?: MenuAriaAttrs
) {
  return (ev: React.MouseEvent<any, MouseEvent>) => {
    ev.preventDefault() // prevent default runtime context menu from opening

    const items =
      typeof itemsOrItemsFactoryFn === 'function'
        ? itemsOrItemsFactoryFn()
        : itemsOrItemsFactoryFn

    return openContextMenu({
      ...mouseEventToPosition(ev),
      ariaAttrs,
      items,
    })
  }
}

export function useContextMenuWithActiveState(
  itemsOrItemsFactoryFn: ContextMenuItems | ContextMenuItemsFactoryFn,
  ariaAttrs?: Parameters<typeof useContextMenu>[1]
) {
  const [isContextMenuActive, setIsContextMenuActive] = useState(false)
  const openFn = useContextMenu(itemsOrItemsFactoryFn, ariaAttrs)

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
