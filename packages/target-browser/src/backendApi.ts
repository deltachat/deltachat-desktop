import express, { json as BodyParserJson, Router } from 'express'
import { mkdtemp, writeFile } from 'fs/promises'
import { basename, join } from 'path'
import { tmpdir } from 'os'
import {
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
} from '@deltachat-desktop/shared/shared-types'
import { getDefaultState } from '@deltachat-desktop/shared/state'

import { authMiddleWare } from './middlewares'
import { localStorage } from './config'
import { BuildInfo } from './get-build-info'
import { RCConfig } from './rc-config'

export const BackendApiRoute = Router()

BackendApiRoute.use(authMiddleWare)

BackendApiRoute.get('/rc_config', (_req, res) => {
  res.status(200).json(RCConfig as RC_Config)
})

BackendApiRoute.get('/runtime_info', (_req, res) => {
  const runtimeInfo: RuntimeInfo = {
    buildInfo: BuildInfo,
    isAppx: false,
    isMac: false, // this has an alternative frameless design that we don't want in browser
    target: 'browser',
    versions: [],
  }
  res.status(200).json(runtimeInfo)
})

const Config: DesktopSettingsType = {
  ...getDefaultState(),
  minimizeToTray: false, // does not exist in browser
  ...JSON.parse(localStorage.getItem('config') || '{}'),
}

const allowedKeys = Object.keys(getDefaultState())

BackendApiRoute.get('/config', (_req, res) => {
  res.json(Config)
})

BackendApiRoute.post('/config/:key', BodyParserJson(), (req, res) => {
  const key = req.params.key
  const value = req.body.new_value

  if (allowedKeys.includes(key)) {
    ;(Config as any)[key] = value
    localStorage.setItem('config', JSON.stringify(Config))
    res.status(201).send()
  } else {
    res.status(404).send({ message: `config key ${key} is not known` })
  }
})

BackendApiRoute.post(
  '/uploadTempFile/:filename',
  express.raw({
    type: () => {
      return true /* Accept all filetypes */
    },
    limit: '500mb'
  }),
  async (req, res) => {
    try {
      const tmpFile: Buffer = req.body
      const filename = basename(req.params.filename)

      const tmppath = await mkdtemp(join(tmpdir(), 'tmp-'))

      const filepath = join(tmppath, filename)
      await writeFile(filepath, tmpFile, 'binary')

      res.status(200).send({ path: filepath })
      console.log(tmpFile)
      console.log(filename, tmppath, filepath)
    } catch (error) {
      res.status(500).json({message: 'Failed to create Tempfile'})
    }
  }
)
