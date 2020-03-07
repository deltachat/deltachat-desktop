import { join, basename } from 'path'
import fs from 'fs-extra'
import { DeltaChat } from 'deltachat-node'
import logger from '../shared/logger'
const log = logger.getLogger('main/find_logins')
import { getAccountsPath, getConfigPath } from './application-constants'

function escapeEmailForAccountFolder(path: string) {
  return encodeURIComponent(path).replace(/%/g, 'P')
}

// change this in the future to enable new account format and break compatibility to really old dcversions on windows
const NEW_ACCOUNT_FORMAT = false

export async function getLogins() {
  if (NEW_ACCOUNT_FORMAT) {
    // search for old accounts and convert them
    await migrate(getConfigPath())
  }

  // list new accounts
  var accounts = await readDeltaAccounts(getAccountsPath())
  if (!NEW_ACCOUNT_FORMAT) {
    // search for old accounts and use them
    accounts.push(...(await readDeltaAccounts(getConfigPath())))
  }
  log.debug('Found following accounts:', accounts)
  return accounts
}

async function migrate(dir: string) {
  const oldAccounts = await readDeltaAccounts(dir)

  if (oldAccounts.length > 0) {
    log.info(
      'Old format accounts detected, trying to convert them',
      oldAccounts
    )
    for (const account of oldAccounts) {
      const newFolder = join(
        'accounts',
        escapeEmailForAccountFolder(account.addr)
      )
      await fs.move(join(dir, basename(account.path)), join(dir, newFolder))
      // Backwards compatibility
      try {
        const compatPath = Buffer.from(account.addr).toString('hex')
        log.info(
          'symlink, for backwards compatibility',
          join('./', newFolder),
          join(dir, compatPath)
        )
        await fs.symlink(join('./', newFolder), join(dir, compatPath))
      } catch (error) {
        log.error('symlinking failed', error)
      }
    }
    log.info(`converted ${oldAccounts} accounts to new version`)
  }
}

async function getAccountInfo(path: string) {
  try {
    const config = await getConfig(path)
    if (typeof config.addr !== 'string') {
      throw new Error('Account has no address defined')
    }

    return {
      path,
      addr: config.addr,
    }
  } catch (error) {
    log.error(`Account ${path} is inaccessible`, error)
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

function getConfig(cwd: string): Promise<{ [key: string]: string }> {
  return new Promise((resolve, reject) => {
    DeltaChat.getConfig(cwd, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
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

export function getNewAccountPath(addr: string) {
  if (NEW_ACCOUNT_FORMAT) {
    return join(getAccountsPath(), escapeEmailForAccountFolder(addr))
  } else {
    return join(getConfigPath(), Buffer.from(addr).toString('hex'))
  }
}
