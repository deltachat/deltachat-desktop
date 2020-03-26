const windows = require('./windows')
import { app, ipcMain } from 'electron'
import DeltaChatController from './deltachat/controller'

export function setupUnreadBadge(dc: DeltaChatController) {
  if (process.platform !== 'linux' && process.platform !== 'darwin') return

  let reUpdateTimeOut: NodeJS.Timeout

  async function update() {
    const count = await dc.callMethod(
      null,
      'chatList.getGeneralFreshMessageCounter'
    )
    app.setBadgeCount(count)
  }

  dc._dc.on('DC_EVENT_INCOMING_MSG', (_chatId: number, _msgId: number) => {
    // don't update imidiately if the app is in focused
    if (windows.main.win.hidden) update()

    // update after a delay again to make sure its up to date
    if (reUpdateTimeOut) clearTimeout(reUpdateTimeOut)
    reUpdateTimeOut = setTimeout(() => {
      update()
    }, 4000)
  })

  dc.on('ready', () => {
    // for start and after account switch
    update()
  })

  ipcMain.on('update-badge', () => {
    // after selecting a chat to take mark read into account
    if (reUpdateTimeOut) clearTimeout(reUpdateTimeOut)
    reUpdateTimeOut = setTimeout(() => update(), 200)
  })
}
