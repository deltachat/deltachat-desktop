import rc from 'rc';
import { RC_Config } from '../shared/shared-types';

const defaults:RC_Config = {
  'log-debug': false,
  'log-to-console': false,
  'machine-readable-stacktrace': false
}

const rc_config = Object.freeze(rc('DeltaChat', defaults) as RC_Config)

export default rc_config
