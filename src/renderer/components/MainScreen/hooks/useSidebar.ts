import { useContext } from 'react'

import { MainScreenContext } from '../contexts/MainScreenContext'

export function useSidebar() {
  const { setSidebarState, sidebarState } = useContext(MainScreenContext)

  const showSidebar = () => {
    setSidebarState('visible')
  }

  const hideSidebar = () => {
    setSidebarState(state => {
      if (state === 'init') {
        return 'init'
      } else {
        return 'invisible'
      }
    })
  }

  const toggleSidebar = () => {
    setSidebarState(state => {
      if (state === 'invisible' || state === 'init') {
        return 'visible'
      } else {
        return 'invisible'
      }
    })
  }

  return {
    showSidebar,
    hideSidebar,
    toggleSidebar,
    sidebarState,
    setSidebarState,
  }
}
