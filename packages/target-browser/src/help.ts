import express, { Router } from 'express'
import { DIST_DIR } from './config'
import { join } from 'path'
import resolvePath from 'resolve-path'
import { stat } from 'fs/promises'

export const helpRoute = Router()

const helpDir = join(DIST_DIR, '/help')

helpRoute.get('/help', express.static(helpDir))

helpRoute.get('/help_exists/:lang', async (req, res) => {
  const filePath = resolvePath(helpDir, `${req.params.lang}/help.html`)

  try {
    // test if file exists
    await stat(filePath)
    return res.status(200).json({ msg: 'File Found' })
  } catch (_error) {
    return res.status(404).json({ msg: '404 Not Found' })
  }
})
