import React, { useState } from 'react'

import AbsolutePositioningHelper from '../AbsolutePositioningHelper'
import OutsideClickHelper from '../OutsideClickHelper'
import ReactionsShortcutBar from '.'

import type { PropsWithChildren } from 'react'

export type ShowReactionBar = {
  messageId: number
  myReaction?: string
  x: number
  y: number
}

type ReactionsBarValue = {
  showReactionsBar: (args: ShowReactionBar) => void
  hideReactionsBar: () => void
}

export const ReactionsBarContext =
  React.createContext<ReactionsBarValue | null>(null)

export const ReactionsBarProvider = ({ children }: PropsWithChildren<{}>) => {
  const [barArgs, setBarArgs] = useState<ShowReactionBar | null>(null)

  const showReactionsBar = (args: ShowReactionBar) => {
    setBarArgs(args)
  }

  const hideReactionsBar = () => {
    setBarArgs(null)
  }

  const value: ReactionsBarValue = {
    showReactionsBar,
    hideReactionsBar,
  }

  return (
    <ReactionsBarContext.Provider value={value}>
      {barArgs !== null && (
        <AbsolutePositioningHelper x={barArgs.x} y={barArgs.y}>
          <OutsideClickHelper onClick={hideReactionsBar}>
            <ReactionsShortcutBar
              messageId={barArgs.messageId}
              myReaction={barArgs.myReaction}
            />
          </OutsideClickHelper>
        </AbsolutePositioningHelper>
      )}
      {children}
    </ReactionsBarContext.Provider>
  )
}
