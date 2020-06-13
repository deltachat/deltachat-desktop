import appConfig from './application-config'
import { dirname, join } from 'path'
import { screen } from 'electron'

export function appIcon() {
  // TODO Add .ico file for windows
  return join(__dirname, '..', 'images', 'deltachat.png')
}

export function windowDefaults() {
  let targetFile = 'main.html'
  let defaultWidth = 1000
  if (process.env.NODE_ENV === 'test') {
    targetFile = 'test.html'
    defaultWidth = 1100
  }
  const {height:screenHeight, width:screenWidth } = screen.getPrimaryDisplay().workAreaSize
  const headerHeight = 38
  const defaultHeigth = Math.min(700 + headerHeight, screenHeight)
  
  const x = (screenWidth - defaultWidth) / 2
  const y = (screenHeight - defaultHeigth) / 2

  return {
    bounds: {
      height: defaultHeigth,
      width: defaultWidth,
      x,
      y
    },
    headerHeight,
    minWidth: 450,
    minHeight: 450,
    main: `file://${join(__dirname, '..', '..', 'html-dist', targetFile)}`,
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
