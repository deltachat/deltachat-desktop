import React, { useState } from 'react'

import type { PropsWithChildren } from 'react'

export type SidebarState = 'init' | 'visible' | 'invisible'

export type AlternativeView = null | 'global-gallery'

type MainScreenContextValue = {
  alternativeView: AlternativeView
  showArchivedChats: boolean
  sidebarState: SidebarState
  setAlternativeView: React.Dispatch<React.SetStateAction<AlternativeView>>
  setShowArchivedChats: React.Dispatch<React.SetStateAction<boolean>>
  setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>
}

const initialValues: MainScreenContextValue = {
  alternativeView: null,
  showArchivedChats: false,
  sidebarState: 'init',
  setAlternativeView: _ => {},
  setShowArchivedChats: _ => {},
  setSidebarState: _ => {},
}

export const MainScreenContext =
  React.createContext<MainScreenContextValue>(initialValues)

export const MainScreenContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const [alternativeView, setAlternativeView] = useState<AlternativeView>(
    initialValues.alternativeView
  )
  const [showArchivedChats, setShowArchivedChats] = useState(
    initialValues.showArchivedChats
  )
  const [sidebarState, setSidebarState] = useState<SidebarState>(
    initialValues.sidebarState
  )

  const value = {
    alternativeView,
    showArchivedChats,
    sidebarState,
    setAlternativeView,
    setShowArchivedChats,
    setSidebarState,
  }

  return (
    <MainScreenContext.Provider value={value}>
      {children}
    </MainScreenContext.Provider>
  )
}
