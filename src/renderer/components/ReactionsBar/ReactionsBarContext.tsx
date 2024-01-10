import React, { useState } from 'react'

import AbsolutePositioningHelper from '../AbsolutePositioningHelper'
import OutsideClickHelper from '../OutsideClickHelper'
import ReactionsShortcutBar from '.'

import type { PropsWithChildren } from 'react'

type ReactionsBarValue = {
  showReactionsBar: (x: number, y: number) => void
  hideReactionsBar: () => void
}

export const ReactionsBarContext =
  React.createContext<ReactionsBarValue | null>(null)

export const ReactionsBarProvider = ({ children }: PropsWithChildren<{}>) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const showReactionsBar = (x: number, y: number) => {
    setPosition({ x, y })
    setVisible(true)
  }

  const hideReactionsBar = () => {
    setVisible(false)
  }

  const value: ReactionsBarValue = {
    showReactionsBar,
    hideReactionsBar,
  }

  return (
    <ReactionsBarContext.Provider value={value}>
      {visible && (
        <OutsideClickHelper onClick={hideReactionsBar}>
          <AbsolutePositioningHelper x={position.x} y={position.y}>
            <ReactionsShortcutBar />
          </AbsolutePositioningHelper>
        </OutsideClickHelper>
      )}
      {children}
    </ReactionsBarContext.Provider>
  )
}
