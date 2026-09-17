import { existsSync } from 'fs'
import { readdir } from 'fs/promises'
import { dirname, join } from 'path'

import { getLogger } from '@deltachat-desktop/shared/logger.js'

const log = getLogger('main/legacy_account_data')

async function hasAccountFolder(path: string): Promise<boolean> {
  try {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        existsSync(join(path, entry.name, 'db.sqlite'))
      ) {
        return true
      }
    }
  } catch (error) {
    log.debug(`could not read "${path}"`, error)
  }
  return false
}

/**
 * Detects profiles that were stored in one of the folder layouts used before
 * Delta Chat Desktop 1.22, which the account manager of the current core
 * cannot open.
 *
 * @returns the folder containing the old profiles, or `undefined` if there
 * are none
 */
export async function findLegacyAccountData(
  accountsPath: string
): Promise<string | undefined> {
  if (existsSync(join(accountsPath, 'accounts.toml'))) {
    return undefined
  }

  // accounts in "<config>/accounts/<account>/db.sqlite" without accounts.toml
  if (await hasAccountFolder(accountsPath)) {
    return accountsPath
  }

  // even older: accounts in "<config>/<account>/db.sqlite"
  const configPath = dirname(accountsPath)
  if (await hasAccountFolder(configPath)) {
    return configPath
  }

  return undefined
}
