import { platform } from 'os'
import { join } from 'path'
import { app } from 'electron'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export let appx = false

export async function initIsWindowsStorePackageVar() {
  if (platform() === 'win32') {
    const app_path = app.getAppPath()
    try {
      const info = JSON.parse(
        await readFile(
          join(app_path, '../../', 'windows_build_info.json'),
          'utf-8'
        )
      )
      if (info.isAPPX) {
        // eslint-disable-next-line no-console
        console.info('App is probably running as appx')
        appx = info.isAPPX
      }
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.warn(
        'Could not fetch windows build info, this is normal in dev mode'
      )
    }
  }
}

/**
 * if installed as an appx package the config folder
 * core sees only the relative part as path
 * without the Packages/package_id/LocalCache part
 * but that path is needed if client tries to open
 * such a folder
 */
export function mapPackagePath(path: string) {
  const basePath = 'AppData\\Local\\DeltaChat'
  const packagePath =
    'AppData\\Local\\Packages\\merlinux.DeltaChat_v2ry5hvxhdhyy\\LocalCache\\Local\\DeltaChat'
  if (appx && path.indexOf(basePath) > -1) {
    // only test for packagePath is reliable here, for basePath
    // existsSync might return true even if it not exists!
    const transformedPath = path.replace(basePath, packagePath)
    if (existsSync(transformedPath)) {
      return transformedPath
    }
  }
  return path
}

export function getAppxPath(app_folder: string) {
  return join(
    app_folder,
    '../Packages/merlinux.DeltaChat_v2ry5hvxhdhyy/LocalCache/Local/DeltaChat'
  )
}
