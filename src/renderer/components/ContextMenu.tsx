import React, { useState, useEffect, useLayoutEffect, useContext } from 'react'
import { useKeyBindingAction, KeybindAction } from '../keybindings'
import { useRef } from 'react'
import { ScreenContext, unwrapContext } from '../contexts'

export type ContextMenuItem = { label: string; action: () => void }

type showFnArguments = {
  cursorX: number
  cursorY: number
  items: ContextMenuItem[]
}

export type showFnType = (args: showFnArguments) => void

export function ContextMenuLayer({
  setShowFunction,
}: {
  setShowFunction: (showFn: showFnType) => void
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [isDemo, setDemo] = useState(false)
  const [currentItems, setCurrentItems] = useState<ContextMenuItem[]>([])
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  function dummyShow(ev: React.MouseEvent<any, MouseEvent>) {
    const [cursorX, cursorY] = [ev.clientX, ev.clientY]

    show({
      cursorX,
      cursorY,
      items: [
        {
          label: 'DemoOption1',
          action: () => console.debug('clicked demo option 1'),
        },
        {
          label: 'DemoOption2',
          action: () => console.debug('clicked demo option 2'),
        },
        {
          label: 'DemoOption3',
          action: () => console.debug('clicked demo option 3'),
        },
      ],
    })
  }

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
    /** the margin that the context menu should have to the windo border */
    const BorderMargin = getValue('--local-border-clearance')

    const ContextMenuItemHeight =
      ContextMenuItemVerticalMargin * 2 + ContextMenuItemLineHeight

    const space = {
      height: getValue('height'),
      width: getValue('width'),
    }
    const [x, y] = [cursorX, cursorY]
    const menu = {
      height: items.length * ContextMenuItemHeight,
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
    setDemo(false)
  }

  useKeyBindingAction(KeybindAction.DebugAction_ContextMenu, () => {
    setDemo(true)
    setActive(true)
  })

  useEffect(() => {
    if (typeof setShowFunction === 'function') setShowFunction(show)
  }, [setShowFunction])

  return (
    <div
      ref={layerRef}
      className={`dc-context-menu-layer ${active ? 'active' : ''}`}
      style={
        isDemo
          ? {
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              border: 'var(--local-border-clearance) solid red',
            }
          : {}
      }
      onClick={cancel}
      onContextMenu={ev => isDemo && dummyShow(ev)}
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
      }
      if (ev.key == 'ArrowUp') {
        if (current && current.previousElementSibling) {
          ;(current.previousElementSibling as HTMLDivElement)?.focus()
        } else {
          ;(parent?.lastElementChild as HTMLDivElement).focus()
        }
      }

      if (ev.key == 'Enter') {
        if (current) {
          ;(current as HTMLDivElement)?.click()
        }
      }

      if (ev.key == 'Escape') {
        props.closeCallback()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
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

// TODO:
// - [X] find out in which direction it should open
// - [X] open a context menu
// - [X] Block other keybindings when ContextMenu is active
// - [X] controllable via keybindings (up, down, escape, enter)

// - [X] provide a screen context function to open it
// - [] replace all ocurrences of the other context menu
// - [] remove the remaining debug dummy code

// - [] what do we do about too long text? maybe do a line break?
//      then the calculations will be off... maybe still better expected buggy behaviour that unexpected glitchy behaviour
// - [] look a bit on the accessibility side of things??

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
