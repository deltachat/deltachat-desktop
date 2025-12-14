/* eslint-disable no-console */
//@ts-check
import { describe } from 'mocha'
import { expect } from 'chai'
import { existsSync, mkdtempSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'
import { tmpdir } from 'os'
import { readdir } from 'fs/promises'
import { migrateAccountsIfNeeded } from '../src/deltachat/migration'
import { getLogger, setLogHandler } from '@deltachat-desktop/shared/logger'
import { startDeltaChat } from '@deltachat/stdio-rpc-server'
import { RC_Config } from '@deltachat-desktop/shared/shared-types'

const __dirname = dirname(fileURLToPath(import.meta.url))

const log = getLogger('test')

before(async () => {
  if (process.env['DEBUG']) {
    setLogHandler(console.debug, {
      'log-debug': process.env['DEBUG'] == '2',
    } as RC_Config)
  } else {
    setLogHandler(() => {}, {} as RC_Config)
  }
})

const zip = new AdmZip(join(__dirname, '../test_data/migration-test-data.zip'))

// make test environment
const testEnvironment = mkdtempSync(join(tmpdir(), 'deltachat-migration-test-'))

zip.extractAllTo(testEnvironment)

log.debug({ testEnvironment })

const versions = await readdir(testEnvironment)

/** the test data for these versions is broken, like only one account */
const BROKEN_TEST_DATA = [
  'DeltaChat-1.3.1.AppImage',
  'DeltaChat-1.3.3.AppImage',
]

describe('/electron/main/account-migration', async () => {
  for (const version of versions) {
    const versionPath = join(testEnvironment, version)

    if (BROKEN_TEST_DATA.includes(version)) {
      continue
    }

    it(`migration from ${version} works`, async () => {
      const targetFolder = join(versionPath, 'DeltaChat/accounts')
      log.info({ targetFolder })

      log.debug(
        { targetFolder },
        await readdir(versionPath, { recursive: true })
      )

      // run migration function on environment
      if (!existsSync(join(targetFolder, 'accounts.toml'))) {
        const migrated = await migrateAccountsIfNeeded(targetFolder, log, true)
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(migrated).to.be.true
      } else {
        log.debug(
          'accounts.toml already exists, the migration from absolute paths to relative ones should happen on normal start'
        )
      }

      // test after migration if both accounts are there
      const eventLogger = (accountId: number, event: any) =>
        log.debug('core-event', { accountId, ...event })
      const tmpDC = await startDeltaChat(targetFolder, {
        disableEnvPath: true,
        muteStdErr:
          process.env['DEBUG'] === undefined ||
          process.env['RUST_LOG'] === undefined,
      })
      tmpDC.on('ALL', eventLogger)
      after(() => {
        tmpDC.off('ALL', eventLogger)
        tmpDC.close()
      })

      log.debug('test if migration worked')

      const accounts = await tmpDC.rpc.getAllAccounts()
      const configured_accounts = accounts.filter(
        acc => acc.kind === 'Configured'
      )
      expect(configured_accounts).to.have.length(2)

      // check if the account email addresses are correct
      expect(
        configured_accounts.map(acc => acc.kind === 'Configured' && acc.addr)
      ).to.have.members(['tmpy.mh3we@testrun.org', 'tmpy.3ftgt@testrun.org'])

      log.debug('test done')
    })

    // remove test environment
  }
})
