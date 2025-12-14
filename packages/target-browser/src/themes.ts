import { basename, join } from 'path'
import { DIST_DIR } from './config'
import { readdir, readFile } from 'fs/promises'

import { Theme } from '@deltachat-desktop/shared/shared-types'
import { getLogger } from '@deltachat-desktop/shared/logger'
import {
  HIDDEN_THEME_PREFIX,
  parseThemeMetaData,
} from '@deltachat-desktop/shared/themes'

const log = getLogger('main/themes')

const dc_theme_dir = join(DIST_DIR, 'themes')

export async function readThemeDir(
  path: string = dc_theme_dir,
  prefix: string = 'dc'
): Promise<Theme[]> {
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
