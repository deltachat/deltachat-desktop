import { LocalStorage } from 'node-localstorage'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Directories & Files
export const DIST_DIR = join(__dirname)
export const DATA_DIR = join(__dirname, '../data')
export const LOGS_DIR = join(DATA_DIR, 'logs')
export const PRIVATE_CERTIFICATE_KEY = join(
  DATA_DIR,
  'certificate/cert.key.pem'
)
export const PRIVATE_CERTIFICATE_CERT = join(DATA_DIR, 'certificate/cert.pem')
export const DC_ACCOUNTS_DIR = join(DATA_DIR, 'accounts')

export const LOCALES_DIR = join(__dirname, '../../../_locales')

// ENV Vars
export const ENV_WEB_PASSWORD = process.env['WEB_PASSWORD']
export const ENV_WEB_PORT = process.env['WEB_PORT'] || 3000
// set this to one if you use this behind a proxy
export const ENV_WEB_TRUST_FIRST_PROXY = Boolean(
  process.env['WEB_TRUST_FIRST_PROXY']
)

if (!existsSync(DATA_DIR)) {
  /* ignore-console-log */
  console.log(
    '\n[ERROR]: Data dir does not exist, make sure you follow the steps in the Readme file\n'
  )
  process.exit(1)
}

mkdirSync(LOGS_DIR, { recursive: true })

if (!existsSync(PRIVATE_CERTIFICATE_KEY)) {
  /* ignore-console-log */
  console.log(
    `\n[ERROR]: Certificate at "${PRIVATE_CERTIFICATE_KEY}" not exist, make sure you follow the steps in the Readme file\n`
  )
  process.exit(1)
}

if (!ENV_WEB_PASSWORD) {
  /* ignore-console-log */
  console.log(
    `\n[ERROR]: Environment Variable WEB_PASSWORD is not set. You need to set it.\n`
  )
  process.exit(1)
}

export const localStorage = new LocalStorage(
  join(DATA_DIR, 'browser-runtime-data')
)
