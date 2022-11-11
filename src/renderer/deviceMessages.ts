import { BUILD_TIMESTAMP, VERSION } from '../shared/build-info'
import { Timespans, DAYS_UNTIL_UPDATE_SUGGESTION } from '../shared/constants'
import { BackendRemote } from './backend-com'

export function hintUpdateIfNessesary(accountId: number) {
  if (
    Date.now() >
    Timespans.ONE_DAY_IN_SECONDS * DAYS_UNTIL_UPDATE_SUGGESTION * 1000 +
      BUILD_TIMESTAMP
  ) {
    BackendRemote.rpc.addDeviceMessage(
      accountId,
      `update-suggestion-${VERSION}`,
      `This build is over ${DAYS_UNTIL_UPDATE_SUGGESTION} days old - There might be a new version available. -> https://get.delta.chat`
    )
  }
}

setInterval(
  // If the dc is always on
  () => {
    if (window.__selectedAccountId) {
      hintUpdateIfNessesary(window.__selectedAccountId)
    }
  },
  Timespans.ONE_DAY_IN_SECONDS * 1000
)

export function updateDeviceChats(accountId: number) {
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.33.0-version1',
    `What's new in 1.33.0?

- We made some speed improvements by moving to a new "backend" architecture
- We added some exiting new features:
  - Clear chat history
  - Search for Messages in chat
  - jump down button
  - a recently seen indicator
- many smaller bugfixes fixes and improvements

Thanks for testing DeltaChat, please report bugs on Github.

Full changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md` // no anchor link because this is a test version
  )
  BackendRemote.rpc.addDeviceMessage(
    accountId,
    'changelog-version-1.33.1-version0',
    `What's new in 1.33.1?

- Many of the bugs with the message list/chat view are fixed now
- tray icon is now enabled by default
- when receiving many notifications at once, they will be grouped now.
- some improvements to the chat audit log
- add context menu option to save a sticker to the own sticker menu

Thanks for testing Delta Chat, please report bugs on GitHub.
Especially contact us if you encounter a specific bug, where desktop feels like it is half frozen, where it reacts to clicks, but not to events (unread badge in chat list won't disappear, message state stays spinning even though the message is already sent out successfully): https://github.com/deltachat/deltachat-desktop/issues/2992

Full changelog: https://github.com/deltachat/deltachat-desktop/blob/master/CHANGELOG.md` // no anchor link because this is a test version
  )
}
