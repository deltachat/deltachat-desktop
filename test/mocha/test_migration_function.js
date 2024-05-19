//@ts-check
import { describe } from 'mocha'
import { expect } from 'chai'
import { existsSync, mkdtempSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'
import { tmpdir } from 'os'
import { readdir } from 'fs/promises'
import { migrateAccountsIfNeeded } from '../../tsc-dist/main/deltachat/migration.js'
import { getLogger, setLogHandler } from '../../tsc-dist/shared/logger.js'
import { startDeltaChat } from '@deltachat/stdio-rpc-server'

//@ts-expect-error
const __dirname = dirname(fileURLToPath(import.meta.url))

const log = getLogger('test')

before(() => {
  if (process.env['DEBUG']) {
    setLogHandler(console.debug, {
      'log-debug': process.env['DEBUG'] == '2',
    })
  } else {
    setLogHandler(() => {}, {})
  }
})

describe('/electron/main/account-migration', async () => {
  const zip = new AdmZip(
    join(__dirname, '../test_data/migration-test-data.zip')
  )
  // make test environment
  const testEnvironment = mkdtempSync(
    join(tmpdir(), 'deltachat-migration-test-')
  )

  zip.extractAllTo(testEnvironment)

  log.debug({ testEnvironment })

  const versions = await readdir(testEnvironment)

  for (const version of versions) {
    const versionPath = join(testEnvironment, version)

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
        expect(migrated).to.be.true
      } else {
        log.debug(
          'accounts.toml already exists, the migration from absolute paths to relative ones should happen on normal start'
        )
      }

      // test after migration if both accounts are there
      const eventLogger = (accountId, event) =>
      log.debug('core-event', { accountId, ...event })
      let tmpDC = await startDeltaChat(targetFolder, {
        skipSearchInPath: true,
        muteStdErr: false,
      })
      tmpDC.on('ALL', eventLogger)

      log.debug('test if migration worked')

      const accounts = await tmpDC.rpc.getAllAccounts()
      const configured_accounts = accounts.filter(acc=>acc.kind === 'Configured')
      expect(configured_accounts).to.have.length(2)

      // TODO: check if the account email addresses are correct

      log.debug('test done')

      tmpDC.off('ALL', eventLogger)
      tmpDC.close()
    })

    // remove test environment
  }
})
