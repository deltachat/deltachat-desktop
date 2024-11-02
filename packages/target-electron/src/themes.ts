import { existsSync, watchFile } from 'fs'
import { readFile, readdir } from 'fs/promises'
import { join, basename } from 'path'
import { app as rawApp, ipcMain, nativeTheme } from 'electron'

import { getCustomThemesPath, htmlDistDir } from './application-constants.js'
import { ExtendedAppMainProcess } from './types.js'
import * as mainWindow from './windows/main.js'
import { getLogger } from '../../shared/logger.js'
import { DesktopSettings } from './desktop_settings.js'

import { Theme } from '@deltachat-desktop/shared/shared-types.js'
import {
  HIDDEN_THEME_PREFIX,
  parseThemeMetaData,
} from '@deltachat-desktop/shared/themes'

const app = rawApp as ExtendedAppMainProcess

const log = getLogger('main/themes')

const dc_theme_dir = join(htmlDistDir(), 'themes')

async function readThemeDir(path: string, prefix: string): Promise<Theme[]> {
  const files = await readdir(path)
  return Promise.all(
    files
      .filter(f => f.endsWith('.css') && f.charAt(0) !== '_')
      .map(async f => {
        const address = prefix + ':' + basename(f, '.css')
        const file_content = await readFile(join(path, f), 'utf-8')
        try {
          const theme_meta = parseThemeMetaData(file_content)
          return {
            name: theme_meta.name,
            description: theme_meta.description,
            address,
            is_prototype: f.startsWith(HIDDEN_THEME_PREFIX),
          }
        } catch (error) {
          log.error('Error while parsing theme ${address}: ', error)
          return {
            name: address + ' [Invalid Meta]',
            description: '[missing description]',
            address: prefix + ':' + basename(f, '.css'),
            is_prototype: f.startsWith(HIDDEN_THEME_PREFIX),
          }
        }
      })
  )
}

export async function getAvailableThemes(): Promise<Theme[]> {
  // look at the common places for themes
  return [
    ...(await readThemeDir(dc_theme_dir, 'dc')),
    ...(await readThemeDir(getCustomThemesPath(), 'custom')),
  ]
}

export async function loadTheme(
  theme_address: string
): Promise<{ theme: Theme; data: string }> {
  // load theme file
  const effective_path = resolveThemeAddress(theme_address)
  log.debug('load theme file', theme_address, effective_path)
  const themedata = await readFile(effective_path, 'utf-8')

  log.debug('render theme data')
  const theme_meta = parseThemeMetaData(themedata)
  log.debug('render theme data for theme:', theme_meta)
  return {
    theme: {
      name: theme_meta.name,
      description: theme_meta.description,
      address: theme_address,
      is_prototype: basename(effective_path).startsWith(HIDDEN_THEME_PREFIX),
    },
    data: themedata,
  }
}

function systemDefault() {
  if (nativeTheme.shouldUseDarkColors) {
    return ['dc', 'dark']
  } else {
    return ['dc', 'light']
  }
}

export function resolveThemeAddress(address: string): string {
  const addressParts =
    address != 'system' ? address.split(':') : systemDefault()
  let realPath = ''
  if (addressParts.length != 2)
    throw 'not an theme address, must have the format [location]:[themename]'
  if (addressParts[0] == 'dc') {
    realPath = `${dc_theme_dir}`
  } else if (addressParts[0] == 'custom') {
    realPath = getCustomThemesPath()
  } else {
    throw 'unknown "location", valid locations are dc or custom'
  }
  const result = join(
    realPath,
    addressParts[1].replace(/\/|\\|\.\./g, '') + '.css'
  )

  if (existsSync(result)) {
    return result
  } else {
    throw 'theme ' + address + ' not found at: ' + result
  }
}

export function acceptThemeCLI() {
  if (app.rc['theme']) {
    log.info(`trying to load theme from '${app.rc['theme']}'`)
    try {
      resolveThemeAddress(app.rc['theme'])
    } catch (error) {
      log.error('THEME NOT FOUND', { error, path: app.rc['theme'] })
      throw new Error(
        `THEME "${app.rc['theme']}" NOT FOUND,
this is fatal because the user specified it via cli argument.
If you did not specify this, ask the person which installed deltachat for you to remove the cli argument again.

If they are not available find the shortcut/.desktop file yourself and edit it to not contain the "--theme" argument.
Using --theme is for developers and theme creators ONLY and should not be used by normal users
If you have question or need help, feel free to ask in our forum https://support.delta.chat.`
      )
    }
    DesktopSettings.update({ activeTheme: app.rc['theme'] })
    log.info(`set theme`)
    if (app.rc['theme-watch']) {
      log.info('theme-watch: activated', app.rc['theme-watch'])
      watchFile(resolveThemeAddress(app.rc['theme']), (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          log.info(
            'theme-watch: File changed reminding frontend to reload theme'
          )
          app.ipcReady && mainWindow.send('theme-update')
        }
      })
    }
  }
  nativeTheme.on('updated', () => {
    mainWindow.send('theme-update')
  })
}

ipcMain.handle('themes.getActiveTheme', async () => {
  try {
    log.debug('theme', DesktopSettings.state.activeTheme)
    return await loadTheme(DesktopSettings.state.activeTheme)
  } catch (error) {
    log.error('loading theme failed:', error)
    return null
  }
})

ipcMain.handle('themes.getAvailableThemes', getAvailableThemes)
