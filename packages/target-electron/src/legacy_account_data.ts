import { existsSync } from 'fs'
import { readdir } from 'fs/promises'
import { dirname, join } from 'path'

import { getLogger } from '@deltachat-desktop/shared/logger.js'

const log = getLogger('main/legacy_account_data')

export type LegacyAccountData = {
  /** folder holding the old profiles */
  path: string
  /**
   * Core refuses to initialize a folder that has files but no accounts.toml,
   * so the old data has to be moved here before the app can start.
   */
  moveTo?: string
}

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

function unusedPath(basePath: string): string {
  let path = basePath
  for (let i = 2; existsSync(path); i++) {
    path = `${basePath}_${i}`
  }
  return path
}

/**
 * Detects profiles that were stored in one of the folder layouts used before
 * Delta Chat Desktop 1.22, which the account manager of the current core
 * cannot open.
 */
export async function findLegacyAccountData(
  accountsPath: string
): Promise<LegacyAccountData | undefined> {
  if (existsSync(join(accountsPath, 'accounts.toml'))) {
    return undefined
  }

  // accounts in "<config>/accounts/<account>/db.sqlite" without accounts.toml
  if (await hasAccountFolder(accountsPath)) {
    return { path: accountsPath, moveTo: unusedPath(`${accountsPath}_old`) }
  }

  // even older: accounts in "<config>/<account>/db.sqlite", next to the
  // accounts folder that core creates, so they are not in the way
  const configPath = dirname(accountsPath)
  if (await hasAccountFolder(configPath)) {
    return { path: configPath }
  }

  return undefined
}
