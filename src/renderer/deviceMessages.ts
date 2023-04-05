import { BackendRemote } from './backend-com'

export function updateDeviceChats(accountId: number) {
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.36.0-version0',
    `What's new in 1.36.0?

💻📱 Use Delta Chat on all your devices easily - just follow three simple steps at \"Settings / Add Second Device\" (experimental)
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
}
