import React, { useState } from 'react'

import AbsolutePositioningHelper from '../AbsolutePositioningHelper'
import ReactionsShortcutBar from '.'

import type { PropsWithChildren } from 'react'

type ReactionsShortcutBarValue = {
  showReactionsBar: (x: number, y: number) => void
  hideReactionsBar: () => void
}

const initialValues = {
  showReactionsBar: () => {},
  hideReactionsBar: () => {},
}

export const ReactionsShortcutBarContext =
  React.createContext<ReactionsShortcutBarValue>(initialValues)

export const ReactionsShortcutBarProvider = ({
  children,
}: PropsWithChildren<{}>) => {
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

  const value = {
    showReactionsBar,
    hideReactionsBar,
  }

  return (
    <ReactionsShortcutBarContext.Provider value={value}>
      {visible && (
        <AbsolutePositioningHelper x={position.x} y={position.y}>
          <ReactionsShortcutBar />
        </AbsolutePositioningHelper>
      )}
      {children}
    </ReactionsShortcutBarContext.Provider>
  )
}
