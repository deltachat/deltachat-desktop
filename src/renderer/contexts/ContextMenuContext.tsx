import React, { createContext, useCallback, useState } from 'react'

import { ContextMenuLayer } from '../components/ContextMenu'

import type { PropsWithChildren } from 'react'
import type { OpenContextMenu } from '../components/ContextMenu'

type ContextMenuContextValue = {
  openContextMenu: OpenContextMenu
}

const initialValue = {
  openContextMenu: async () => {
    throw new Error('No method implemented to handle context menu')
  },
}

export const ContextMenuContext =
  createContext<ContextMenuContextValue>(initialValue)

export function ContextMenuProvider({ children }: PropsWithChildren<{}>) {
  const [openContextMenuFn, setOpenContextMenuFn] = useState<OpenContextMenu>(
    // Since React calls initial `useState` values once if they're a function
    // we need to wrap our default function here
    () => {
      return initialValue.openContextMenu
    }
  )

  const setShowFunction = useCallback((showFn: OpenContextMenu) => {
    setOpenContextMenuFn(
      // Similar to above we need to wrap this into a function, otherwise React
      // would call `showFn` thinking this is the method creating the next
      // state value
      () => {
        return showFn
      }
    )
  }, [])

  const value = {
    openContextMenu: openContextMenuFn,
  }

  return (
    <ContextMenuContext.Provider value={value}>
      <ContextMenuLayer setShowFunction={setShowFunction} />
      {children}
    </ContextMenuContext.Provider>
  )
}
