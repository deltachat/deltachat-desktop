import { Theme } from '../../shared/shared-types'
import React, { useContext, useMemo } from 'react'
import { runtime } from '@deltachat-desktop/runtime-interface'

export namespace ThemeManager {
  let currentThemeMetaData: Theme
  let currentThemeChangeHook: () => void = () => {}

  export async function refresh() {
    runtime.onThemeUpdate = refresh
    const theme: {
      theme: Theme
      data: string
    } | null = await runtime.getActiveTheme()
    if (theme) {
      currentThemeMetaData = theme.theme
      const themeVars = window.document.getElementById('theme-vars')
      if (!themeVars) {
        throw new Error('#theme-vars element not found')
      }
      themeVars.innerText = theme.data
      currentThemeChangeHook()
    }

    // update app font according to `useSystemUIFont` setting
    if ((await runtime.getDesktopSettings()).useSystemUIFont) {
      document.body.classList.add('system-fonts')
    } else {
      document.body.classList.remove('system-fonts')
    }
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tc // this does nothing, but without it eslint will complain, and if we followed eslint the code would not behave as it should.
    return getComputedStyle(document.firstElementChild as Element)
      .getPropertyValue(css_var_name)
      .trim()
  }, [tc, css_var_name])
  return result
}
