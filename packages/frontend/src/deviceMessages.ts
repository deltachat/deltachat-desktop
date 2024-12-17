import { BackendRemote } from './backend-com'
import { getDeviceChatId, markChatAsSeen } from './backend/chat'

export async function updateDeviceChat(
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
        quotedText: null,
        ...msg,
      })
    }
  }

  await addDeviceMessage('changelog-version-1.50.0', {
    text: `What's new in 1.50.0?

🎹 Improved keyboard navigation
📤 Select and send multiple files at once
🎮 Enhanced in-chat apps: Get notifications and open supporting apps in context, i.e. open an added calendar entry directly
🚀 In-chat apps can be really fast now by the "realtime" support
📋 Private label for accounts

MORE ✨ improvements and 🐜 bug fixes see [Full Changelog](https://github.com/deltachat/deltachat-desktop/blob/main/CHANGELOG.md#1_50_0)`,
  })
}

export async function updateDeviceChats() {
  const selectedAccount = await BackendRemote.rpc.getSelectedAccountId()
  for (const accountId of await BackendRemote.rpc.getAllAccountIds()) {
    await updateDeviceChat(accountId, false)
    if (accountId !== selectedAccount) {
      const devChatId = await getDeviceChatId(accountId)
      if (devChatId) markChatAsSeen(accountId, devChatId)
    }
  }
}
