import { App } from 'electron'
import type { RC_Config } from '../shared/shared-types.ts'

export interface ExtendedAppMainProcess extends App {
  rc: RC_Config
  isQuitting: boolean
  ipcReady: boolean
}
