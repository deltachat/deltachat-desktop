import type { RC_Config } from '../shared/shared-types'
import type { App } from 'electron'

export interface ExtendedAppMainProcess extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
}
