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

function homePageUrl () {
  return 'https://delta.chat'
}

function gitHubUrl () {
  return 'https://github.com/deltachat/deltachat-desktop'
}

function gitHubIssuesUrl () {
  return `${gitHubUrl()}/issues`
}

function gitHubLicenseUrl () {
  return `${gitHubUrl()}/blob/master/LICENSE`
}

module.exports = {
  appName,
  appVersion,
  appWindowTitle,
  appIcon,
  homePageUrl,
  gitHubUrl,
  gitHubIssuesUrl,
  gitHubLicenseUrl
}
