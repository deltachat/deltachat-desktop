import appConfig from './application-config.js'
import { dirname, join } from 'path'
import { app, screen } from 'electron'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const AppFilesDir = join(__dirname, '..')

export function appIcon() {
  const iconFormat = process.platform === 'win32' ? '.ico' : '.png'
  return `${join(htmlDistDir(), 'images', 'deltachat' + iconFormat)}`
}

export function htmlDistDir() {
  return join(AppFilesDir, 'html-dist')
}

export function windowDefaults() {
  let targetFile = 'main.html'
  let defaultWidth = 1000
  if (process.env.NODE_ENV === 'test') {
    targetFile = 'test.html'
    defaultWidth = 1100
  }
  const { height: screenHeight, width: screenWidth } =
    screen.getPrimaryDisplay().workAreaSize
  const headerHeight = 38
  // NOTE(maxph): we have a padding of 66px on the left of the buttons
  const defaultHeight = Math.min(802 + headerHeight, screenHeight)

  const x = (screenWidth - defaultWidth) / 2
  const y = (screenHeight - defaultHeight) / 2

  return {
    bounds: {
      height: defaultHeight,
      width: defaultWidth,
      x,
      y,
    },
    headerHeight,
    // On 0.6x zoom Delta Chat and 200x window size it's still somewhat usable,
    // not much is overflowing.
    minWidth: 225,
    minHeight: 125,
    main: targetFile,
    preload: join(htmlDistDir(), 'preload.js'),
  }
}

export function getConfigPath() {
  return dirname(appConfig.filePath)
}

export function getLogsPath() {
  return join(getConfigPath(), 'logs')
}

export function getAccountsPath() {
  return join(getConfigPath(), 'accounts')
}

export function getCustomThemesPath() {
  return join(getConfigPath(), 'custom-themes')
}

// this is used for temporary files (because core expects file paths, can not accept blobs directly yet)
// used when sending file from webxdc and when pasting a file from clipboard
export function getDraftTempDir() {
  return join(app.getPath('temp'), 'chat.delta.desktop-draft')
}

export const supportedURISchemes = [
  'OPENPGP4FPR:',
  'MAILTO:',
  'DCACCOUNT:',
  'DCLOGIN:',
]

/// Files that the main window is allowed access over the file protocol

// folders the renderer need to load resources from
const ALLOWED_RESOURCE_FOLDERS = ['images', 'node_modules', 'html-dist']
// folders the renderer wants to load source files from (when using the devtools)
const ALLOWED_SOURCE_FOLDERS = ['src', 'scss', 'node_modules']

const ALLOWED_CONFIG_FOLDERS = ['background']

export const ALLOWED_STATIC_FOLDERS = [
  ...[...ALLOWED_RESOURCE_FOLDERS, ...ALLOWED_SOURCE_FOLDERS].map(folder =>
    join(AppFilesDir, folder)
  ),
  ...ALLOWED_CONFIG_FOLDERS.map(folder => join(getConfigPath(), folder)),
  getDraftTempDir(),
]

export const ALLOWED_ACCOUNT_FOLDERS = [
  'db.sqlite-blobs' /* can this old name still exist? */,
  'dc.db-blobs',
  'stickers',
]

// folder inside account dir to store files
// temporary when opened in another application
// cleared on app start
export const INTERNAL_TMP_DIR_NAME = 'tmp'
