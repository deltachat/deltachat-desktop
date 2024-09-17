import { RC_Config } from '@deltachat-desktop/shared/shared-types'

export const RCConfig: RC_Config = {
  'log-debug': true, // should become real
  'log-to-console': true, // should become real
  'machine-readable-stacktrace': false, // should become real
  devmode: true, // should become real
  theme: undefined, // maybe real
  'theme-watch': false, // maybe real
  'translation-watch': false, // maybe real
  'allow-unsafe-core-replacement': false, //maybe real when we implement it

  // those do not apply to browser
  minimized: false,
  version: false,
  v: false,
  help: false,
  h: false,
}
