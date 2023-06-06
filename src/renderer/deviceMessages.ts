import { BackendRemote } from './backend-com'

export function updateDeviceChats(accountId: number) {
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.36.0-version1',
    `What's new in 1.36.0?

💻📱 Use Delta Chat on all your devices easily - just follow three simple steps at "Settings / Add Second Device" (experimental)
✉️ Open HTML emails securely in internal sandboxed viewer
✨ Many smaller bug fixes and general improvements

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_36_0`
  )

  const tx = window.static_translate
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.36.0-audit',
    tx(
      'update_1_36_audit',
      'https://delta.chat/en/2023-03-27-third-independent-security-audit'
    )
  )

  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.37.0-version0',
    `What's new in 1.37.0?
    
🖼️ Show thumbnail in chatlist of image, sticker and webxdc messages
🔍 Improved design for message search results
📎 Removed upper limit on attachment size
☕ Wake up from standby now reconnects more reliably 
✨ We fixed some bugs and improved stability

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_37_0`
  )
}
