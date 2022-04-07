import * as mainWindow from './windows/main'
import { app, ipcMain } from 'electron'
import DeltaChatController from './deltachat/controller'
import { set_has_unread } from './tray'

export default function setupUnreadBadge(dc: DeltaChatController) {
  let reUpdateTimeOut: NodeJS.Timeout

  async function update() {
    const count = await dc.callMethod(
      null,
      'chatList.getGeneralFreshMessageCounter'
    )
    app.setBadgeCount(count)
    set_has_unread(count !== 0)
  }

  dc.on(
    'DC_EVENT_INCOMING_MSG',
    (_accountId: number, _chatId: number, _msgId: number) => {
      // don't update immediately if the app is in focused
      if (mainWindow.window?.hidden) update()

      // update after a delay again to make sure its up to date
      if (reUpdateTimeOut) clearTimeout(reUpdateTimeOut)
      reUpdateTimeOut = setTimeout(() => {
        update()
      }, 4000)
    }
  )

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
