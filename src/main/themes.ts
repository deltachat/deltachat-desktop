import { existsSync, watchFile } from 'fs'
import { readFile, readdir } from 'fs/promises'
import { join, basename } from 'path'
import { Theme } from '../shared/shared-types'
import { getCustomThemesPath } from './application-constants'
import { app as rawApp, nativeTheme } from 'electron'
import { ExtendedAppMainProcess } from './types'
import * as mainWindow from './windows/main'

const app = rawApp as ExtendedAppMainProcess

import { getLogger } from '../shared/logger'
import { DesktopSettings } from './desktop_settings'
const log = getLogger('main/themes')

const dc_theme_dir = join(__dirname, '../../themes')

function parseThemeMetaData(
  rawTheme: string
): { name: string; description: string } {
  const meta_data_block =
    /.theme-meta ?{([^]*)}/gm.exec(rawTheme)?.[1].trim() || ''

  const regex = /--(\w*): ?['"]([^]*?)['"];?/gi

  const meta: { [key: string]: string } = {}

  let last_result: any = true

  while (last_result) {
    last_result = regex.exec(meta_data_block)
    if (last_result) {
      meta[last_result[1]] = last_result[2]
    }
  }

  // check if name and description are defined
  if (!meta.name || !meta.description) {
    throw new Error(
      'The meta variables meta.name and meta.description must be defined'
    )
  }

  return <any>meta
}

const hidden_theme_prefix = 'dev_'

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
            is_prototype: f.startsWith(hidden_theme_prefix),
          }
        } catch (error) {
          log.error('Error while parsing theme ${address}: ', error)
          return {
            name: address + ' [Invalid Meta]',
            description: '[missing description]',
            address: prefix + ':' + basename(f, '.css'),
            is_prototype: f.startsWith(hidden_theme_prefix),
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
      is_prototype: basename(effective_path).startsWith(hidden_theme_prefix),
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
    DesktopSettings.mutate({ activeTheme: app.rc['theme'] })
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
