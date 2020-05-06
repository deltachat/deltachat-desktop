import { render } from 'sass'
import { readFile, existsSync, watchFile, readdir } from 'fs-extra'
import { join, basename } from 'path'
import { Theme } from '../shared/shared-types'
import { getCustomThemesPath } from './application-constants'
import { app as rawApp, systemPreferences } from 'electron'
import { ExtendedAppMainProcess } from './types'
import * as mainWindow from './windows/main'

const app = rawApp as ExtendedAppMainProcess

import { getLogger } from '../shared/logger'
const log = getLogger('main/themes')

const dc_theme_dir = join(__dirname, '../../themes')

function parseThemeMetaData(
  rawTheme: string
): { name: string; description: string } {
  const meta_data_block = /.theme-meta {([^]*)}/gm.exec(rawTheme)[1].trim()

  const regex = /--(\w*): ?['"]([^]*?)['"];?/gi

  let meta: { [key: string]: string } = {}

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

async function readThemeDir(path: string, prefix: string): Promise<Theme[]> {
  let files = await readdir(path)
  return Promise.all(
    files
      .filter(f => f.includes('.scss') && f.charAt(0) !== '_')
      .map(async f => {
        const theme_meta = parseThemeMetaData(
          await readFile(join(path, f), 'utf-8')
        )
        return {
          name: theme_meta.name,
          description: theme_meta.description,
          address: prefix + ':' + basename(f, '.scss'),
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
  const rawTheme = await readFile(effective_path, 'utf-8')
  let themedata
  let theme_meta: ReturnType<typeof parseThemeMetaData>

  log.debug('render theme data')
  // we could cache the rendered theme, but is worth it?, because file operations are slow too.
  themedata = await renderTheme(rawTheme)
  theme_meta = parseThemeMetaData(rawTheme)
  log.debug('render theme data for theme:', theme_meta)
  return {
    theme: {
      name: theme_meta.name,
      description: theme_meta.description,
      address: theme_address,
    },
    data: themedata,
  }
}

async function renderTheme(rawTheme: string): Promise<string> {
  return await new Promise((res, rej) => {
    render(
      {
        data: rawTheme,
        outputStyle: 'compressed',
        includePaths: [join(__dirname, '../../themes')],
      },
      (err, result) => {
        if (err) rej(err)
        else res(result.css.toString('utf-8'))
      }
    )
  })
}

function systemDefault() {
  if (systemPreferences.isDarkMode()) {
    return ['dc', 'dark']
  } else {
    return ['dc', 'light']
  }
}

export function resolveThemeAddress(address: string): string {
  const addressParts =
    address != 'system' ? address.split(':') : systemDefault()
  var realPath = ''
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
    addressParts[1].replace(/\/|\\|../g, '') + '.scss'
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
      log.error('theme not found', { error, path: app.rc['theme'] })
      process.exit() // user specied a theme via cli argument so we should fail if this fails
    }
    app.state.saved.activeTheme = app.rc['theme']
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
}
