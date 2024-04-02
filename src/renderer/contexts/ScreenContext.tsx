import classNames from 'classnames'
import React, { useCallback, useState } from 'react'

import type { PropsWithChildren } from 'react'

export type FlashMessage = {
  type: 'error' | 'success'
  text: string
}

export enum Screens {
  Welcome = 'welcome',
  Main = 'main',
  Login = 'login',
  Loading = 'loading',
  DeleteAccount = 'deleteAccount',
  NoAccountSelected = 'noAccountSelected',
}

export type ScreenValue = {
  screen: Screens
  changeScreen: (screen: Screens) => void
  setFlashMessage: (message: FlashMessage) => void
  clearFlashMessage: () => void
}

export const ScreenContext = React.createContext<ScreenValue | null>(null)

export const ScreenProvider = ({ children }: PropsWithChildren<{}>) => {
  const [screen, setScreen] = useState<Screens>(Screens.Loading)
  const [flash, setFlash] = useState<FlashMessage | null>(null)

  const changeScreen = useCallback((nextScreen: Screens) => {
    setScreen(nextScreen)
  }, [])

  const setFlashMessage = (message: FlashMessage) => {
    // One at a time, cowgirl
    if (flash) {
      return
    }

    setFlash(message)
  }

  const clearFlashMessage = () => {
    setFlash(null)
  }

  const value: ScreenValue = {
    changeScreen,
    screen,
    setFlashMessage,
    clearFlashMessage,
  }

  return (
    <ScreenContext.Provider value={value}>
      {flash && (
        <div
          onClick={clearFlashMessage}
          className={classNames('user-feedback', flash.type)}
        >
          <p>{flash.text}</p>
        </div>
      )}
      {children}
    </ScreenContext.Provider>
  )
}
