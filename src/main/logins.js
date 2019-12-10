const { join } = require('path')
const fs = require('fs-extra')
const DeltaChat = require('deltachat-node')
const logger = require('../logger')
const log = logger.getLogger('main/find_logins', true)

module.exports = getLogins

function getLogins (dir, cb) {
  getLogins2(dir)
    .then(result => cb(null, result))
    .catch(err => cb(err))
}

async function getLogins2 (dir) {
  const fileNames = await fs.readdir(dir)
  const paths = fileNames.map(filename => join(dir, filename))

  const accountFolders = paths.filter(
    (path) => fs.existsSync(join(path, 'db.sqlite'))
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

  // todo convert folders

  return validAccounts.map(account => account.addr)
}

function getConfig (cwd) {
  return new Promise((resolve, reject) => {
    DeltaChat.getConfig(cwd, (err, result) => {
      if (err) { reject(err) } else { resolve(result) }
    })
  })
}
