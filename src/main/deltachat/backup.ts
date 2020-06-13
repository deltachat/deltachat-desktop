import { C } from 'deltachat-node'

// @ts-ignore
import binding from 'deltachat-node/binding'
import { EventId2EventName } from 'deltachat-node/dist/constants'
import tempy from 'tempy'
import fs from 'fs-extra'
import { ipcMain } from 'electron'
import path from 'path'
import { EventEmitter } from 'events'
import { getNewAccountPath } from '../logins'

import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/backup')

import SplitOut from './splitout'
export default class DCBackup extends SplitOut {
  export(dir: string) {
    this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir, undefined)
  }

  import(file: string) {
    const { sendToRenderer } = this._controller

    async function moveImportedConfigFolder(
      _addr: string,
      newPath: string,
      overwrite = false
    ) {
      if (overwrite === true) {
        await fs.remove(newPath)
      }
      await fs.move(tmpConfigPath, newPath)
      log.debug(
        `backupImport: ${tmpConfigPath} successfully copied to ${newPath}`
      )
    }

    const tmpConfigPath = tempy.directory()
    log.debug(`Creating dummy dc config for importing at ${tmpConfigPath}`)
    const db = path.join(tmpConfigPath, 'db.sqlite')

    const dcnContext = binding.dcn_context_new(db)

    const shutdown = () => {
      binding.dcn_stop_event_handler(dcnContext)
      binding.dcn_context_unref(dcnContext)
      log.debug(`closed context for backupImport ${file}`)
    }

    const onError = (err: any) => {
      sendToRenderer('DD_EVENT_BACKUP_IMPORT_ERROR', err)
      shutdown()
    }

    const dcnEvent = new EventEmitter()
    binding.dcn_start_event_handler(
      dcnContext,
      (event: any, data1: any, data2: any) => {
        const eventStr = EventId2EventName[event]
        log.debug('backup event:', eventStr, data1, data2)
        dcnEvent.emit(eventStr, data1, data2)
      }
    )

    dcnEvent.on('DC_EVENT_IMEX_PROGRESS', (progress: number) => {
      sendToRenderer('DD_EVENT_IMPORT_PROGRESS', progress / 2)
      if (progress === 0) {
        onError('UNKNOWN_ERROR')
      } else if (progress === 1000) {
        onSuccessfulImport()
      }
    })

    function onSuccessfulMove(addr: string) {
      sendToRenderer('DD_EVENT_BACKUP_IMPORTED', addr)
      shutdown()
    }

    async function onSuccessfulImport() {
      const addr = binding.dcn_get_config(dcnContext, 'addr')

      log.debug(`backupImport: Closing dc instance...`)
      binding.dcn_context_unref(dcnContext)

      sendToRenderer('DD_EVENT_IMPORT_PROGRESS', 600)

      const newPath = getNewAccountPath()
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
            await fs
              .remove(newPath)
              .catch(log.error.bind(null, 'symlink removing failed'))
          }
        } catch (error) {
          /* but we don't care about the error of a not found symlink */
        }
        await moveImportedConfigFolder(addr, newPath, false)
      }
    }

    log.debug(`openend context`)
    log.debug(`Starting backup import of ${file}`)

    binding.dcn_imex(dcnContext, C.DC_IMEX_IMPORT_BACKUP, file, '')
  }
}
