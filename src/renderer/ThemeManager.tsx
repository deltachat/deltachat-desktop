import { DeltaBackend } from './delta-remote'
import { Theme } from '../shared/shared-types'
import { ipcBackend } from './ipc'

export namespace ThemeManager {
  let currentThemeMetaData: Theme

  export async function refresh() {
    const theme: {
      theme: Theme
      data: string
    } = await DeltaBackend.call('extras.getActiveTheme')
    if (theme) {
      currentThemeMetaData = theme.theme
      window.document.getElementById('theme-vars').innerText = theme.data
    }
  }

  ipcBackend.on('theme-update', _e => refresh())
  refresh()

  export function getCurrentThemeMetaData() {
    return currentThemeMetaData
  }
}
