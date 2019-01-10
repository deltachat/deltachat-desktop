const path = require('path')

exports.appIcon = () => {
  // TODO Add .ico file for windows
  return path.join(__dirname, '..', 'images', 'deltachat.png')
}
