const C = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')

function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
}

function backupImport (file) {
  let dc = new DeltaChat()
  dc.open('/tmp/dc-backup', () => {
    dc.importExport(C.DC_IMEX_IMPORT_BACKUP, file)
  })
  dc.on('ALL', (event, ...args) => {
    console.log('backupImport:', event, ...args)
  })
  dc.on('2051', (progress) => {
    this.emit('DC_EVENT_IMEX_PROGRESS', progress)
    if(progress == '1000') {
      let addr = dc.getConfig('addr')
      this.emit('DD_EVENT_BACKUP_IMPORTED', addr)
    }
  })
}

module.exports = function () {
  console.log('xxx', this)
  this.backupExport = backupExport.bind(this)
  this.backupImport = backupImport.bind(this)
}
