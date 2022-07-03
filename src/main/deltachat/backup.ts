import { C } from 'deltachat-node'

import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/backup')

import SplitOut from './splitout'
import { DeltaChatAccount } from '../../shared/shared-types'
export default class DCBackup extends SplitOut {
  async export(dir: string) {
    this.selectedAccountContext.stopIO()
    try {
      await this._internal_export(dir)
    } catch (err) {
      this.selectedAccountContext.startIO()
      throw err
    }
    this.selectedAccountContext.startIO()
  }

  private async _internal_export(dir: string) {
    return new Promise<void>((resolve, reject) => {
      this.selectedAccountContext.importExport(
        C.DC_IMEX_EXPORT_BACKUP,
        dir,
        undefined
      )
      const onEventImexProgress = (
        _accountId: number,
        data1: number,
        _data2: number
      ) => {
        if (data1 === 0) {
          this.accounts.removeListener(
            'DC_EVENT_IMEX_PROGRESS',
            onEventImexProgress
          )
          reject('Backup export failed (progress==0)')
        } else if (data1 === 1000) {
          this.accounts.removeListener(
            'DC_EVENT_IMEX_PROGRESS',
            onEventImexProgress
          )
          resolve()
        }
      }

      this.accounts.on('DC_EVENT_IMEX_PROGRESS', onEventImexProgress)
    })
  }

  import(file: string): Promise<DeltaChatAccount> {
    if (!this.selectedAccountId || !this.selectedAccountContext) {
      throw new Error('Import of backup needs selected context.')
    }
    const accountId = this.selectedAccountId
    const dcnContext = this.selectedAccountContext

    return new Promise((resolve, reject) => {
      const onFail = (reason: String) => {
        reject(reason)
      }

      const onSuccess = () => {
        resolve(this.controller.login._accountInfo(accountId))
      }

      this.accounts.on(
        'DC_EVENT_IMEX_PROGRESS',
        async (eventAccountId, data1, data2) => {
          if (eventAccountId !== accountId) return
          if (data1 === 0) {
            onFail(data2)
          } else if (data1 === 1000) {
            onSuccess()
          }
        }
      )

      log.debug(`openend context`)
      log.debug(`Starting backup import of ${file}`)

      dcnContext.importExport(C.DC_IMEX_IMPORT_BACKUP, file, '')
    })
  }
}
