import { C } from 'deltachat-node'

// @ts-ignore
import binding from 'deltachat-node/binding'
import { EventId2EventName } from 'deltachat-node/dist/constants'
import tempy from 'tempy'
import fs from 'fs-extra'
import path from 'path'
import { getNewAccountPath } from '../logins'

import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/backup')

import SplitOut from './splitout'
export default class DCBackup extends SplitOut {
  export(dir: string) {
    this._dc.importExport(C.DC_IMEX_EXPORT_BACKUP, dir, undefined)
  }

  import(file: string) {
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

    binding.dcn_start_event_handler(
      dcnContext,
      async ( event: any, data1: any, data2: any) => {
        const eventStr = EventId2EventName[event]
        log.debug('backup event:', eventStr, data1, data2)
        if (eventStr === 'DC_EVENT_IMEX_PROGRESS') {
          console.log('its DC_EVENT_IMEX_')
          if (data1 === 0) {
            shutdown()
          } else if (data1 === 1000) {
            console.log('its thousand!')
            await onSuccessfulImport()
          }
        }
        this._controller.onAll(event, data1, data2)
      }
    )

    async function onSuccessfulImport() {
      const addr = binding.dcn_get_config(dcnContext, 'addr')

      log.debug(`backupImport: Closing dc instance...`)
      binding.dcn_context_unref(dcnContext)

      const newPath = getNewAccountPath()

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

    log.debug(`openend context`)
    log.debug(`Starting backup import of ${file}`)

    binding.dcn_imex(dcnContext, C.DC_IMEX_IMPORT_BACKUP, file, '')
  }
}
