import { BackendRemote } from './backend-com'

export async function updateDeviceChats(
  accountId: number,
  skipCurrentChangelog: boolean = false
) {
  const UpdateMessage = async (
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

  // const tx = window.static_translate

  await UpdateMessage('changelog-version-1.42.0-version0', {
    text: `What's new in 1.42.0?

💌 one-to-one chats guarantee end-to-end encryption for introduced contacts now
😌 for everyone's simplicity, we mark these contacts and chats with green checkmarks
👥 groups are created automatically with guaranteed end-to-end encryption if possible
🔄 Accept/Blocked, Archived, Pinned, Mute is synced across all your devices
🗜️ Images are now compressed (unless you send them as files)
🖼️ Global Gallery with your pictures, documents, media across all chats
✨ many more improvements and bugfixes

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_42_0`,
  })
}
