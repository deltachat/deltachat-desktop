import { protocol, app } from 'electron'
import { join, basename, normalize, sep, extname } from 'path'
import {
  htmlDistDir,
  getAccountsPath,
  getConfigPath,
} from './application-constants'
import { readFile } from 'fs'
import { lookup } from 'mime-types'
import { getLogger } from '../shared/logger'
const log = getLogger('main/internalAppSchemes')

protocol.registerSchemesAsPrivileged([
  { scheme: 'dc', privileges: { standard: true } },
  { scheme: 'dc-blob', privileges: { stream: true } },
  { scheme: 'misc', privileges: { stream: true } },
])

// folders the renderer need to load resources from
const ALLOWED_RESOURCE_FOLDERS = ['images', 'node_modules']
// folders the renderer wants to load source files from (when using the devtools)
const ALLOWED_SOURCE_FOLDERS = ['src', 'scss', 'node_modules']
const ALLOWED_FOLDERS = [...ALLOWED_RESOURCE_FOLDERS, ...ALLOWED_SOURCE_FOLDERS]
const BASE_DIR = join(htmlDistDir(), '../')
const HTML_DIST_DIR = htmlDistDir()

const ACCOUNTS_DIR = getAccountsPath()

app.once('ready', () => {
  protocol.registerBufferProtocol('misc', async (req, cb) => {
    if (req.url.startsWith('misc://background/')) {
      const filename = basename(req.url.replace('misc://background/', ''))
      readFile(join(getConfigPath(), 'background/', filename), (e, b) => {
        if (e) {
          log.warn('error while fetching background image', filename, e)
          cb({ statusCode: 404 })
        } else {
          cb(b)
        }
      })
    } else {
      cb({ statusCode: 400 })
    }
  })
  protocol.registerBufferProtocol('dc-blob', (req, cb) => {
    // check for path escape attempts
    const file = normalize(req.url.replace('dc-blob://', ''))
    if (file.indexOf('..') !== -1) {
      log.warn('path escape prevented', req.url, file)
      return cb({ statusCode: 400 })
    }

    // Fetch Blobfile - make sure its really in a blob dir
    if (!file.split(sep).includes('db.sqlite-blobs')) {
      log.warn(
        'error while fetching blob file - id not inside the blobs directory',
        file
      )
      cb({ statusCode: 400 })
    } else {
      readFile(join(ACCOUNTS_DIR, file.replace('p40', 'P40')), (e, b) => {
        if (e) {
          log.warn('error while fetching blob file', file, e)
          cb({ statusCode: 404 })
        } else {
          cb(b)
        }
      })
    }
  })
  protocol.registerBufferProtocol('dc', (req, cb) => {
    // check for path escape attempts
    let file = normalize(req.url.replace('dc://deltachat/', ''))
    const hashtagIndex = file.indexOf('#')
    if (hashtagIndex !== -1) {
      file = file.slice(0, hashtagIndex)
    }
    if (file.indexOf('..') !== -1) {
      log.warn('path escape prevented', req.url, file)
      return cb({ statusCode: 400 })
    }

    const otherFolder = ALLOWED_FOLDERS.find(folder =>
      file.startsWith(folder + '/')
    )
    const prefix = otherFolder ? BASE_DIR : HTML_DIST_DIR

    // Fetch resource or source
    readFile(join(prefix, file.replace(/:$/, '')), (e, b) => {
      if (e) {
        log.warn('error while fetching resource', file, e)
        cb({ statusCode: 404 })
      } else {
        cb({
          mimeType: lookup(extname(file.replace(/:$/, ''))) || undefined,
          data: b,
        })
      }
    })
  })
})

export default {}
