import appConfig from './application-config'
import { dirname, join } from 'path'

export function appIcon () {
  // TODO Add .ico file for windows
  return join(__dirname, '..', 'images', 'deltachat.png')
}

export function windowDefaults () {
  const headerHeight = 38
  const messageHeight = 100
  return {
    bounds: {
      width: 500,
      height: headerHeight + messageHeight * 6
    },
    headerHeight,
    minWidth: 450,
    minHeight: 450,
    main: `file://${join(__dirname, '..', '..', 'html-dist', 'main.html')}`
  }
}

export function getConfigPath () {
  return dirname(appConfig.filePath)
}

export function getLogsPath () {
  return join(getConfigPath(), 'logs')
}

export function getAccountsPath () {
  return join(getConfigPath(), 'accounts')
}