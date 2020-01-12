import rc from 'rc';

export interface RC_Config {
  'log-debug': boolean
  'log-to-console': boolean
  'machine-readable-stacktrace': boolean
}

const defaults:RC_Config = {
  'log-debug': false,
  'log-to-console': false,
  'machine-readable-stacktrace': false
}

const rc_config = Object.freeze(rc('DeltaChat', defaults) as RC_Config)

export default rc_config
