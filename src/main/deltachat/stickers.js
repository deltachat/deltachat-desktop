const fs = require('fs').promises
const fsExtra = require('fs-extra')
const path = require('path')
const log = require('../../logger').getLogger('main/deltachat/stickers')

async function isDirectory(path) {
  let lstat = await fs.lstat(path)
  return lstat.isDirectory()
}

async function isFile(path) {
  let lstat = await fs.lstat(path)
  return lstat.isFile()
}

async function getStickers () {
  const stickerFolder = path.join(this.fullCwd, 'stickers')

  if (!await fsExtra.pathExists(stickerFolder)) {
    log.info(`Sticker folder ${stickerFolder} does not exist`)
    return {}
  }

  let stickers = {}

  const list = await fs.readdir(stickerFolder)
  for(let stickerPack of list) {
    const stickerPackPath = path.join(stickerFolder, stickerPack)
    if(!await isDirectory(stickerPackPath)) continue
    let stickerImages = []
    for (let sticker of await fs.readdir(stickerPackPath)) {
      const stickerPackImagePath = path.join(stickerPackPath, sticker)
      if(!sticker.endsWith('.png') || !await isFile(stickerPackImagePath)) continue
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
