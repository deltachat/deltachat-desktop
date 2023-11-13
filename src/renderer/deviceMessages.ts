import { BackendRemote } from './backend-com'

export async function updateDeviceChats(accountId: number) {
  // const tx = window.static_translate

  await BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.41.0-version0',
    `What's new in 1.41.0?
    
💌 one-to-one chats guarantee end-to-end encryption for introduced contacts now
😌 for everyone's simplicity, we mark these contacts and chats with green checkmarks
👥 groups are created automatically with guaranteed end-to-end encryption if possible
🔄 Accept/Blocked, Archived, Pinned, Mute is synced across all your devices
🗜️ Images are now compressed (unless you send them as files)
🖼️ Global Gallery with your pictures, documents, media across all chats
✨ many more improvements and bugfixes

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_41_0

Thanks for testing this pre-release version, for more information and to five us feedback go to https://support.delta.chat/t/help-testing-the-upcoming-1-41-x-release/2793`
  )
}
