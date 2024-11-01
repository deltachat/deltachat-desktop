import express, { json as BodyParserJson, Router } from 'express'
import { mkdtemp, writeFile, unlink } from 'fs/promises'
import { basename, join } from 'path'
import { tmpdir } from 'os'
import {
  DesktopSettingsType,
  RC_Config,
  RuntimeInfo,
} from '@deltachat-desktop/shared/shared-types'
import { getDefaultState } from '@deltachat-desktop/shared/state'
import { getLogger } from '@deltachat-desktop/shared/logger'

import { authMiddleWare } from './middlewares'
import { localStorage } from './config'
import { BuildInfo } from './get-build-info'
import { RCConfig } from './rc-config'

const log = getLogger('main/BackendApiRoute')

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
    limit: '500mb',
  }),
  async (req, res) => {
    try {
      const tmpFile: Buffer = req.body
      const filename = basename(req.params.filename)

      const tmppath = await mkdtemp(join(tmpdir(), 'tmp-'))

      const filepath = join(tmppath, filename)
      await writeFile(filepath, tmpFile, 'binary')

      res.status(200).send({ path: filepath })
    } catch (error) {
      log.debug('uploadTempFile: error', {
        error,
        filename: req.params.filename,
      })
      res.status(500).json({ message: 'Failed to create Tempfile' })
    }
  }
)

BackendApiRoute.post(
  '/uploadTempFileB64/:filename',
  express.raw({
    type: () => {
      return true /* Accept all filetypes */
    },
    limit: '500mb',
  }),
  async (req, res) => {
    try {
      const tmpFilebin: Buffer = Buffer.from(req.body.toString(), 'base64')

      const filename = basename(req.params.filename)
      const tmppath = await mkdtemp(join(tmpdir(), 'tmp-'))

      const filepath = join(tmppath, filename)
      await writeFile(filepath, tmpFilebin, 'binary')

      res.status(200).send({ path: filepath })
    } catch (error) {
      res.status(500).json({ message: 'Failed to create Tempfile' })
    }
  }
)

BackendApiRoute.post(
  '/removeTempFile',
  express.raw({
    type: () => {
      return true /* Accept all filetypes */
    },
  }),
  async (req, res) => {
    try {
      const filepath = req.body.toString('utf8')
      if (filepath.includes('tmp') && !filepath.includes('..')) {
        await unlink(filepath)
      }
      res.status(200).json({ status: 'ok' })
    } catch (e) {
      // file doesn't exist, no permissions, etc..
      // full list of possible errors is here
      // http://man7.org/linux/man-pages/man2/unlink.2.html#ERRORS
      log.error(e)
      res.status(500).json({ status: 'error' })
    }
  }
)
  }
)
