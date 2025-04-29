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

  await addDeviceMessage('changelog-version-1.57.0', {
    text: `Thanks for testing the 1.57.0 testrelease, this is the release candidate for the 1.58.0 release.

Please report issues on https://support.delta.chat/t/help-testing-the-upcoming-v1-58-x-release`,
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
