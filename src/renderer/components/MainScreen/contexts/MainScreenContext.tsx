import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'

export type SidebarState = 'init' | 'visible' | 'invisible'

export type MainView = 'chats' | 'global-gallery' | 'archive'

type MainScreenContextValue = {
  mainView: MainView
  sidebarState: SidebarState
  setMainView: React.Dispatch<React.SetStateAction<MainView>>
  setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>
}

const initialValues: MainScreenContextValue = {
  mainView: 'chats',
  sidebarState: 'init',
  setMainView: _ => {},
  setSidebarState: _ => {},
}

export const MainScreenContext =
  React.createContext<MainScreenContextValue>(initialValues)

export const MainScreenContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [mainView, setMainView] = useState<MainView>(initialValues.mainView)
  const [sidebarState, setSidebarState] = useState<SidebarState>(
    initialValues.sidebarState
  )

  const value = {
    mainView,
    sidebarState,
    setMainView,
    setSidebarState,
  }

  return (
    <MainScreenContext.Provider value={value}>
      {children}
    </MainScreenContext.Provider>
  )
}
