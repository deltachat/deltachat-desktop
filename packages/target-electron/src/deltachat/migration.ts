// When you change this file, then run `pnpm migration-test` afterwards
// to ensure that it still works with all old formats

import { startDeltaChat } from '@deltachat/stdio-rpc-server'
import { existsSync, lstatSync } from 'fs'
import { join } from 'path'
import { Logger } from '../../../shared/logger.js'
import { mkdir, readdir, rename, rm, rmdir, stat } from 'fs/promises'
import type { DcEvent, RawClient } from '@deltachat/jsonrpc-client'

/**
 *
 * @param cwd
 * @param log
 * @param treatFailedMigrationAsError used for the automated testing
 * @returns {Promise<boolean>} whether something was migrated
 */
export async function migrateAccountsIfNeeded(
  cwd: string,
  log: Logger,
  treatFailedMigrationAsError: boolean = false
): Promise<boolean> {
  let tmpDC
  const eventLogger = (accountId: number, event: DcEvent) =>
    log.debug('core-event', { accountId, ...event })
  try {
    const new_accounts_format = existsSync(join(cwd, 'accounts.toml'))
    if (new_accounts_format) {
      log.debug('migration not needed: accounts.toml already exists')
      return false
    }

    log.debug('accounts.toml not found, checking if there is previous data')

    const configPath = join(cwd, '..')

    const accountFoldersFormat1 = (await readdir(configPath)).filter(
      folderName => {
        const path = join(configPath, folderName)
        // isDeltaAccountFolder
        try {
          const db_path = join(path, 'db.sqlite')
          return (
            lstatSync(path).isDirectory() &&
            existsSync(db_path) &&
            lstatSync(db_path).isFile() &&
            !lstatSync(path).isSymbolicLink()
          )
        } catch (error) {
          log.debug('error while testing if folder is account', error)
          return false
        }
      }
    )

    const migrateFromFormat1 = accountFoldersFormat1.length !== 0
    const migrateFromFormat2 = existsSync(cwd)

    if (!migrateFromFormat1 && !migrateFromFormat2) {
      log.info('migration not needed: nothing to migrate')
      return false
    }

    // this is the same as cwd, but for clarity added ../accounts
    const path_accounts = join(cwd, '..', 'accounts')
    const pathAccountsOld = join(cwd, '..', 'accounts_old')

    if (migrateFromFormat2) {
      log.info(`found old some accounts (format 2), we need to migrate...`)

      // First, rename accounts folder to accounts_old
      await rename(path_accounts, pathAccountsOld)
    }

    // Next, create temporary account manager to migrate accounts
    tmpDC = await startDeltaChat(path_accounts, {
      muteStdErr: false,
    })
    tmpDC.on('ALL', eventLogger)

    const oldFoldersToDelete = []

    if (migrateFromFormat1) {
      log.info(
        `found old ${accountFoldersFormat1.length} legacy accounts (1), we need to migrate...`
      )

      // Next, iterate over all folders in accounts_old
      for (const folder of accountFoldersFormat1) {
        log.debug(`migrating legacy account "${folder}"`)
        const pathDBFile = join(configPath, folder, 'db.sqlite')

        // fix import account without blobs folder (not all of them are unconfigured it seems)
        const blobsFolder = join(configPath, folder, 'db.sqlite-blobs')
        if (!existsSync(blobsFolder)) {
          await mkdir(blobsFolder, { recursive: true })
        }

        try {
          await tmpDC.rpc.migrateAccount(pathDBFile)
          oldFoldersToDelete.push(folder)
        } catch (error) {
          log.error(`Failed to migrate account at path "${pathDBFile}"`, error)
          if (treatFailedMigrationAsError) {
            throw error
          }
        }
      }
    }

    if (migrateFromFormat2) {
      // Next, iterate over all folders in accounts_old
      for (const entry of await readdir(pathAccountsOld)) {
        const stat_result = await stat(join(pathAccountsOld, entry))
        if (!stat_result.isDirectory()) continue
        log.debug(`migrating account "${join(pathAccountsOld, entry)}"`)
        const path_dbfile = join(pathAccountsOld, entry, 'db.sqlite')
        if (!existsSync(path_dbfile)) {
          log.warn(
            'found an old accounts folder without a db.sqlite file, skipping'
          )
          continue
        }

        // fix import account without blobs folder (not all of them are unconfigured)
        const blobsFolder = join(pathAccountsOld, entry, 'db.sqlite-blobs')
        if (!existsSync(blobsFolder)) {
          await mkdir(blobsFolder, { recursive: true })
        }
        try {
          const account_id = await tmpDC.rpc.migrateAccount(path_dbfile)
          // check if there are stickers
          const old_sticker_folder = join(pathAccountsOld, entry, 'stickers')
          if (existsSync(old_sticker_folder)) {
            log.debug('found stickers, migrating them', old_sticker_folder)
            try {
              const blobdir = await tmpDC.rpc.getBlobDir(account_id)
              if (!blobdir) {
                throw new Error('blobdir is undefined')
              }
              const new_sticker_folder = join(blobdir, '../stickers')
              await rename(old_sticker_folder, new_sticker_folder)
            } catch (error) {
              log.error('stickers migration failed', old_sticker_folder, error)
              if (treatFailedMigrationAsError) {
                throw error
              }
            }
          }
          // if successful remove old account folder too
          oldFoldersToDelete.push(join(pathAccountsOld, entry))
        } catch (error) {
          log.error(
            `Failed to migrate account at path "${path_dbfile}":`,
            error
          )
        }
      }
    }
    // cleanup
    tmpDC.off('ALL', eventLogger)
    tmpDC.close()
    for (const oldFolder of oldFoldersToDelete.map(f => join(configPath, f))) {
      try {
        try {
          await rm(join(oldFolder, '.DS_Store'))
        } catch (_error) {
          /* ignore */
        }
        await rmdir(oldFolder)
      } catch (error) {
        log.error('Failed to cleanup old folder:', oldFolder, error)
      }
    }
    log.info('migration completed')

    return true
  } catch (err) {
    tmpDC?.off('ALL', eventLogger)
    tmpDC?.close()
    throw err
  }
}

/**
 * The setting "Delete messages from server" is not
 * editable for chatmail instances anymore since v2.28.0.
 * So it has to be disabled for all chatmail accounts
 */
export async function disableDeleteFromServerConfig(
  rpc: RawClient,
  log: Logger
) {
  // Disable delete_server_after for chatmail accounts
  try {
    const accountIds = await rpc.getAllAccountIds()
    for (const accountId of accountIds) {
      const { is_chatmail, delete_server_after } = await rpc.batchGetConfig(
        accountId,
        ['is_chatmail', 'delete_server_after']
      )
      if (
        is_chatmail === '1' &&
        delete_server_after !== null &&
        delete_server_after !== '0'
      ) {
        log.info(
          `Disabling delete_server_after for chatmail account ${accountId}`
        )
        await rpc.setConfig(accountId, 'delete_server_after', null)
      }
    }
  } catch (error) {
    log.error(
      'Failed to disable delete_server_after for chatmail accounts',
      error
    )
  }
}
