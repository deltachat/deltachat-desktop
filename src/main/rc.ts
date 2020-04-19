import rc from 'rc'
import { RC_Config } from '../shared/shared-types'

const defaults: RC_Config = {
  'log-debug': false,
  'log-to-console': false,
  'machine-readable-stacktrace': false,
  'multiple-instances': false,
  theme: undefined,
  debug: false,
  'translation-watch': false,
  'theme-watch': false,
}

const config = rc('DeltaChat', defaults) as RC_Config

if (config.debug) {
  config['log-debug'] = true
  config['log-to-console'] = true
}

const rc_config = Object.freeze(config)

export default rc_config
