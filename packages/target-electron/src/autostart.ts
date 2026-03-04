import { app } from 'electron'
import { platform } from 'os'
import { writeFile, rm, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'

import { getLogger } from '../../shared/logger.js'
import { appx } from './isAppx.js'
import { AutostartState } from '../../shared/shared-types.js'

const log = getLogger('main/autostart')

function getLinuxAutostartDir(): string {
  // In Flatpak, $XDG_CONFIG_HOME is redirected to the app sandbox even with
  // --filesystem=host. Detect Flatpak and use $HOME directly so the autostart
  // file ends up where the desktop environment can find it.
  const isInsideFlatpak = Boolean(process.env.FLATPAK_ID)
  const configHome = isInsideFlatpak
    ? join(app.getPath('home'), '.config')
    : process.env.XDG_CONFIG_HOME || join(app.getPath('home'), '.config')
  return join(configHome, 'autostart')
}

function getLinuxAutostartFilePath(): string {
  return join(getLinuxAutostartDir(), 'deltachat-desktop.desktop')
}

function getLinuxExecPath(): string {
  // When running as an AppImage, APPIMAGE env var is set to the .AppImage file path
  return process.env.APPIMAGE || process.execPath
}

function escapeDesktopExecArg(arg: string): string {
  const escaped = arg
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
  return `"${escaped}"`
}

/**
 * Extracts the executable path from a Desktop Entry `Exec=` value,
 * stripping any arguments (e.g. `--minimized`) that follow it.
 *
 * Check whether an existing autostart file was created
 * by this installation: after writing the file we may have a different
 * AppImage path or binary location than what was recorded, so we compare
 * only the executable part rather than the full `Exec=` string.
 */
function extractDesktopExecPath(execValue: string): string | null {
  const trimmed = execValue.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('"')) {
    let value = ''
    let escaped = false
    for (let i = 1; i < trimmed.length; i++) {
      const ch = trimmed[i]
      if (escaped) {
        value += ch
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') {
        return value
      }
      value += ch
    }
    return null
  }

  return trimmed.split(/\s+/)[0] || null
}

function getLinuxAutostartRegisteredState(): boolean | null {
  const autostartFile = getLinuxAutostartFilePath()
  if (!existsSync(autostartFile)) return false

  try {
    const content = readFileSync(autostartFile, 'utf-8')
    const execLine = content
      .split(/\r?\n/)
      .find(line => line.startsWith('Exec='))

    if (!execLine) return null

    const execValue = execLine.slice('Exec='.length)
    const execPath = extractDesktopExecPath(execValue)
    if (!execPath) return null

    return execPath === getLinuxExecPath()
  } catch (error) {
    log.warn('Failed to read autostart desktop file', error)
    return null
  }
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
  }
}
