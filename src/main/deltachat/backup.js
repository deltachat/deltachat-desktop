const C = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')
const tempy = require('tempy')
const fs = require('fs-extra')
const {promisify} = require('util');

function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
}

function backupImport (file) {
  let dc = new DeltaChat()
  let tmpConfigPath = tempy.directory()

  let self = this

  async function moveImportedConfigFolder(addr) {
    let newPath = self.getPath(addr)
    if(await fs.pathExists(newPath)) {
      console.log(`backupImport: ${newPath} already exists`)
      this.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', true)
    } else {
      console.log(`backupImport: ${newPath} does not exist, moving...`)
      this.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', false)
      await fs.move(tmpConfigPath, newPath)
      console.log(`backupImport: ${tmpConfigPath} successfully moved to ${newPath}`)
      this.sendToRenderer('DD_EVENT_BACKUP_IMPORTED', addr)
    }
  }

  function onSuccessfulImport() {
    let addr = dc.getConfig('addr')

    console.log(`backupImport: Closing dc instance...`)
    dc.close(err => {
      if(err) throw err
      console.log('Successfully closed')
      moveImportedConfigFolder(addr)
    })


  }

  function onErrorImport(err) {
    this.sendToRenderer('DD_EVENT_BACKUP_IMPORT_ERROR', err)
  }

  console.log(`Creating dummy dc config for importing at ${tmpConfigPath}`)
  dc.open(tmpConfigPath, () => {
    dc.importExport(C.DC_IMEX_IMPORT_BACKUP, file)
  })
  dc.on('ALL', (event, ...args) => {
    console.log('backupImport:', event, ...args)
  })
  dc.on('DC_EVENT_IMEX_PROGRESS', progress => {
    this.sendToRenderer('DC_EVENT_IMEX_PRORGRESS', progress / 2)
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
