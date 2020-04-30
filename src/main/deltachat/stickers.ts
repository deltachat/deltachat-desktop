import fsExtra from 'fs-extra'
import path from 'path'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'

const log = getLogger('main/deltachat/stickers')

async function isDirectory(path: string) {
  const lstat = await fsExtra.lstat(path)
  return lstat.isDirectory()
}

async function isFile(path: string) {
  const lstat = await fsExtra.lstat(path)
  return lstat.isFile()
}
export default class DCStickers extends SplitOut {
  async getStickers() {
    const stickerFolder = path.join(
      String(this._controller.accountDir),
      'stickers'
    )

    if (!(await fsExtra.pathExists(stickerFolder))) {
      log.info(`Sticker folder ${stickerFolder} does not exist`)
      return {}
    }

    const stickers: { [key: string]: string[] } = {}

    const list = await fsExtra.readdir(stickerFolder)
    for (const stickerPack of list) {
      const stickerPackPath: string = path.join(stickerFolder, stickerPack)
      if (!(await isDirectory(stickerPackPath))) continue
      const stickerImages = []
      for (const sticker of await fsExtra.readdir(stickerPackPath)) {
        const stickerPackImagePath = path.join(stickerPackPath, sticker)
        if (!sticker.endsWith('.png') || !(await isFile(stickerPackImagePath)))
          continue
        stickerImages.push(stickerPackImagePath)
      }
      if (stickerImages.length === 0) continue
      stickers[stickerPack] = stickerImages
    }

    return stickers
  }
}
