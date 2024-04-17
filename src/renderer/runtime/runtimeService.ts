import { Runtime } from './RuntimeInterface'
import { Electron } from './Electron'
import { Browser } from './Browser'

/**
 * only Electron is implemented so far
 */
const IS_ELECTRON = true

export const RuntimeService: Runtime = IS_ELECTRON
  ? new Electron()
  : new Browser()
;(window as any).r = RuntimeService
