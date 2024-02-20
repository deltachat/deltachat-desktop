import { atomEffect } from 'jotai-effect'

import * as backend from '../backend/deviceMessage'
import { selectedAccountId } from '../atoms/account'

const WHATS_NEW_LABEL = 'changelog-version-1.42.0-version0'
const WHATS_NEW_TEXT = `What's new in 1.42.0?

💌 one-to-one chats guarantee end-to-end encryption for introduced contacts now
😌 for everyone's simplicity, we mark these contacts and chats with green checkmarks
👥 groups are created automatically with guaranteed end-to-end encryption if possible
🔄 Accept/Blocked, Archived, Pinned, Mute is synced across all your devices
🗜️ Images are now compressed (unless you send them as files)
🖼️ Global Gallery with your pictures, documents, media across all chats
✨ many more improvements and bugfixes

Full Changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md#1_42_0`

export const addChangelogOnAccountChange = atomEffect(get => {
  const accountId = get(selectedAccountId)
  if (accountId !== null) {
    backend.addDeviceMessage(accountId, WHATS_NEW_LABEL, {
      text: WHATS_NEW_TEXT,
    })
  }
})
