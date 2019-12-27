const { join, basename } = require('path')
const fs = require('fs-extra')
const DeltaChat = require('deltachat-node')
const logger = require('../logger')
const log = logger.getLogger('main/find_logins', true)
const { escapeEmailForAccountFolder } = require('./deltachat/util')

module.exports = { getLogins }

async function getLogins (dir) {
  const fileNames = await fs.readdir(dir)
  const paths = fileNames.map(filename => join(dir, filename))

  const accountFolders = paths.filter(
    (path) => fs.existsSync(join(path, 'db.sqlite')) && !fs.lstatSync(path).isSymbolicLink()
  )

  const accounts = await Promise.all(accountFolders.map(async path => {
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
  ))
  const validAccounts = accounts.filter(accounts => accounts !== null)

  // convert folders
  const oldFormatAccounts = validAccounts.filter(account => basename(account.path) !== escapeEmailForAccountFolder(account.addr))

  if (oldFormatAccounts.length > 0) {
    log.info(
      'Old format accounts folders detected, trying to convert them',
      oldFormatAccounts.map(({ path }) => basename(path))
    )
    for (let i = 0; i < oldFormatAccounts.length; i++) {
      const account = oldFormatAccounts[i]
      const newFolder = escapeEmailForAccountFolder(account.addr)
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
    return getLogins(dir)
  } else {
    return validAccounts.map(account => account.addr)
  }
}

function getConfig (cwd) {
  return new Promise((resolve, reject) => {
    DeltaChat.getConfig(cwd, (err, result) => {
      if (err) { reject(err) } else { resolve(result) }
    })
  })
}
