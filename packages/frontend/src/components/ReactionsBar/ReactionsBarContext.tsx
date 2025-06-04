import React, { useEffect, useState } from 'react'

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

export type ReactionsBarValue = {
  showReactionsBar: (args: ShowReactionBar) => void
  hideReactionsBar: () => void
  isReactionsBarShown: boolean
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
    isReactionsBarShown: barArgs !== null,
  }

  useEffect(() => {
    const hideOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && barArgs !== null) {
        hideReactionsBar()
      }
    }
    window.addEventListener('keyup', hideOnEscape)
    return () => {
      window.removeEventListener('keyup', hideOnEscape)
    }
  }, [barArgs])

  return (
    <ReactionsBarContext.Provider value={value}>
      <AbsolutePositioningHelper
        x={barArgs ? barArgs.x : 0}
        y={barArgs ? barArgs.y : 0}
      >
        {barArgs !== null && (
          <OutsideClickHelper onClick={hideReactionsBar}>
            <ReactionsShortcutBar
              key={barArgs.messageId}
              messageId={barArgs.messageId}
              myReaction={barArgs.myReaction}
              onClick={hideReactionsBar}
            />
          </OutsideClickHelper>
        )}
      </AbsolutePositioningHelper>
      {children}
    </ReactionsBarContext.Provider>
  )
}
