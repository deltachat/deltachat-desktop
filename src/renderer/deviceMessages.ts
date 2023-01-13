import { BackendRemote } from './backend-com'

export function updateDeviceChats(accountId: number) {
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.34.0-version0',
    `What's new in 1.34.0?

⚡️ Smooth rendering. Much snappier scrolling. The new version is easy on your patience and is the result of a refactoring that took more than a year (for our tech-savvy friends: we are now using JSON-RPC under the hood and threw away lots of old, annoying code :)  
🧹 Clear chat history
🔍 Search for messages in chat
⏬ jump down button
🤗 Friendlier contact lists: ordered by last seen and contacts seen within 10 minutes are marked by a dot 🟢
🎛️ Tray icon is now enabled by default
🔔 when receiving multiple notifications at once, they will be grouped into one single notification
😀 right click to add sticker to the sticker selector
✨ Many smaller bug fixes and general improvements

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_34_0`
  )

  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.34.2-version0',
    `What's new in 1.34.2?

We resolved two email (IMAP) connection issues.
This release also includes some smaller improvements and bug fixes.

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_34_2`
  )
}
