const windows = require('./windows')
const C = require('deltachat-node/constants')
const log = require('../logger').getLogger('main/markseenfix')

/** @type {import('./deltachat/controller')} */
let dc

async function maybeMarkSeen (chatId, msgId) {
  if (!dc) { return }
  if (!windows.main.win.hidden) {
    const selectedChatId = await dc.callMethod(null, 'chatList.getSelectedChatId', [])
    if (selectedChatId === chatId) {
      await dc.callMethod(null, 'messageList.markSeenMessages', [msgId])
    }
  }
}

function setupMarkseenFix (dcClass) {
  dc = dcClass
  dc.on('ready', _ => {
    windows.main.win.on('focus', async () => {
      const selectedChatId = await dc.callMethod(null, 'chatList.getSelectedChatId', [])
      const chat = await dc.callMethod(null, 'chatList.getFullChatById', [selectedChatId, true])
      if (!chat) return
      if (chat && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
        if (chat.freshMessageCounter > 0) {
          await dc.callMethod(null, 'chat.markNoticedChat', [chat.id])
          const messagIds = (chat.messages || []).map((msg) => msg.id)
          log.debug('markSeenMessages', messagIds)
          await dc.callMethod(null, 'messageList.markSeenMessages', [messagIds])
        }
      }
    })
  })
}

module.exports = {
  setupMarkseenFix,
  maybeMarkSeen
}
