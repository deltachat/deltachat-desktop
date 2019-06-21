const C = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')
const tempy = require('tempy')
const fs = require('fs-extra')
const {promisify} = require('util');
const windows = require('../windows')
const { ipcRenderer } = require('electron')

function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
}

function backupImport (file) {
  let dc = new DeltaChat()
  let tmpConfigPath = tempy.directory()

  let self = this

  async function moveImportedConfigFolder(addr, newPath) {
    await fs.move(tmpConfigPath, newPath)
    console.log(`backupImport: ${tmpConfigPath} successfully moved to ${newPath}`)
    self.sendToRenderer('DD_EVENT_BACKUP_IMPORTED', addr)
  }

  async function onDCClosed(err, addr) {
    if(err) throw err
    self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 600)
    console.log('Successfully closed')

    let newPath = self.getPath(addr)
    if(await fs.pathExists(newPath)) {
      console.log(`backupImport: ${newPath} already exists`)
      self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', true)
      self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)
  
      ipcRenderer.once('DU_EVENT_OVERWRITE_IMPORT', () => {
        console.log('DU_EVENT_BACKUP_IMPORT_OVERWRITE')
        moveImportedConfigFolder(addr, newPath)
      })        
    } else {
      console.log(`backupImport: ${newPath} does not exist, moving...`)
      self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)
      self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', false)
      moveImportedConfigFolder(addr, newPath)
    }
    moveImportedConfigFolder(addr)
  }

  function onSuccessfulImport() {
    let addr = dc.getConfig('addr')

    console.log(`backupImport: Closing dc instance...`)
    dc.close((err) => onDCClosed(err, addr))
  }

  function onErrorImport(err) {
    self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_ERROR', err)
  }

  console.log(`Creating dummy dc config for importing at ${tmpConfigPath}`)
  dc.open(tmpConfigPath, () => {
    dc.importExport(C.DC_IMEX_IMPORT_BACKUP, file)
  })
  dc.on('ALL', (event, ...args) => {
    console.log('backupImport:', event, ...args)
  })
  dc.on('DC_EVENT_IMEX_PROGRESS', progress => {
    this.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', progress / 2)
    if(progress == 0) {
      onErrorImport('UNKNOWN_ERROR')
    }
    if(progress == 1000) {
      onSuccessfulImport()
    }
  })
}

module.exports = function () {
  console.log('xxx', this)
  this.backupExport = backupExport.bind(this)
  this.backupImport = backupImport.bind(this)
}
