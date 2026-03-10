import { app } from 'electron'
import { platform } from 'os'
import { writeFile, rm, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

import { getLogger } from '../../shared/logger.js'
import { appx } from './isAppx.js'
import { AutostartState } from '../../shared/shared-types.js'

const log = getLogger('main/autostart')

function getLinuxPackageType(): 'other' | 'appimage' | 'flatpak' {
  if (process.env.APPIMAGE) return 'appimage'
  if (process.env.FLATPAK_ID) return 'flatpak'
  return 'other'
}

function getLinuxAutostartDir(): string {
  // In Flatpak, $XDG_CONFIG_HOME is redirected to the app sandbox even with
  // --filesystem=host. Detect Flatpak and use $HOME directly so the autostart
  // file ends up where the desktop environment can find it.
  // see https://docs.flatpak.org/en/latest/conventions.html#xdg-base-directories
  const isInsideFlatpak = Boolean(process.env.FLATPAK_ID)
  const configHome = isInsideFlatpak
    ? join(app.getPath('home'), '.config')
    : process.env.XDG_CONFIG_HOME || join(app.getPath('home'), '.config')
  return join(configHome, 'autostart')
}

function getLinuxAutostartFilePath(): string {
  const packageType = getLinuxPackageType()
  const suffix = packageType !== 'other' ? `-${packageType}` : ''
  return join(getLinuxAutostartDir(), `deltachat-desktop${suffix}.desktop`)
}

function getLinuxExecPath(): string {
  // When running as an AppImage, APPIMAGE env var is set to the .AppImage file path
  return process.env.APPIMAGE || process.execPath
}

// see https://specifications.freedesktop.org/desktop-entry/latest/exec-variables.html
function escapeDesktopExecArg(arg: string): string {
  const escaped = arg
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
  return `"${escaped}"`
}

function getLinuxAutostartRegisteredState(): boolean {
  const autostartFile = getLinuxAutostartFilePath()
  return existsSync(autostartFile)
}

function getLinuxDesktopFileContent(): string {
  return `[Desktop Entry]
Type=Application
Name=DeltaChat
Comment=Delta Chat email-based messenger
Exec=${escapeDesktopExecArg(getLinuxExecPath())} --minimized
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
`
}

export function getAutostartState(): AutostartState {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin' || currentPlatform === 'win32') {
    if (appx) {
      // Windows Store (APPX) builds manage startup tasks differently
      return { isSupported: false, isRegistered: null }
    }
    const loginItemSettings = app.getLoginItemSettings()
    return {
      isSupported: true,
      isRegistered: loginItemSettings.openAtLogin,
    }
  } else if (currentPlatform === 'linux') {
    if (process.env.SNAP) {
      // Snap's strict confinement prevents writing to ~/.config/autostart/
      return { isSupported: false, isRegistered: null }
    }
    return {
      isSupported: true,
      isRegistered: getLinuxAutostartRegisteredState(),
    }
  }

  return { isSupported: false, isRegistered: null }
}

export async function applyAutostart(enable: boolean): Promise<void> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin' || currentPlatform === 'win32') {
    if (appx) {
      log.warn('Autostart not supported for Windows Store (APPX) builds')
      return
    }
    const loginItemSettings = app.getLoginItemSettings()
    if (loginItemSettings.openAtLogin !== enable) {
      app.setLoginItemSettings({ openAtLogin: enable })
      log.info(`Autostart ${enable ? 'enabled' : 'disabled'}`)
    }
  } else if (currentPlatform === 'linux') {
    if (process.env.SNAP) {
      log.warn('Autostart not supported inside Snap')
      return
    }
    const autostartFile = getLinuxAutostartFilePath()
    const legacyFile = join(getLinuxAutostartDir(), 'deltachat-desktop.desktop')
    try {
      if (enable) {
        await mkdir(getLinuxAutostartDir(), { recursive: true })
        await writeFile(autostartFile, getLinuxDesktopFileContent(), 'utf-8')
        log.info(`Autostart enabled: created ${autostartFile}`)
      } else {
        if (existsSync(autostartFile)) {
          await rm(autostartFile)
          log.info(`Autostart disabled: removed ${autostartFile}`)
        }
      }
      // Clean up legacy autostart file from before per-package-type naming
      if (existsSync(legacyFile) && legacyFile !== autostartFile) {
        await rm(legacyFile)
      }
    } catch (error) {
      log.error(`Failed to ${enable ? 'enable' : 'disable'} autostart`, error)
    }
  }
}
