import rc from 'rc'
import { parseArgs } from 'node:util'
import type { RC_Config } from '@deltachat-desktop/shared/shared-types.js'

type ElectronRcConfig = RC_Config & {
  /** Linux: access the camera through PipeWire (xdg-desktop-portal) */
  'pipewire-camera': boolean
}

const defaults: ElectronRcConfig = {
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
  'pipewire-camera': false,
}

// When started as `electron <app path> …` (devmode, or distributions that ship
// a shared electron binary) argv[1] is the app path, in packaged builds it is
// already the first argument.
// `--` ends Chromium's switch parsing (autostart entries use `-- --minimized`),
// but our own flags must still be read after it.
const { values: argv } = parseArgs({
  args: process.argv
    .slice(process.defaultApp ? 2 : 1)
    .filter(arg => arg !== '--'),
  strict: false,
  options: { theme: { type: 'string' } },
})
// pass the parsed arguments to rc along with the defaults
const config = rc('DeltaChat', defaults, argv) as ElectronRcConfig

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
