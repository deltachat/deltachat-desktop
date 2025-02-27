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
        filename: null,
        location: null,
        overrideSenderName: null,
        quotedMessageId: null,
        quotedText: null,
        ...msg,
      })
    }
  }

  await addDeviceMessage('changelog-version-1.54.0', {
    text: `What's new in 1.54.0?

    🚀 Notifications on mentions in muted chats (enabled by default)
    💥 Highlight the first unread message on opening chat
    🎹 New shortcuts for search & new chats:
       - Search: Ctrl/Cmd + F
       - Search in Chat: Ctrl/Cmd + Shift + F
       - New Chat: Ctrl/Cmd + N
    You can find all Shortcuts in the Help menu or with Ctrl + /

MORE ✨ improvements and 🐜 bug fixes see [Full Changelog](https://github.com/deltachat/deltachat-desktop/blob/main/CHANGELOG.md#1_54_0)`,
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
