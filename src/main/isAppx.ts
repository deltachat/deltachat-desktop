import { platform } from 'os'
import { join } from 'path'
import { app } from 'electron'
import { readFile } from 'fs/promises'

export let appx = false

export async function findOutIfWeAreRunningAsAppx() {
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
        /* ignore-console-log */
        console.info('App is probably running as appx')
        appx = info.isAPPX
      }
    } catch (error) {
      /* ignore-console-log */
      console.warn(
        'Could not fetch windows build info, this is normal in dev mode'
      )
    }
  }
}

export function getAppxPath(app_folder: string) {
  return join(
    app_folder,
    '../Packages/merlinux.DeltaChat_v2ry5hvxhdhyy/LocalCache/Local/DeltaChat'
  )
}
