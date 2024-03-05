import { BackendRemote } from './backend-com'

export async function updateDeviceChats(
  accountId: number,
  skipCurrentChangelog: boolean = false
) {
  const addDeviceMessage = async (
    label: string,
    msg: Partial<Parameters<typeof BackendRemote.rpc.addDeviceMessage>[2]>
  ) => {
    if (skipCurrentChangelog) {
      await BackendRemote.rpc.addDeviceMessage(accountId, label, null)
    } else {
      await BackendRemote.rpc.addDeviceMessage(accountId, label, {
        text: null,
        html: null,
        viewtype: null,
        file: null,
        location: null,
        overrideSenderName: null,
        quotedMessageId: null,
        ...msg,
      })
    }
  }

  await addDeviceMessage('changelog-version-1.44.0-version0', {
    text: `What's new in 1.44.0?

❤️ Send emoji reactions for messages
🔄 New Account Switcher sidebar with notification management
🛎️ Get notified for all your accounts
⚙️ Improved settings dialog
✨ A whole bunch of refactorings, improvements and bugfixes

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_44_0`,
  })
}
