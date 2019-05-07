function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
}

module.exports = function() {
  this.backupExport = backupExport.bind(this)
}
