const C = require('deltachat-node/constants')
const binding = require('deltachat-node/binding')
const events = require('deltachat-node/events')
const tempy = require('tempy')
const fs = require('fs-extra')
const { ipcMain } = require('electron')
const path = require('path')
const EventEmitter = require('events').EventEmitter
const log = require('../../logger').getLogger('main/deltachat/backup')
const { getNewAccountPath } = require('../logins')

const SplitOut = require('./splitout')
module.exports = class DCBackup extends SplitOut {
  export (dir) {
    this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir)
  }

  import (file) {
    const { sendToRenderer } = this._controller

    async function moveImportedConfigFolder (addr, newPath, overwrite = false) {
      if (overwrite === true) {
        await fs.remove(newPath)
      }
      await fs.move(tmpConfigPath, newPath)
      log.debug(`backupImport: ${tmpConfigPath} successfully copied to ${newPath}`)
    }

    const dcnContext = binding.dcn_context_new()

    const tmpConfigPath = tempy.directory()
    log.debug(`Creating dummy dc config for importing at ${tmpConfigPath}`)
    const db = path.join(tmpConfigPath, 'db.sqlite')
    const onError = (err) => {
      sendToRenderer('DD_EVENT_BACKUP_IMPORT_ERROR', err)
      binding.dcn_close(dcnContext, () => {
        log.debug(`closed context for backupImport ${file}`)
      })
    }

    const dcnEvent = new EventEmitter()
    binding.dcn_set_event_handler(dcnContext, (event, data1, data2) => {
      const eventStr = events[event]
      log.debug('backup event:', eventStr, data1, data2)
      dcnEvent.emit(eventStr, data1, data2)
    })

    dcnEvent.on('DC_EVENT_IMEX_PROGRESS', progress => {
      sendToRenderer('DD_EVENT_IMPORT_PROGRESS', progress / 2)
      if (progress === 0) {
        onError('UNKNOWN_ERROR')
      } else if (progress === 1000) {
        onSuccessfulImport()
      }
    })

    function onSuccessfulMove (addr) {
      sendToRenderer('DD_EVENT_BACKUP_IMPORTED', addr)
    }

    function onSuccessfulImport () {
      const addr = binding.dcn_get_config(dcnContext, 'addr')

      log.debug(`backupImport: Closing dc instance...`)
      binding.dcn_close(dcnContext, async (err) => {
        if (err) throw err

        sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 600)

        const newPath = getNewAccountPath(addr)
        const configFolderExists = await fs.pathExists(newPath)

        if (configFolderExists) {
          log.debug(`backupImport: ${newPath} already exists`)
          sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', true)
          sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)

          ipcMain.once('DU_EVENT_BACKUP_IMPORT_OVERWRITE', async () => {
            log.debug('DU_EVENT_OVERWRITE_IMPORT')
            await moveImportedConfigFolder(addr, newPath, true)
            onSuccessfulMove(addr)
          })
        } else {
          log.debug(`backupImport: ${newPath} does not exist, moving...`)
          sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 700)
          sendToRenderer('DD_EVENT_BACKUP_IMPORT_EXISTS', false)
          try {
            // future compatibiliy: remove a symlink if it exists
            if ((await fs.lstat(newPath)).isSymbolicLink()) {
              await fs.remove(newPath).catch(log.error.bind(null, 'symlink removing failed'))
            }
          } catch (error) { /* but we don't care about the error of a not found symlink */ }
          await moveImportedConfigFolder(addr, newPath, false)
          onSuccessfulMove(addr)
        }
      })
    }
    binding.dcn_open(dcnContext, db, '', err => {
      if (err) return onError(err)
      log.debug(`openend context`)
      log.debug(`Starting backup import of ${file}`)

      binding.dcn_imex(dcnContext, C.DC_IMEX_IMPORT_BACKUP, file, '')
      binding.dcn_perform_imap_jobs(dcnContext)
    })
  }
}
