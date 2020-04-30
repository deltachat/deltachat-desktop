import { getLogger } from '../shared/logger'
const log = getLogger('main/dev')

/**
 * Only works when it's installed (aka when its a dev enviroment)
 */
export async function tryInstallReactDevTools() {
  try {
    
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
    //@ts-ignore
    } = await import('electron-devtools-installer')
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
