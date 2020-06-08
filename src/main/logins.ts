import { join, basename } from 'path'
import fs from 'fs-extra'
//@ts-ignore
import * as binding from 'deltachat-node/binding'
import { getLogger } from '../shared/logger'
const log = getLogger('main/find_logins')
import { getAccountsPath, getConfigPath } from './application-constants'
import { PromiseType } from '../shared/shared-types'

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
    log.info(`moved ${oldAccounts} accounts to accounts folder`)
  }
}

async function getAccountInfo(path: string) {
  try {
    const config = await getConfig(path, ['addr', 'displayname'])
    if (typeof config.addr !== 'string') {
      // this can be old temp accounts or accounts that somehow lost their addr, what should we do with them?
      throw new Error('Account has no address defined')
    }

    return {
      path,
      displayname: config.displayname,
      addr: config.addr,
      size: await _getAccountSize(path),
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

function getConfig(
  dir: string,
  keys: string[]
): Promise<{ [key: string]: string }> {
  return new Promise((resolve, reject) => {
    const dcn_context = binding.dcn_context_new()
    const db = dir.endsWith('db.sqlite') ? dir : join(dir, 'db.sqlite')

    binding.dcn_open(dcn_context, db, '', (err: any) => {
      console.log('opened')

      if (err) {
        console.log(err)
        binding.dcn_close(dcn_context, () => {})
        reject(err)
      }
      let result: { [key: string]: string } = {}
      if (!binding.dcn_is_configured(dcn_context)) {
        result = null
      } else {
        keys.forEach((key: string) => {
          result[key] = binding.dcn_get_config(dcn_context, key)
        })
      }
      console.log('result', result, dcn_context)
      binding.dcn_close(dcn_context, () => {})
      resolve(result)
    })
  })
}

async function _getAccountSize(path: string) {
  const db_size = (await fs.stat(join(path, 'db.sqlite'))).size
  const blobs = await fs.readdir(join(path, 'db.sqlite-blobs'))
  const sizes = await Promise.all(
    blobs.map(
      async blob => (await fs.stat(join(path, 'db.sqlite-blobs', blob))).size
    )
  )

  return db_size + sizes.reduce((a, b) => a + b)
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
    console.log(init_count)
    init_count++
  }

  return constructName(init_count)
}
