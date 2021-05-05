import appConfig from './application-config'
import { dirname, join } from 'path'
import { screen } from 'electron'

export function appIcon() {
  const iconFormat = process.platform === 'win32' ? '.ico' : '.png'
  return `${join(__dirname, '..', '..', 'images', 'deltachat' + iconFormat)}`
}

export function htmlDistDir() {
  return join(__dirname, '..', '..', 'html-dist')
}

export function windowDefaults() {
  let targetFile = 'main.html'
  let defaultWidth = 1000
  if (process.env.NODE_ENV === 'test') {
    targetFile = 'test.html'
    defaultWidth = 1100
  }
  const {
    height: screenHeight,
    width: screenWidth,
  } = screen.getPrimaryDisplay().workAreaSize
  const headerHeight = 38
  const defaultHeight = Math.min(700 + headerHeight, screenHeight)

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
    minWidth: 450,
    minHeight: 450,
    main: targetFile,
    preload: join(__dirname, '..', '..', 'html-dist', 'preload.js'),
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

export const supportedURISchemes = [
  'OPENPGP4FPR:',
  'MAILTO:'
]