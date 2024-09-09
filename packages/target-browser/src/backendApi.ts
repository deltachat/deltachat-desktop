import { json as BodyParserJson, Router } from 'express'
import { authMiddleWare } from './middlewares'
import {
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
} from '@deltachat-desktop/shared/shared-types'
import { getDefaultState } from '@deltachat-desktop/shared/state'
import { DIST_DIR, localStorage } from './config'
import { readFileSync } from 'fs'
import { join } from 'path'

export const BackendApiRoute = Router()

BackendApiRoute.use(authMiddleWare)

BackendApiRoute.get('/rc_config', (_req, res) => {
  const config: RC_Config = {
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
  res.status(200).json(config)
})

const version = JSON.parse(readFileSync(join(DIST_DIR,'../package.json'), 'utf8')).version

BackendApiRoute.get('/runtime_info', (_req, res) => {
  const runtimeInfo: RuntimeInfo = {
    buildInfo: {
      BUILD_TIMESTAMP: 0,
      GIT_REF: 'dev-browser-version',
      VERSION: version,
    },
    isAppx: false,
    isMac: false, // this has an alternative frameless design
    versions: [],
  }
  res.status(200).json(runtimeInfo)
})

const Config: DesktopSettingsType = {
  ...getDefaultState(),
  ...JSON.parse(localStorage.getItem('config') || '{}'),
}

const allowedKeys = Object.keys(getDefaultState())

BackendApiRoute.get('/config', (_req, res) => {
  res.json(Config)
})

BackendApiRoute.post('/config/:key', BodyParserJson(), (req, res) => {
  let key = req.params.key
  let value = req.body

  if (allowedKeys.includes(key)) {
    ;(Config as any)[key] = value
    localStorage.setItem('config', JSON.stringify(Config))
    res.status(201).send()
  } else {
    res.status(404).send({ message: `config key ${key} is not known` })
  }
})
