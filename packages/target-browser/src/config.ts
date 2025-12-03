import { LocalStorage } from 'node-localstorage'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'path'
import { isAbsolute } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = join(__dirname, '../.env')

try {
  process.loadEnvFile?.(envPath)
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(`Failed to load ${envPath}`, error)
}

// Directories & Files
export const DIST_DIR = join(__dirname)
export const DATA_DIR = join(__dirname, '../data')
export const LOGS_DIR = join(DATA_DIR, 'logs')
export const PRIVATE_CERTIFICATE_KEY = join(
  DATA_DIR,
  'certificate/cert.key.pem'
)
export const PRIVATE_CERTIFICATE_CERT = join(DATA_DIR, 'certificate/cert.pem')
export let DC_ACCOUNTS_DIR = join(DATA_DIR, 'accounts')

export const LOCALES_DIR = join(__dirname, '../../../_locales')

// ENV Vars
export const ENV_WEB_PASSWORD = process.env['WEB_PASSWORD']
export const ENV_WEB_PORT = process.env['WEB_PORT'] || 3000 // currently only port 3000 is supported
// set this to one if you use this behind a proxy
export const ENV_WEB_TRUST_FIRST_PROXY = Boolean(
  process.env['WEB_TRUST_FIRST_PROXY']
)

if (process.env['DC_ACCOUNTS_DIR']) {
  if (isAbsolute(process.env['DC_ACCOUNTS_DIR'])) {
    DC_ACCOUNTS_DIR = process.env['DC_ACCOUNTS_DIR']
  } else {
    DC_ACCOUNTS_DIR = join(__dirname, process.env['DC_ACCOUNTS_DIR'])
  }
}

export const NODE_ENV = (process.env['NODE_ENV'] ?? 'production').toLowerCase()

if (!existsSync(DATA_DIR)) {
  // eslint-disable-next-line no-console
  console.log(
    '\n[ERROR]: Data dir does not exist, make sure you follow the steps in the Readme file\n'
  )
  process.exit(1)
}

mkdirSync(LOGS_DIR, { recursive: true })

if (
  !existsSync(PRIVATE_CERTIFICATE_KEY) &&
  !process.env['PRIVATE_CERTIFICATE_KEY']
) {
  // eslint-disable-next-line no-console
  console.log(
    `\n[ERROR]: Certificate at "${PRIVATE_CERTIFICATE_KEY}" not exist, make sure you follow the steps in the Readme file\n`
  )
  process.exit(1)
}

if (!ENV_WEB_PASSWORD && NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.log(
    `\n[ERROR]: Environment Variable WEB_PASSWORD is not set. You need to set it.\n`
  )
  process.exit(1)
}

export const localStorage = new LocalStorage(
  join(DATA_DIR, 'browser-runtime-data')
)
