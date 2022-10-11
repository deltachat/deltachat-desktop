import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/settings')

import SplitOut from './splitout'
import { copyFile, mkdir, rm } from 'fs/promises'
import { join, extname } from 'path'
import { getConfigPath } from '../application-constants'

export default class DCSettings extends SplitOut {
  async saveBackgroundImage(file: string, isDefaultPicture: boolean) {
    const originalFilePath = !isDefaultPicture
      ? file
      : join(__dirname, '../../../images/backgrounds/', file)

    const bgDir = join(getConfigPath(), 'background')
    await rm(bgDir, { recursive: true, force: true })
    await mkdir(bgDir, { recursive: true })
    const fileName = `background_${Date.now()}` + extname(originalFilePath)
    const newPath = join(getConfigPath(), 'background', fileName)
    try {
      await copyFile(originalFilePath, newPath)
    } catch (error) {
      log.error('BG-IMG Copy Failed', error)
      throw error
    }
    return `img: ${fileName.replace(/\\/g, '/')}`
  }
}
