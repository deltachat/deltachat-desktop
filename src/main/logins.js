const path = require('path')
const series = require('run-series')
const fs = require('fs')
const DeltaChat = require('deltachat-node')

module.exports = getLogins

function getLogins (dir, cb) {
  var tasks = []
  fs.readdir(dir, (err, dirs) => {
    if (err) return cb(err)
    dirs.forEach((filename) => {
      if (path.extname(filename) !== '.json') {
        tasks.push(getConfig(path.join(dir, filename)))
      }
    })
    series(tasks, function (err, logins) {
      if (err) return cb(err)
      cb(null, logins.filter((l) => typeof l === 'string'))
    })
  })
}
function getConfig (filename) {
  return (next) => {
    var dc = new DeltaChat()
    dc.open(filename, err => {
      if (err) return next(err)
      if (dc.isConfigured()) {
        return next(null, dc.getConfig('addr'))
      }
      next()
    })
  }
}
