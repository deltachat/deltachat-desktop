import {
  app,
  dialog,
  nativeImage,
  shell,
  type BrowserWindow,
  type NativeImage,
} from 'electron'
import { platform } from 'os'
import { access, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'

import { getLogger } from '@deltachat-desktop/shared/logger.js'
import { getWebxdcUri } from '@deltachat-desktop/shared/webxdcUri.js'
import { appIcon, getConfigPath } from './application-constants.js'
import { escapeDesktopExecArg, getLinuxExecCommand } from './autostart.js'
import { appx } from './isAppx.js'

const log = getLogger('main/webxdc-shortcut')

/**
 * Whether shortcuts that open a webxdc app via its `dcwebxdc:` URI
 * can be created on this platform and package format.
 */
export function isWebxdcShortcutSupported(): boolean {
  switch (platform()) {
    case 'linux':
      // Snap's strict confinement prevents writing to ~/.local/share
      return !process.env.SNAP
    case 'win32':
      // Windows Store (APPX) builds can't be started via their executable path
      return !appx
    case 'darwin':
      return true
    default:
      return false
  }
}

/**
 * Whether the user picks the shortcut's location in a save dialog
 * instead of it being added to the app launcher.
 */
export function isWebxdcShortcutSavedViaDialog(): boolean {
  // the Mac App Store sandbox only allows writing to user-selected locations,
  // so ~/Applications can't be used
  return platform() === 'darwin' && process.mas === true
}

type ShortcutOptions = {
  accountId: number
  msgId: number
  /** untrusted, as it contains the app name from the webxdc manifest */
  name: string
  icon?: NativeImage
  /** parent of the save dialog, see `isWebxdcShortcutSavedViaDialog` */
  window: BrowserWindow
}

/**
 * Adds a shortcut to the platform's app launcher that opens the webxdc app,
 * - Linux: desktop entry in ~/.local/share/applications
 * - Windows: .lnk in the start menu and on the desktop
 * - macOS: minimal .app bundle in ~/Applications
 * - Mac App Store: .webloc file at a location the user picks
 *
 * @returns `'added'` if the shortcut was added to the app launcher,
 * `'saved'` if it was saved to the location the user picked,
 * `'canceled'` if the user canceled the save dialog
 */
export async function createWebxdcShortcut({
  accountId,
  msgId,
  name,
  icon,
  window,
}: ShortcutOptions): Promise<'added' | 'saved' | 'canceled'> {
  const shortcut: Shortcut = {
    uri: getWebxdcUri(accountId, msgId),
    id: `${accountId}-${msgId}`,
    // control characters could inject lines into the generated files
    // eslint-disable-next-line no-control-regex
    name: name.replace(/[\x00-\x1f\x7f]/g, ' ').trim() || 'Webxdc',
    icon:
      icon && !icon.isEmpty() ? icon : nativeImage.createFromPath(appIcon()),
  }
  if (isWebxdcShortcutSavedViaDialog()) {
    return (await saveWeblocShortcut(shortcut, window)) ? 'saved' : 'canceled'
  }
  switch (platform()) {
    case 'linux':
      await createLinuxShortcut(shortcut)
      break
    case 'win32':
      await createWindowsShortcut(shortcut)
      break
    case 'darwin':
      await createMacShortcut(shortcut, accountId, msgId)
      break
    default:
      throw new Error(`shortcuts are not supported on ${platform()}`)
  }
  return 'added'
}

type Shortcut = {
  uri: string
  /** unique per webxdc instance, safe to use in file names */
  id: string
  name: string
  icon: NativeImage
}

function getIconDir() {
  return join(getConfigPath(), 'webxdc-shortcut-icons')
}

async function createLinuxShortcut({ uri, id, name, icon }: Shortcut) {
  const iconPath = join(getIconDir(), `${id}.png`)
  await mkdir(getIconDir(), { recursive: true })
  await writeFile(iconPath, fitInto(icon, 256).toPNG())

  // In Flatpak $XDG_DATA_HOME is redirected into the app sandbox,
  // see `getLinuxAutostartDir`
  const dataHome = process.env.FLATPAK_ID
    ? join(app.getPath('home'), '.local', 'share')
    : process.env.XDG_DATA_HOME || join(app.getPath('home'), '.local', 'share')
  const applicationsDir = join(dataHome, 'applications')
  const execCommand = app.isPackaged
    ? getLinuxExecCommand()
    : `${escapeDesktopExecArg(process.execPath)} ${escapeDesktopExecArg(app.getAppPath())}`

  await mkdir(applicationsDir, { recursive: true })
  const desktopFile = join(applicationsDir, `deltachat-webxdc-${id}.desktop`)
  await writeFile(
    desktopFile,
    `[Desktop Entry]
Type=Application
Name=${escapeDesktopString(name)}
Comment=Delta Chat
Exec=${execCommand} ${uri}
Icon=${escapeDesktopString(iconPath)}
Terminal=false
`,
    'utf-8'
  )
  log.info('created webxdc shortcut', desktopFile)
}

// see https://specifications.freedesktop.org/desktop-entry/latest/value-types.html
function escapeDesktopString(value: string): string {
  return value.replace(/\\/g, '\\\\')
}

async function createWindowsShortcut({ uri, id, name, icon }: Shortcut) {
  const iconPath = join(getIconDir(), `${id}.ico`)
  await mkdir(getIconDir(), { recursive: true })
  await writeFile(iconPath, pngToIco(fitInto(icon, 256, true).toPNG()))

  let target = process.execPath
  const args: string[] = []
  if (process.env.PORTABLE_EXECUTABLE_FILE) {
    // process.execPath points to the temporary extraction directory
    target = process.env.PORTABLE_EXECUTABLE_FILE
  } else if (!app.isPackaged) {
    args.push(app.getAppPath())
  }
  args.push(uri)
  const details: Electron.ShortcutDetails = {
    target,
    args: args.map(arg => `"${arg}"`).join(' '),
    description: name,
    icon: iconPath,
    iconIndex: 0,
  }

  const startMenuDir = join(
    app.getPath('appData'),
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs'
  )
  for (const dir of [startMenuDir, app.getPath('desktop')]) {
    const linkPath = await findShortcutPath(dir, name, '.lnk', async path => {
      try {
        return shell.readShortcutLink(path).args === details.args
      } catch {
        return false
      }
    })
    if (!shell.writeShortcutLink(linkPath, details)) {
      throw new Error(`could not write shortcut ${linkPath}`)
    }
    log.info('created webxdc shortcut', linkPath)
  }
}

async function createMacShortcut(
  { uri, name, icon }: Shortcut,
  accountId: number,
  msgId: number
) {
  const bundleId = `chat.delta.desktop.webxdc.a${accountId}.m${msgId}`
  const applicationsDir = join(app.getPath('home'), 'Applications')
  await mkdir(applicationsDir, { recursive: true })
  const bundlePath = await findShortcutPath(
    applicationsDir,
    name,
    '.app',
    async path => {
      const plist = await readFile(
        join(path, 'Contents', 'Info.plist'),
        'utf-8'
      ).catch(() => '')
      return plist.includes(`<string>${bundleId}</string>`)
    }
  )

  let launchCommand: string
  if (app.isPackaged) {
    // `open -a` passes the URI to the running instance via the `open-url` event
    const appBundle = process.execPath.slice(
      0,
      process.execPath.lastIndexOf('.app/') + '.app'.length
    )
    launchCommand = `/usr/bin/open -a ${shellQuote(appBundle)} ${uri}`
  } else {
    launchCommand = `${shellQuote(process.execPath)} ${shellQuote(app.getAppPath())} ${uri}`
  }

  await rm(bundlePath, { recursive: true, force: true })
  await mkdir(join(bundlePath, 'Contents', 'MacOS'), { recursive: true })
  await mkdir(join(bundlePath, 'Contents', 'Resources'), { recursive: true })
  await writeFile(
    join(bundlePath, 'Contents', 'Info.plist'),
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleIdentifier</key>
  <string>${bundleId}</string>
  <key>CFBundleName</key>
  <string>${escapeXml(name)}</string>
  <key>CFBundleDisplayName</key>
  <string>${escapeXml(name)}</string>
  <key>CFBundleExecutable</key>
  <string>launcher</string>
  <key>CFBundleIconFile</key>
  <string>icon.icns</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSUIElement</key>
  <true/>
</dict>
</plist>
`,
    'utf-8'
  )
  await writeFile(
    join(bundlePath, 'Contents', 'MacOS', 'launcher'),
    `#!/bin/sh\nexec ${launchCommand}\n`,
    { encoding: 'utf-8', mode: 0o755 }
  )
  await writeFile(
    join(bundlePath, 'Contents', 'Resources', 'icon.icns'),
    toIcns(icon)
  )
  log.info('created webxdc shortcut', bundlePath)
}

/**
 * Saves a .webloc file, which opens the `dcwebxdc:` URI when double-clicked.
 * It has the generic .webloc icon.
 *
 * @returns `false` if the user canceled the save dialog
 */
async function saveWeblocShortcut(
  { uri, name }: Shortcut,
  window: BrowserWindow
): Promise<boolean> {
  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    defaultPath: join(app.getPath('desktop'), `${toFileName(name)}.webloc`),
    filters: [{ name: 'Web Location', extensions: ['webloc'] }],
  })
  if (canceled || !filePath) {
    return false
  }
  await writeFile(filePath, weblocContent(uri), 'utf-8')
  log.info('saved webxdc shortcut', filePath)
  return true
}

function weblocContent(url: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${escapeXml(url)}</string>
</dict>
</plist>
`
}

/**
 * Returns a path in `dir` for a shortcut named `name`. An existing file is
 * only reused if `isSameShortcut` confirms that it opens the same webxdc app,
 * otherwise a number is appended to the name.
 */
async function findShortcutPath(
  dir: string,
  name: string,
  extension: string,
  isSameShortcut: (path: string) => Promise<boolean>
): Promise<string> {
  const baseName = toFileName(name)
  for (let i = 1; i < 100; i++) {
    const path = join(
      dir,
      (i === 1 ? baseName : `${baseName} (${i})`) + extension
    )
    const exists = await access(path).then(
      () => true,
      () => false
    )
    if (!exists || (await isSameShortcut(path))) {
      return path
    }
  }
  throw new Error(`no free file name for shortcut ${name} in ${dir}`)
}

function toFileName(name: string): string {
  const fileName = name
    .replace(/[<>:"/\\|?*]/g, '_')
    .slice(0, 100)
    // Windows doesn't allow trailing dots and spaces
    .replace(/[. ]+$/, '')
  if (!fileName || /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(fileName)) {
    return `_${fileName}`
  }
  return fileName
}

/**
 * Scales `icon` down to fit into `size`×`size`.
 * With `exact` it is also scaled up.
 */
function fitInto(icon: NativeImage, size: number, exact = false): NativeImage {
  const { width, height } = icon.getSize()
  if (!exact && width <= size && height <= size) {
    return icon
  }
  return icon.resize({ width: size, height: size, quality: 'best' })
}

/** ICO file with a single PNG compressed 256×256 image */
function pngToIco(png: Buffer): Buffer {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // number of images
  header.writeUInt8(0, 6) // width, 0 means 256
  header.writeUInt8(0, 7) // height, 0 means 256
  header.writeUInt8(0, 8) // no color palette
  header.writeUInt8(0, 9) // reserved
  header.writeUInt16LE(1, 10) // color planes
  header.writeUInt16LE(32, 12) // bits per pixel
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(header.length, 18) // offset of the image data
  return Buffer.concat([header, png])
}

/** ICNS file with PNG compressed images, supported since macOS 10.7 */
function toIcns(icon: NativeImage): Buffer {
  const entries = (
    [
      ['ic07', 128],
      ['ic08', 256],
      ['ic09', 512],
    ] as const
  ).map(([type, size]) => {
    const png = fitInto(icon, size, true).toPNG()
    const entryHeader = Buffer.alloc(8)
    entryHeader.write(type, 0, 'ascii')
    entryHeader.writeUInt32BE(entryHeader.length + png.length, 4)
    return Buffer.concat([entryHeader, png])
  })
  const body = Buffer.concat(entries)
  const header = Buffer.alloc(8)
  header.write('icns', 0, 'ascii')
  header.writeUInt32BE(header.length + body.length, 4)
  return Buffer.concat([header, body])
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}
