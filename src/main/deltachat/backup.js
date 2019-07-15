const C = require('deltachat-node/constants')
const DeltaChat = require('deltachat-node')
const binding = require('deltachat-node/binding')
const events = require('deltachat-node/events')
const tempy = require('tempy')
const fs = require('fs-extra')
const { promisify } = require('util')
const windows = require('../windows')
const { ipcMain } = require('electron')
const path = require('path')
const EventEmitter = require('events').EventEmitter
const log = require('../../logger').getLogger('main/deltachat/backup')

function backupExport (dir) {
  this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
}

function backupImport (file) {
  let self = this

  async function moveImportedConfigFolder (addr, newPath, overwrite = false) {
    if (overwrite === true) {
      await fs.remove(newPath)
    }
    await fs.move(tmpConfigPath, newPath)
    console.log(`backupImport: ${tmpConfigPath} successfully copied to ${newPath}`)
  }

  function onErrorImport (err) {
    self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_ERROR', err)
  }

  const dcn_context = binding.dcn_context_new()

  let tmpConfigPath = tempy.directory()
  log.debug(`Creating dummy dc config for importing at ${tmpConfigPath}`)
  const db = path.join(tmpConfigPath, 'db.sqlite')
  const done = (err, result) => {
    binding.dcn_close(dcn_context, () => {
      log.debug(`closed context for getConfig ${dir}`)
    })
    cb(err, result)
  }

  const dcnEvent = new EventEmitter()
  binding.dcn_set_event_handler(dcn_context, (event, data1, data2) => {
    const eventStr = events[event]
    log.debug('backup event:', eventStr, data1, data2)
    dcnEvent.emit(eventStr, data1, data2)
  })

  dcnEvent.on('DC_EVENT_IMEX_PROGRESS', progress => {
    this.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', progress / 2)
    if (progress === 0) {
      onErrorImport('UNKNOWN_ERROR')
    }
    if (progress === 1000) {
      onSuccessfulImport()
    }
  })

  function onSuccessfulMove (addr) {
    self.sendToRenderer('DD_EVENT_BACKUP_IMPORTED', addr)
  }

  function onSuccessfulImport () {
    const addr = binding.dcn_get_config(dcn_context, 'addr')

    log.debug(`backupImport: Closing dc instance...`)
    binding.dcn_close(dcn_context, async (err) => {
      if (err) throw err

      self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 600)

      let newPath = self.getPath(addr)
      let configFolderExists = await fs.pathExists(newPath)

      if (configFolderExists) {
        log.debug(`backupImport: ${newPath} already exists`)
        self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', true)
        self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)

        ipcMain.once('DU_EVENT_BACKUP_IMPORT_OVERWRITE', async () => {
          log.debug('DU_EVENT_OVERWRITE_IMPORT')
          await moveImportedConfigFolder(addr, newPath, true)
          onSuccessfulMove(addr)
        })
      } else {
        log.debug(`backupImport: ${newPath} does not exist, moving...`)
        self.sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)
        self.sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', false)
        await moveImportedConfigFolder(addr, newPath, false)
        onSuccessfulMove(addr)
      }
    })
  }
  binding.dcn_open(dcn_context, db, '', err => {
    if (err) return done(err)
    log.debug(`openend context`)
    log.debug(`Starting backup import of ${file}`)

    binding.dcn_start_threads(dcn_context)
    binding.dcn_imex(dcn_context, C.DC_IMEX_IMPORT_BACKUP, file, '')
  })
}

module.exports = function () {
  this.backupExport = backupExport.bind(this)
  this.backupImport = backupImport.bind(this)
}
