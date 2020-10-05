import React, { useState, PropsWithChildren } from 'react'
import { useKeyBindingAction, KeybindAction } from '../keybindings'
import { useRef } from 'react'

type ContextMenuItem = { label: string; action: () => void }

export function ContextMenuLayer(props: any) {
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
          action: () => console.log('clicked demo option 1'),
        },
        {
          label: 'DemoOption2',
          action: () => console.log('clicked demo option 2'),
        },
        {
          label: 'DemoOption3',
          action: () => console.log('clicked demo option 3'),
        },
      ],
    })
  }

  function show({
    cursorX,
    cursorY,
    items,
  }: {
    cursorX: number
    cursorY: number
    items: ContextMenuItem[]
  }) {
    console.log('Open context menu')
    console.log(layerRef.current)
    if (!layerRef.current) {
      throw new Error('Somehow the ContextMenuLayer went missing')
    }

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
    setActive(true)
  }

  function cancel() {
    console.log('Close context menu')
    setActive(false)
    setCurrentItems([])
    setDemo(false)
  }

  useKeyBindingAction(KeybindAction.DebugAction_ContextMenu, () => {
    setDemo(true)
    setActive(true)
  })

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
  return (
    <div
      className='dc-context-menu'
      style={{
        top: `${props.top}px`,
        left: `${props.left}px`,
      }}
    >
      {props.items.map(item => (
        <div
          className='item'
          onClick={() => {
            props.closeCallback()
            item.action()
          }}
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
// - [] provide a screen context function to open it
// - [] Block other keybindings when ContextMenu is active
// - [] controllable via keybindings (up, down, escape, enter)
// - [] remove the remaining debug dummy code

// - [] what do we do about too long text? maybe do a line break?
//      then the calculations will be off... maybe still better expected buggy behaviour that unexpected glitchy behaviour

// - [] replace all ocurrences of the other context menu
