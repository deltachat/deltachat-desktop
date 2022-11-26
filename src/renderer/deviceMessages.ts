import { BackendRemote } from './backend-com'

export function updateDeviceChats(accountId: number) {
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.34.0-version0',
    `What's new in 1.34.0?

    ⚡️ Faster UI thanks to jsonrpc
    🧹 Clear chat history
    🔍 Search for Messages in chat
    ⏬ jump down button
    🤗 Friendlier contact lists: Ordered by last seen and contacts seen within 10 minutes are marked by a dot 🟢
    🎛️ Tray icon is now enabled by default
    🔔 when receiving multiple Notifications at once, they will be grouped into one single Notification
    😀 right click to add sticker to the sticker selector
    ✨ Many smaller bug fixes and general improvements

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1.34.0`)
}
