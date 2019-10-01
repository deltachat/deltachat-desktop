const fs = require('fs').promises
const fsExtra = require('fs-extra')
const path = require('path')
const log = require('../../logger').getLogger('main/deltachat/stickers')

async function isDirectory (path) {
  const lstat = await fs.lstat(path)
  return lstat.isDirectory()
}

async function isFile (path) {
  const lstat = await fs.lstat(path)
  return lstat.isFile()
}

async function getStickers () {
  const stickerFolder = path.join(this.fullCwd, 'stickers')

  if (!await fsExtra.pathExists(stickerFolder)) {
    log.info(`Sticker folder ${stickerFolder} does not exist`)
    return {}
  }

  const stickers = {}

  const list = await fs.readdir(stickerFolder)
  for (const stickerPack of list) {
    const stickerPackPath = path.join(stickerFolder, stickerPack)
    if (!await isDirectory(stickerPackPath)) continue
    const stickerImages = []
    for (const sticker of await fs.readdir(stickerPackPath)) {
      const stickerPackImagePath = path.join(stickerPackPath, sticker)
      if (!sticker.endsWith('.png') || !await isFile(stickerPackImagePath)) continue
      stickerImages.push(stickerPackImagePath)
    }
    if (stickerImages.length === 0) continue
    stickers[stickerPack] = stickerImages
  }

  return stickers
}

module.exports = function () {
  this.getStickers = getStickers.bind(this)
}
