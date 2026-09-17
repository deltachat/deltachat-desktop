import rc from 'rc'
import type { RC_Config } from '@deltachat-desktop/shared/shared-types.js'

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
  'allow-custom-rpc-server-path': false,
  'allow-unsafe-core-replacement': false,
}

const config = rc('DeltaChat', defaults) as RC_Config

if (config.version || config.v) {
  config.version = true
}

if (config.help || config.h) {
  config.help = true
}

if (config['allow-unsafe-core-replacement']) {
  // eslint-disable-next-line no-console
  console.warn(
    '--allow-unsafe-core-replacement is deprecated, use --allow-custom-rpc-server-path instead'
  )
  config['allow-custom-rpc-server-path'] = true
}

if (config.devmode) {
  config['log-debug'] = true
  config['log-to-console'] = true
}

const rc_config = Object.freeze(config)

export default rc_config
