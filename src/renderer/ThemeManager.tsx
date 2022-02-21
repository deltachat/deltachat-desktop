import { DeltaBackend } from './delta-remote'
import { Theme } from '../shared/shared-types'
import { ipcBackend } from './ipc'
import React, { useContext, useMemo } from 'react'

export namespace ThemeManager {
  let currentThemeMetaData: Theme
  let currentThemeChangeHook: () => void = () => {}

  export async function refresh() {
    const theme: {
      theme: Theme
      data: string
    } | null = await DeltaBackend.call('extras.getActiveTheme')
    if (theme) {
      currentThemeMetaData = theme.theme
      const themeVars = window.document.getElementById('theme-vars')
      if (!themeVars) {
        throw new Error('#theme-vars element not found')
      }
      themeVars.innerText = theme.data
      currentThemeChangeHook()
    }
    const { showAccountSidebar } = await DeltaBackend.call(
      'settings.getDesktopSettings'
    )
    const globalVars = window.document.getElementById('global-vars')
    if (!globalVars) return
    if (showAccountSidebar) {
      globalVars.innerText = ''
    } else {
      globalVars.innerText = ':root { --accountSidebarWidth: 0px }'
    }
  }

  ipcBackend.on('theme-update', _e => refresh())
  refresh()

  export function getCurrentThemeMetaData() {
    return currentThemeMetaData
  }

  export function setUpdateHook(hook: typeof currentThemeChangeHook) {
    currentThemeChangeHook = hook
  }
}

/** contains a theme identifier so we can get a rerender if it changes */
export const ThemeContext = React.createContext<number>(0)

export const useThemeCssVar = (css_var_name: string) => {
  const tc = useContext(ThemeContext)
  const result = useMemo(() => {
    tc // this does nothing, but without it eslint will complain, and if we followed eslint the code would not behave as it should.
    return getComputedStyle(document.firstElementChild as Element)
      .getPropertyValue(css_var_name)
      .trim()
  }, [tc, css_var_name])
  return result
}
