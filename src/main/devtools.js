const log = require('../shared/logger').getLogger('main/dev')

/**
 * Only works when it's installed (aka when its a dev enviroment)
 */
async function tryInstallReactDevTools() {
  try {
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer')
    try {
      const name = await installExtension(REACT_DEVELOPER_TOOLS)
      log.debug(`Added Extension:  ${name}`)
    } catch (err) {
      log.debug('An error occurred: ', err)
    }
  } catch (error) {
    log.debug(
      "react devtools aren't loaded (this is normal when using a production version of dc)"
    )
  }
}

module.exports = { tryInstallReactDevTools }
