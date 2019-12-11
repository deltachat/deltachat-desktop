const windows = require('./windows')
const C = require('deltachat-node/constants')
const log = require('../logger').getLogger('main/markseenfix')

/** @type {import('./deltachat/controller')} */
let dc

function maybeMarkSeen (chatId, msgId) {
  if (!dc) { return }
  if (!windows.main.win.hidden && dc._selectedChatId === chatId) {
    dc._dc.markSeenMessages([msgId])
  }
}

function setupMarkseenFix (dcClass) {
  dc = dcClass
  dc.on('ready', _ => {
    windows.main.win.on('focus', () => {
      const chat = dc.chatList.getFullChatById(dc._selectedChatId, true)
      if (!chat) return
      if (chat && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
        if (chat.freshMessageCounter > 0) {
          dc._dc.markNoticedChat(chat.id)
          const messagIds = (chat.messages || []).map((msg) => msg.id)
          log.debug('markSeenMessages', messagIds)
          dc._dc.markSeenMessages(messagIds)
        }
      }
    })
  })
}

module.exports = {
  setupMarkseenFix,
  maybeMarkSeen
}
