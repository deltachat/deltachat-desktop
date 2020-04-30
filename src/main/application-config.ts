// @ts-ignore
import applicationConfig from 'application-config'


const appConfig = applicationConfig('DeltaChat')
import { join } from 'path'

if (process.env.TEST_DIR) {
  appConfig.filePath = join(process.env.TEST_DIR, 'config.json')
} else if (process.env.PORTABLE_EXECUTABLE_DIR) {
  /* ignore-console-log */
  console.log('Running in Portable Mode', process.env.PORTABLE_EXECUTABLE_DIR)
  appConfig.filePath = join(
    process.env.PORTABLE_EXECUTABLE_DIR,
    'DeltaChatData',
    'config.json'
  )
}

export default Object.freeze(appConfig)
