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

  await addDeviceMessage('changelog-version-1.46.0-version1', {
    text: `What's new in 1.46.0?

🐣 New Onboarding: ⚡️ Sign up to secure fast chatmail servers (https://delta.chat/chatmail) or use classic e-mail servers

💻 Collapse chat list on small screens or window sizes
📋 Accept images from clipboard in QR reader
🖼️✂️ Image cropper for profile image selector
📌 Webxdc windows now remember their last position and size
🚀 Shorter startup times on newer Mac (through native ARM builds)
✨ Many improvements and bug fixes

[Full Changelog](https://github.com/deltachat/deltachat-desktop/blob/main/CHANGELOG.md#1_46_0)`,
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
