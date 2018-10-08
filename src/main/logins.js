const path = require('path')
const series = require('run-series')
const fs = require('fs')
const DeltaChat = require('deltachat-node')

module.exports = getLogins

function getLogins (dir, cb) {
  const tasks = []
  fs.readdir(dir, (err, files) => {
    if (err) return cb(err)
    files.forEach(filename => {
      const fullPath = path.join(dir, filename)
      if (fs.statSync(fullPath).isDirectory()) {
        tasks.push(getConfig(fullPath))
      }
    })
    series(tasks, (err, logins) => {
      if (err) return cb(err)
      cb(null, logins.filter(i => {
        return i && typeof i.addr === 'string'
      }).map(i => i.addr))
    })
  })
}

function getConfig (cwd) {
  return next => {
    DeltaChat.getConfig(cwd, next)
  }
}
