import React, { createContext, useState } from 'react'

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
    initialValue.openContextMenu
  )

  const value = {
    openContextMenu: openContextMenuFn,
  }

  return (
    <ContextMenuContext.Provider value={value}>
      <ContextMenuLayer
        setShowFunction={showFn => {
          setOpenContextMenuFn(showFn)
        }}
      />
      {children}
    </ContextMenuContext.Provider>
  )
}
