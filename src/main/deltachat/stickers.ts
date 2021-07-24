import { lstat, readdir } from 'fs/promises'
import path from 'path'
import { getLogger } from '../../shared/logger'
import SplitOut from './splitout'

const log = getLogger('main/deltachat/stickers')

async function isDirectory(path: string) {
  const stats = await lstat(path)
  return stats.isDirectory()
}

async function isFile(path: string) {
  const stats = await lstat(path)
  return stats.isFile()
}
export default class DCStickers extends SplitOut {
  async getStickers() {
    const stickerFolder = path.join(
      String(this._controller.accountDir),
      'stickers'
    )

    let list: string[] = []
    try {
      list = await readdir(stickerFolder)
    } catch {
      log.info(`Sticker folder ${stickerFolder} does not exist`)
      return {}
    }

    const stickers: { [key: string]: string[] } = {}
    for (const stickerPack of list) {
      const stickerPackPath: string = path.join(stickerFolder, stickerPack)
      if (!(await isDirectory(stickerPackPath))) continue
      const stickerImages = []
      for (const sticker of await readdir(stickerPackPath)) {
        const stickerPackImagePath = path.join(stickerPackPath, sticker)
        if (
          !(sticker.endsWith('.png') || sticker.endsWith('.webp')) ||
          !(await isFile(stickerPackImagePath))
        )
          continue
        stickerImages.push('file://' + stickerPackImagePath)
      }
      if (stickerImages.length === 0) continue
      stickers[stickerPack] = stickerImages
    }

    return stickers
  }
}
