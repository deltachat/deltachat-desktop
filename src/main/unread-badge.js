const windows = require('./windows')
const { app, ipcMain } = require('electron')

module.exports = function (dc) {
  if (process.platform !== 'linux' && process.platform !== 'darwin') return

  if (process.platform === 'linux' && !app.isUnityRunning()) return

  let reUpdateTimeOut

  function update () {
    const count = dc._getGeneralFreshMessageCounter()
    app.setBadgeCount(count)
  }

  dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
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

  ipcMain.on('selectChat', () => {
    // after selecting a chat to take mark read into account
    if (reUpdateTimeOut) clearTimeout(reUpdateTimeOut)
    reUpdateTimeOut = setTimeout(() => update(), 200)
  })
}
