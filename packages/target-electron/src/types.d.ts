import { App } from 'electron'
import type { RC_Config } from '@deltachat-desktop/shared/shared-types.js'

export interface ExtendedAppMainProcess extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
}
