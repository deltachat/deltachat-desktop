const fsExtra = require('fs-extra')
const path = require('path')
const log = require('../../logger').getLogger('main/deltachat/stickers')

async function isDirectory (path) {
  const lstat = await fsExtra.lstat(path)
  return lstat.isDirectory()
}

async function isFile (path) {
  const lstat = await fsExtra.lstat(path)
  return lstat.isFile()
}

const SplitOut = require('./splitout')
module.exports = class DCStickers extends SplitOut {
  async getStickers () {
    const stickerFolder = path.join(this._controller.fullCwd, 'stickers')

    if (!await fsExtra.pathExists(stickerFolder)) {
      log.info(`Sticker folder ${stickerFolder} does not exist`)
      return {}
    }

    const stickers = {}

    const list = await fsExtra.readdir(stickerFolder)
    for (const stickerPack of list) {
      const stickerPackPath = path.join(stickerFolder, stickerPack)
      if (!await isDirectory(stickerPackPath)) continue
      const stickerImages = []
      for (const sticker of await fsExtra.readdir(stickerPackPath)) {
        const stickerPackImagePath = path.join(stickerPackPath, sticker)
        if (!sticker.endsWith('.png') || !await isFile(stickerPackImagePath)) continue
        stickerImages.push(stickerPackImagePath)
      }
      if (stickerImages.length === 0) continue
      stickers[stickerPack] = stickerImages
    }

    return stickers
  }
}
