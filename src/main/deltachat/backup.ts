import { C } from 'deltachat-node'

import { getLogger } from '../../shared/logger'
const log = getLogger('main/deltachat/backup')

import SplitOut from './splitout'
import { DeltaChatAccount } from '../../shared/shared-types'
export default class DCBackup extends SplitOut {
  async export(dir: string) {
    this.dc.stopIO()
    try {
      await this._internal_export(dir)
    } catch (err) {
      this.dc.startIO()
      throw err
    }
    this.dc.startIO()
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
          this.dc.removeListener('DC_EVENT_IMEX_PROGRESS', onEventImexProgress)
          reject('Backup export failed (progress==0)')
        } else if (data1 === 1000) {
          this.dc.removeListener('DC_EVENT_IMEX_PROGRESS', onEventImexProgress)
          resolve()
        }
      }

      this.dc.on('DC_EVENT_IMEX_PROGRESS', onEventImexProgress)
    })
  }

  import(file: string): Promise<DeltaChatAccount> {
    return new Promise((resolve, reject) => {
      this.dc.stopIO()
      const accountId = this.dc.addAccount()
      const dcnContext = this.dc.accountContext(accountId)

      this.controller.selectedAccountId = accountId
      this.controller.selectedAccountContext = dcnContext

      const onFail = (reason: String) => {
        this.dc.removeAccount(accountId)
        this.controller.selectedAccountId = null
        this.controller.selectedAccountContext = null
        this.dc.startIO()
        reject(reason)
      }

      const onSuccess = () => {
        this.controller.selectedAccountId = null
        this.controller.selectedAccountContext = null
        this.dc.startIO()
        resolve(this.controller.login.accountInfo(accountId))
      }

      this.controller.dc.on(
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
