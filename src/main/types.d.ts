import { App } from 'electron'
import { RC_Config } from '../shared/shared-types'

export interface ExtendedAppMainProcess extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
}
