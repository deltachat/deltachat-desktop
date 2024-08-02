import { platform } from 'os'
import { join } from 'path'

export const appx = false

export async function isWindowsStorePackage() {
  return platform() === 'win32' && process.windowsStore
}

export function getAppxPath(app_folder: string) {
  return join(
    app_folder,
    '../Packages/merlinux.DeltaChat_v2ry5hvxhdhyy/LocalCache/Local/DeltaChat'
  )
}
