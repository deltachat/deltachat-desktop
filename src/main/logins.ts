import { join, basename } from 'path'
import fs from 'fs-extra'
//@ts-ignore
import DeltaChat, { C } from 'deltachat-node'
import { getLogger } from '../shared/logger'
const log = getLogger('main/logins')
import { getAccountsPath, getConfigPath } from './application-constants'
import { DeltaChatAccount } from '../shared/shared-types'

export async function getLogins(): Promise<DeltaChatAccount[]> {
  // search for old accounts and convert them
  await migrate(getConfigPath())

  // list new accounts
  const accounts = await readDeltaAccounts(getAccountsPath())
  log.debug('Found following accounts:', accounts)

  const orphanedAccounts = await findInvalidDeltaAccounts()
  if (orphanedAccounts.length > 0) {
    log.info(
      'unconfigured, likely orphaned accounts, you may delete them',
      orphanedAccounts
    )
  }
  return accounts
}

async function migrate(dir: string) {
  const oldAccounts = await readDeltaAccounts(dir)

  if (oldAccounts.length > 0) {
    log.info('Old accounts detected, trying to move them', oldAccounts)
    for (const account of oldAccounts) {
      try {
        await fs.move(
          join(dir, basename(account.path)),
          join(dir, '/accounts/', basename(account.path))
        )
      } catch (error) {
        log.error('Moving failed', error)
        continue
      }
    }
    log.info(`moved ${oldAccounts.length} accounts to accounts folder`)
  }
}

export async function getAccountInfo(path: string): Promise<DeltaChatAccount> {
  try {
    const config = await getConfig(path, [
      'addr',
      'displayname',
      'profileImage',
      'color',
    ])

    if (!config) {
      throw new Error(
        'Account is not configured, it is likely an orphaned account (artifact of a failed login in older versions)'
      )
    }

    if (typeof config.addr !== 'string') {
      // this can be old temp accounts or accounts that somehow lost their addr, what should we do with them?
      throw new Error('Account has no address defined')
    }

    return {
      path,
      displayname: config.displayname,
      addr: config.addr,
      size: await _getAccountSize(path),
      profileImage: config.profileImage,
      color: config.color,
    }
  } catch (error) {
    log.error(`Account ${path} is inaccessible`, error?.message, error)
    return null
  }
}

async function readDeltaAccounts(accountFolderPath: string) {
  const paths = (await fs.readdir(accountFolderPath)).map(filename =>
    join(accountFolderPath, filename)
  )
  const accountFolders = paths.filter(path => {
    // isDeltaAccountFolder
    return (
      fs.existsSync(join(path, 'db.sqlite')) &&
      !fs.lstatSync(path).isSymbolicLink()
    )
  })

  return (await Promise.all(accountFolders.map(getAccountInfo))).filter(
    accounts => accounts !== null
  )
}

async function findInvalidDeltaAccounts() {
  const paths = (await fs.readdir(getAccountsPath())).map(filename =>
    join(getAccountsPath(), filename)
  )
  const accountFolders = paths.filter(path => {
    // isDeltaAccountFolder
    return (
      fs.existsSync(join(path, 'db.sqlite')) &&
      !fs.lstatSync(path).isSymbolicLink()
    )
  })

  const isConfigured = async (dir: string) => {
    const dc = new DeltaChat()
    await dc.open(dir, false)
    const isConfigured = dc.isConfigured()
    dc.close()
    return { isConfigured, path: dir }
  }

  return (await Promise.all(accountFolders.map(isConfigured)))
    .filter(({ isConfigured }) => !isConfigured)
    .map(({ path }) => path)
}

async function getConfig(
  dir: string,
  keys: string[]
): Promise<{ [key: string]: string }> {
  const dc = new DeltaChat()
  await dc.open(dir, false)
  let config: { [key: string]: string } = {}
  if (!dc.isConfigured()) {
    config = null
  } else {
    keys.forEach((key: string) => {
      config[key] = dc.getConfig(key)
    })
    if (keys.includes('profileImage')) {
      config['profileImage'] = dc
        .getContact(C.DC_CONTACT_ID_SELF)
        .getProfileImage()
    }
    if (keys.includes('color')) {
      config['color'] = dc.getContact(C.DC_CONTACT_ID_SELF).color
    }
  }
  dc.close()
  return config
}

async function _getAccountSize(path: string) {
  const db_size = (await fs.stat(join(path, 'db.sqlite'))).size
  const blob_files = await fs.readdir(join(path, 'db.sqlite-blobs'))
  let blob_size = 0
  if (blob_files.length > 0) {
    const blob_file_sizes = await Promise.all(
      blob_files.map(
        async blob_file =>
          (await fs.stat(join(path, 'db.sqlite-blobs', blob_file))).size
      )
    )
    blob_size = blob_file_sizes.reduce(
      (totalSize, currentBlobSize) => totalSize + currentBlobSize
    )
  }

  return db_size + blob_size
}

export async function removeAccount(accountPath: string) {
  const account = (await getLogins()).find(({ path }) => accountPath === path)
  if (!account) {
    throw new Error('Removing account failed: Account not found')
  } else if (!(await fs.pathExists(account.path))) {
    log.error('Removing account failed: path does not exist', account)
    throw new Error(
      'Removing account failed: path does not exist: ' + account.path
    )
  }
  await fs.remove(account.path)
}

export function getNewAccountPath() {
  let init_count = fs.readdirSync(getAccountsPath()).length

  const constructName = (num: number) =>
    join(getAccountsPath(), 'ac' + String(num))

  while (fs.pathExistsSync(constructName(init_count))) {
    init_count++
  }

  return constructName(init_count)
}
