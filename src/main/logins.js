const { join, basename } = require('path')
const fs = require('fs-extra')
const DeltaChat = require('deltachat-node')
const logger = require('../logger')
const log = logger.getLogger('main/find_logins', true)
const { escapeEmailForAccountFolder } = require('./deltachat/util')

const { getConfigPath } = require('../application-constants')

async function getLogins (dir) {
  // search for old accounts and convert them
  await migrate(dir)

  // list new accounts
  const accounts = await readDeltaAccounts(join(dir, 'accounts'))
  return accounts.map(account => account.addr)
}

async function migrate (dir) {
  const oldAccounts = await readDeltaAccounts(dir)

  if (oldAccounts.length > 0) {
    log.info('Old format accounts detected, trying to convert them', oldAccounts)
    for (const account of oldAccounts) {
      const newFolder = join('accounts', escapeEmailForAccountFolder(account.addr))
      await fs.move(join(dir, basename(account.path)), join(dir, newFolder))
      // Backwards compatibility
      try {
        const compatPath = Buffer.from(account.addr).toString('hex')
        log.info('symlink, for backwards compatibility', join('./', newFolder), join(dir, compatPath))
        await fs.symlink(join('./', newFolder), join(dir, compatPath))
      } catch (error) {
        log.error('symlinking failed', error)
      }
    }
    log.info(`converted ${oldAccounts} accounts to new version`)
  }
}

async function getAccountInfo (path) {
  try {
    const config = await getConfig(path)
    if (typeof config.addr !== 'string') { throw new Error('Account has no address defined') }

    return {
      path,
      addr: config.addr
    }
  } catch (error) {
    log.error(`Account ${path} is inaccessible`, error)
    return null
  }
}

async function readDeltaAccounts (accountFolderPath) {
  const paths = (await fs.readdir(accountFolderPath)).map(filename => join(accountFolderPath, filename))
  const accountFolders = paths.filter(path => {
    // isDeltaAccountFolder
    return fs.existsSync(join(path, 'db.sqlite')) && !fs.lstatSync(path).isSymbolicLink()
  })

  return (await Promise.all(accountFolders.map(getAccountInfo))).filter(accounts => accounts !== null)
}

function getConfig (cwd) {
  return new Promise((resolve, reject) => {
    DeltaChat.getConfig(cwd, (err, result) => {
      if (err) { reject(err) } else { resolve(result) }
    })
  })
}

async function removeAccount (accountAddress) {
  const accountFolder = join(getConfigPath(), 'accounts')
  const account = (await readDeltaAccounts(accountFolder)).find(({ addr }) => accountAddress === addr)
  if (!account) {
    throw new Error('Removing account failed: Account not found')
  } else if (!await fs.pathExists(account.path)) {
    log.error('Removing account failed: path does not exist', account)
    throw new Error('Removing account failed: path does not exist:', account.path)
  }
  await fs.remove(account.path)
}

function getNewAccountPath (addr) {
  return join(getConfigPath(), 'accounts', escapeEmailForAccountFolder(addr))
}

module.exports = { getLogins, removeAccount, getNewAccountPath }
