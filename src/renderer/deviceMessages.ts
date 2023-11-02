import { BackendRemote } from './backend-com'

export async function updateDeviceChats(accountId: number) {
  // const tx = window.static_translate

  await BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.38.0-version0',
    `What's new in 1.38.0?
    
🖼️ Show thumbnail in chatlist of image, sticker and webxdc messages
🔍 Improved design for message search results
📎 Removed upper limit on attachment size
☕ Wake up from standby now reconnects more reliably 
✨ We fixed some bugs and improved stability

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_38_0`
  )
}
