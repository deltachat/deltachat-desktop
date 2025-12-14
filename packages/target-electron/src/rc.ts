import rc from 'rc'
import type { RC_Config } from '../../shared/shared-types.js'

const defaults: RC_Config = {
  'log-debug': false,
  'log-to-console': false,
  'machine-readable-stacktrace': false,
  theme: undefined,
  devmode: false,
  'translation-watch': false,
  'theme-watch': false,
  minimized: false,
  version: false,
  v: false,
  help: false,
  h: false,
  'allow-unsafe-core-replacement': false,
}

const config = rc('DeltaChat', defaults) as RC_Config

if (config.version || config.v) {
  config.version = true
}

if (config.help || config.h) {
  config.help = true
}

if (config.devmode) {
  config['log-debug'] = true
  config['log-to-console'] = true
}

const rc_config = Object.freeze(config)

export default rc_config
