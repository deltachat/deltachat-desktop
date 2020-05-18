import { join, basename } from 'path'
import fs from 'fs-extra'
import { DeltaChat } from 'deltachat-node'
import { getLogger } from '../shared/logger'
const log = getLogger('main/find_logins')
import { getAccountsPath, getConfigPath } from './application-constants'
import { PromiseType } from '../shared/shared-types'
import { dialog } from 'electron'

function escapeEmailForAccountFolder(path: string) {
  return encodeURIComponent(path).replace(/%/g, 'P')
}

export async function getLogins() {
  // search for old accounts and convert them
  await migrate(getConfigPath())

  // list new accounts
  var accounts = await readDeltaAccounts(getAccountsPath())
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
      try {
        await fs.move(join(dir, basename(account.path)), join(dir, newFolder))
      } catch (error) {
        log.error(
          "Moving failed, make sure you don't have multiple account folders for the same e-mail address!",
          error
        )
        dialog.showErrorBox(
          'Account migration',
          `Migration of ${account.addr} failed,\n` +
            "Please make sure that you don't have multiple account folders for the same e-mail address!\n" +
            'See the logfile for details'
        )
        continue
      }
      // Backwards compatibility for versions older than 0.999.0
      // (doesn't work on windows as symlinks need admin rights there)
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

export type DeltaChatAccount = PromiseType<ReturnType<typeof getAccountInfo>>

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
  return join(getAccountsPath(), escapeEmailForAccountFolder(addr))
}
