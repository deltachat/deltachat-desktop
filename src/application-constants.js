const path = require('path')
const version = require('../package.json').version

function appName () {
  return 'DeltaChat'
}

function appVersion () {
  return `${version}-PREVIEW`
}

function appWindowTitle () {
  return `${appName()} (${appVersion()})`
}

function appIcon () {
  // TODO Add .ico file for windows
  return path.join(__dirname, '..', 'images', 'deltachat.png')
}

module.exports = {
  appName,
  appVersion,
  appWindowTitle,
  appIcon
}
