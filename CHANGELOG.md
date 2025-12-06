# Changelog

All notable changes to this project will be documented in this file.

<a id="2_33_0"></a>
## [2.33.0] - 2025-12-06

### Added

- Add multitransport ([#5680](https://github.com/deltachat/deltachat-desktop/issues/5680))
- Allow add transport from main scanner ([#5795](https://github.com/deltachat/deltachat-desktop/issues/5795))
- Show warning when disabling multi-device mode ([#5743](https://github.com/deltachat/deltachat-desktop/issues/5743))
- Withdraw and revive channel invitation codes ([#5747](https://github.com/deltachat/deltachat-desktop/issues/5747))

### Changed

- Remove experimental feature auditLog & relatedChats ([#5786](https://github.com/deltachat/deltachat-desktop/issues/5786))
- Reorder advanced settings ([#5830](https://github.com/deltachat/deltachat-desktop/issues/5830))
- Update local help ([#5761](https://github.com/deltachat/deltachat-desktop/issues/5761))
- Move group member count ([#5738](https://github.com/deltachat/deltachat-desktop/issues/5738))
- Add "webxdc network isolation" to RELEASE.md
- Add docs for webxdc implementation ([#5458](https://github.com/deltachat/deltachat-desktop/issues/5458))
- Upgrade to core 2.33.0 ([#5817](https://github.com/deltachat/deltachat-desktop/issues/5817))
  - Support multi transport
  - Synchronize transports via sync messages.
  - Case-insensitive search for non-ASCII chat and contact names
  - [breaking] Increase backup version from 3 to 4

### Fixed

- Pass pointer events through footer ([#5768](https://github.com/deltachat/deltachat-desktop/issues/5768))
- Do not minimize the window before hiding it ([#5774](https://github.com/deltachat/deltachat-desktop/issues/5774))
- Readd delete from device ([#5782](https://github.com/deltachat/deltachat-desktop/issues/5782))
- Skip key arrow up if meta key is pressed ([#5780](https://github.com/deltachat/deltachat-desktop/issues/5780))
- Change confirm label ([#5787](https://github.com/deltachat/deltachat-desktop/issues/5787))
- Invert pinch zoom on mac ([#5695](https://github.com/deltachat/deltachat-desktop/issues/5695))
- Avoid "Proxy" dialogs piling up ([#5802](https://github.com/deltachat/deltachat-desktop/issues/5802))
- Blur buttons in dialogs to avoid unexpected enter key behaviour ([#5807](https://github.com/deltachat/deltachat-desktop/issues/5807))
- Reduce image footer width in media only messages ([#5745](https://github.com/deltachat/deltachat-desktop/issues/5745))
- Edit last message when pressing the UP arrow key ([#5713](https://github.com/deltachat/deltachat-desktop/issues/5713))
- Handle ESC key to cancel edit message
- Simplify profile in settings ([#5765](https://github.com/deltachat/deltachat-desktop/issues/5765))
- Remove "Delete from server" setting ([#5784](https://github.com/deltachat/deltachat-desktop/issues/5784))
- Change copy dialog button order ([#5796](https://github.com/deltachat/deltachat-desktop/issues/5796))
- Show correct error message if backup is too new ([#5813](https://github.com/deltachat/deltachat-desktop/issues/5813))

### Performance

- Don't load chats, contacts, gallery twice ([#5727](https://github.com/deltachat/deltachat-desktop/issues/5727))


<a id="2_25_3"></a>
## [2.25.3] - 2025-11-17

### Fixed

- Fix experimental "maps" app not working ([#5735](https://github.com/deltachat/deltachat-desktop/issues/5720))

<a id="2_25_2"></a>
## [2.25.2] - 2025-11-15

### Fixed

- App hanging when opening the "New Chat" dialog or attaching a contact sometimes
- Avatar initials not being always uppercase

<a id="2_25_1"></a>
## [2.25.1] - 2025-11-13

### Fixed
- WebXDC apps only opening on one account

<a id="2_25_0"></a>
## [2.25.0] - 2025-11-12

### Added

- Implement drag-and-drop to reorder accounts ([#5590](https://github.com/deltachat/deltachat-desktop/issues/5590))
- New broadcast channel behaviour (experimental) ([#5686](https://github.com/deltachat/deltachat-desktop/issues/5686))

### Changed

- Upgrade core to 2.25 ([#5665](https://github.com/deltachat/deltachat-desktop/issues/5665))
- Change message link color to blue ([#5701](https://github.com/deltachat/deltachat-desktop/issues/5701))
- Remove "Watch Sent Folder" preference
- Update classic email login wordings ([#5688](https://github.com/deltachat/deltachat-desktop/issues/5688))
- Do not use HTTPS request for default instant onboarding ([#5618](https://github.com/deltachat/deltachat-desktop/issues/5618))
- Remove address from Vcard ([#5672](https://github.com/deltachat/deltachat-desktop/issues/5672))
- Remove email address from chat header ([#5700](https://github.com/deltachat/deltachat-desktop/issues/5700))

### Fixed

- Open WebXDC apps faster, improve security (remove RTCPeerConnection exhaustion (FILL500)) ([#5451](https://github.com/deltachat/deltachat-desktop/issues/5451))
- Writing a message, draft
  - Some draft races and other bugs when switching between chats
  - Some other rare draft message bugs
  - Draft WebXDC name being 'Unknown App' rarely
  - Potential bug with incorrect WebXDC attachment info
  - Set fixed height for "Reply" quote, make it less jumpy when switching between quotes
  - improve performance while writing a message
  - Debounce instead of throttle to save draft - don't save it too often
  - performance: Make message quoting instant
  - a11y: add "Reply" and "Attachment" landmark to message composer
  - Skip info messages on Ctrl-Up ([#5337](https://github.com/deltachat/deltachat-desktop/issues/5337))
- Fix shortcuts on DVORAK layout ([#5667](https://github.com/deltachat/deltachat-desktop/issues/5667))
- Links being unclickable if not written in all lowercase ([#5627](https://github.com/deltachat/deltachat-desktop/issues/5627))
- Remove `:emoji:` replacement on incoming msgs
- Some potential bugs in Chat/ContactList
- Remove "Close" buttons in some dialogs
- Allow closing more dialogs on outside clicks
- Rename 'Save' to 'Save Message' ([#5658](https://github.com/deltachat/deltachat-desktop/issues/5658))
- Remove one wrong translation
- Proper "Send Autocrypt msg" dialog button label
- Handle wrong qr code scans ([#5565](https://github.com/deltachat/deltachat-desktop/issues/5565))
- Crash when clicking settings while loading
- Handle mailto links on chatmail accounts ([#5620](https://github.com/deltachat/deltachat-desktop/issues/5620))
- More contrast for button icons ([#5646](https://github.com/deltachat/deltachat-desktop/issues/5646))
- No "leave group" for contact requests ([#5693](https://github.com/deltachat/deltachat-desktop/issues/5693))
- Fix apps remaining in the chat header after app deletion ([#5692](https://github.com/deltachat/deltachat-desktop/issues/5692))
- Improve drag regions on MacOS ([#5671](https://github.com/deltachat/deltachat-desktop/issues/5671))
- Improve the look of the "Blocked Contacts" dialog ([#5703](https://github.com/deltachat/deltachat-desktop/issues/5703)), ([#5630](https://github.com/deltachat/deltachat-desktop/issues/5630))
- Don't show incorrect member count while joining group ([#5704](https://github.com/deltachat/deltachat-desktop/issues/5704))
- Apply primary style to "Create Channel" btn
- Small UI fixes ([#5633](https://github.com/deltachat/deltachat-desktop/issues/5633))
  * fix: harmonize button alignment for create group & create channel
  * fix: no danger styling on cancel button in "create account progress" dialog
- Update chatmail relays link ([#5645](https://github.com/deltachat/deltachat-desktop/issues/5645))
- Update "Maps" app ([#5705](https://github.com/deltachat/deltachat-desktop/issues/5705))
- Calls: show initial letter img if no avatar
- Calls: add "P2P" / "non-P2P" text


<a id="2_22_0"></a>

## [2.22.0] - 2025-10-17

### Changed
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.22.0`

<a id="2_20_0"></a>

## [2.20.0] - 2025-10-14

### Fixed
- refactor proxy dialog styles to fix #5507
- some strings being untranslated
- VCard (share contact) avatars not having color (all being gray instead) #5552
- some emoji avatars displaying incorrect emoji
- handle invalid qr code properly #5555

### Changed
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.20.0`
- update translations (7-10-2025)

### Removed
- remove experimental video chat invitation link feature


<a id="2_15_0"></a>

## [2.15.0] - 2025-10-02

### Added
- support multiple selection (multiselect) in the list of chats, activated with Ctrl + Click, Shift + Click #5297
- allow to scan a proxy url from QR code #4290

### Changed
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.15.0`
  - withdraw all QR codes when one is withdrawn
  - do not create a group if the sender includes self in the To field
- minor visual improvements to keyboard shortcut preview #5495

### Fixed
- Display message error even for messages that are not OutFailed #5498
- fix app picker sometimes incorrectly showing "Offline"
- allow using the app picker even when offline, as long as the app store data is cached
- if adding an app from the app picker fails, show an error dialog
- fix "Recent 3 apps" in the chat header showing apps from another chat sometimes #5265
- accessibility: improve screen-reader accessibility of the general structure of the app by using landmarks #5067
- accessibility: don't re-announce message input (composer) after sending every message #5049
- accessibility: don't announce delivery status twice after sending a message #5442
- accessibility: correct `aria-posinset` for chat list #5044
- don't close context menues on window resize #5418
- tauri: accessibility: fix focus always being locked on the message input #5125
- fix: remove weird bottom margins in some scrollable dialogs #5494
- upgrade electron from `37.1.0` to `37.6.0` #5499
  - this fixes high GPU usage bugs on macOS Tahoe

<a id="2_11_1"></a>

## [2.11.1] - 2025-09-01

### Added
-flip electron fuses to avoid security debates #5423
- add "one year" option for disappearing messages #5421

### Fixed
- unexpected zoom/scroll behaviour #5426
- don't show "Reply" and "Save" for info messages (e.g. "user A removed user B") and video call invitations #5337
- don't show mail addresses for key contacts #5430

<a id="2_11_0"></a>

## [2.11.0] - 2025-08-18

### Added
- support RTL layout if locale.dir = rtf #4168
- added estonian language
- add more rtl configurations to languages that use it

### Changed
- update translations (15-08-2025)
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.11.0`
  - Do not add key-contacts to unencrypted groups.
  - Do not reset GuaranteeE2ee in the database when resending messages.
  - Take Chat-Group-Name into account when matching ad hoc groups.
  - Don't break long group names with non-ASCII characters.

### Fixed
- share email contacts by email not by VCard #5364
- Truncate app title and description in app picker
- do not open self chat on info message click #5361
- fix Connectivity colors in dark mode #5397
- Not fully downloaded messages display an ✉️ icon #5399
- fix new chat button bg in dark modes #5183

<a id="2_10_0"></a>

## [2.10.0] - 2025-08-05

### Fixed
- don't show "Edit Message", "Disappearing Messages" and fullscreen avatar view in classic E-Mail chats #5365
- the upgrade `application-config` to `^3.0.0` allows the desktop client to be built on FreeBSD
- accessibility: improve keyboard and screen reader accessibility of the "Add Reaction" menu #5376
- accessibility: make screen readers announce where a context menu is available (opened with Shift + F10): apply `aria-haspopup="menu"` #5345
- accessibility: add proper labels to some menus (e.g. message context menu, chat list item context menu) #5347, #5355
- accessibility: apply `aria-expanded` to parent menu items (e.g. "Mute Chat" menu) #5354

### Changed
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.10.0`

<a id="2_9_0"></a>

## [2.9.0] - 2025-07-30

### Changed
- removed "Add contact manually" when on chatmail account #5358
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.9.0`

### Fixed
- don't show "add contact manually" (by email address) for groups #5336
- Make `Archived Chats` title non selectable

<a id="2_8_0"></a>

## [2.8.0] - 2025-07-28

### Changed
- upgrade `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.8.0`

<a id="2_7_0"></a>

## [2.7.0] - 2025-07-27

### Changed
- upgrade `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.7.0`


<a id="2_6_0"></a>

## [2.6.0] - 2025-07-24


### Breaking
- after upgrade to `@deltachat/stdio-rpc-server` version `2.x` your account data will be migrated and you can not go back to 1.x versions any more, since account data is not backward compatible!

### Changed
- updated help pages #5324
- update translations (17-20-2025)
- upgrade `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `2.6.0`
  - Features / Changes
    - Donation request device message (#6913).
- remove resetEncryptionInfo
- remove the green checkmark since it's default now
- show verified status: "Introduced" if verified but no verifier name #5327

### Added
- feat: add channel and remove broadcasts #5258
- Option to create a new plain email with subject and recipients (available only for non-Chatmail accounts) #5294
- no more edit of mailing list profiles for recipients
- After some time, add a device message asking to donate. Can't wait? Donate today at https://delta.chat/donate #5295
- show email icon for non encrypted messages instead padlock for encrypted

### Fixed
- fix outdated info being shown sometimes in some places #5222, #5225
- accessibility: add accessible labels for lists (messages list, chat list, profiles list) #5030
- accessibility: mark chat list items as tabs #5041
- don't execute Ctrl + Up shortcut if the message input is not focused
- improve performance: reduce delay of some events (e.g. display badge counter changes faster) #5224
- improve performance: remove message context menu open delay
- improve performace in global search and contact search #5230, #5232
- improve performance: don't mark messages as seen unnecessarily when focusing window #5243
- improve performance in "Edit Group" a little #5237
- tauri: accessibility: fix outline being barely visible on Windows, and adjust some other colors #5217
- improve performance a little in some other places #5225
- fix copying of links into richtext editors #5286

<a id="1_60_1"></a>

## [1.60.1] - 2025-07-10

### Changed
- downgrade `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.159.5` (till next major release)

<a id="1_60_0"></a>

## [1.60.0] - 2025-07-10

### Added
- Update last used app icons immediately after sending a new app

### Changed
- adjust distance between info messages to match Delta Chat for Android #5244
- tauri: macOS: webxdc: Remove the nowhere-proxy to support pre-14 macOS. #5202
- reword 'Save As' to 'Export Attachment' to have a clearer cut to 'Save' #5245
- use rpc.getWebxdcInfo instead of message.webxdcInfo #5227
- upgrade `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.160.0`
- upgrade electron from 34 to 37 #5229
- update translations (07-07-2025)
- development: introduce new condition to publish build previews

### Fixed
- always set "unread" count to 0 when "jump to bottom" is clicked #5204
- fix the last info message not getting marked as read when you scroll to it #5244
- tauri: remember webxdc app windows' position and size between app re-launches
- tauri: remember HTML email viewer window position / size for all HTML messages together, instead of separately for each individual message #5171
- tauri: fix fullscreen media view zoom, pan, pinch not working quite right #5200
- tauri: fix fullscreen avatar for selfavatar #5240
- fix: showing 0 instead ? as size for empty files #5253
- show avatar for deleted saved messages #5221
- increase contrast between background and unread badge in dark theme #5273

<a id="1_59_2"></a>

## [1.59.2] - 2025-06-25

### Added
- Zoom In/Out with Ctrl +/- #890

### Fixed
- reduce delay of some events (e.g. display badge counter changes faster)
- fix notifications not working sometimes, introduced in 1.59.1
- fix dropping files from outside not working on Windows, introduced in 1.59.1
- fix "Copy Selected Text" item never appearing in message context menu
- fix `runtime.isDroppedFileFromOutside` is not working as indended #5165, #5197
- accessibility: fix incorrect "Gallery" button "tab" role, introduced in 1.59.0
- tauri: fix drag and drop on macOS #5165
- translate "Emoji" and "Sticker" in emoji & sticker picker
- tauri: fix webxdc apps not receiving `visibilitychange`, `beforeunload` and `pagehide` when the window gets closed (except on macOS) #5065
- tauri: save zoom level between webxdc app launches #5163
- tauri: fix "Connectivity" dialog being unreadable on dark theme
- tauri: prevent moving around of the whole app with the touchpad gestures on windows #5182
- fix horizontal scroll in message list #5162

<a id="1_59_1"></a>

## [1.59.1] - 2025-05-29

### Added
- show a notification when receiving a message in any chat except the currently open one, instead of only showing notifications for other accounts
- add a sound effect that plays when a message gets received in the currently open chat (can be turned off)
- add flatpak support for tauri
- add drag and drop to tauri

### Changed
- infinite loading for gallery #4868

### Fixed
- improve performance a little
- show all shared chats at once in contact profile #4982
- tauri: hardening: ensure that random sites can't send a message if the user allows the website to open Delta Chat on Windows

<a id="1_59_0"></a>

## [1.59.0] - 2025-05-26


### Added
- open all media view (gallery) in an own dialog #5141 #5074
- show last apps in chat navbar

### Changed
- update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.159.5`
  - Don't change webxdc self-addr when saving and loading draft
- development:
  - upgrade to react 19.x
  - upgrade typescript 5.8.3
  - upgrade eslint 9.x and prettier 3.5.x
- Update message-parser to v0.14.1
  - Allow multiple `#` characters in links (fixes matrix links)
  - Parse scheme-less links for some TLDs (links without `https://`-prefix)

### Fixed
- crash when a member gets added to a group and "View Group" dialog is open #5111
- show appropriate state in AddMemberDialog #5114
- tauri: fix: ignore `dcnotification:` deep-link when the app is already running
- define max height for video in drafts #5128
- avoid overriding changes when adding/removing group members #5132

<a id="1_58_2"></a>

## [1.58.2] - 2025-05-14

### Added
- new proxy configuration dialog #5052
- tauri: added notifications
- tauri: ask for media permissions on macOS #5103

### Changed
- restyle profile view #5093
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.159.4`
  - Better avatar quality
  - Update iroh from 0.33.0 to 0.35.0

### Fixed
- show error when sendMsg fails #5092
- update search results on changes #5100

<a id="1_58_1"></a>

## [1.58.1] - 2025-05-07

### Fixed
- ugly margins / paddings on some saved messages with attachments #5047
- accessibility: improve emoji and sticker picker accessibility: specify "tabs" layout
- accessibility: announce when someone reacts to a message in the current chat
- accessibility: don't redundantly announce "Chat property page" when the focus enters the chat #5076
- reduce build size by excluding migration tests

<a id="1_58_0"></a>

## [1.58.0] - 2025-05-06

### Added
- tauri: support for webxdc #4740, #4852, #4949
- create chat: add context menu option to view profile #4880
- focuses first visible item on arrow down key on input in create chat dialog #4892
- create chat: add support for invite links to search bar #4893
- add separators to the context menu #4883
- add button to share contact from profile view dialog #4886
- tauri: experimental: make it compile for android #4871
- `Cmd + N` shortcut to open new chat and `Cmd + F` / `Cmd + Shift + F` to focus search on macOS #4901, #5013
- tauri: add cli interface: `--help`, `--version`, and developer options (like `--dev-mode`) #4908
- enable support for recording audio messages
- tauri: handle resume from sleep #4926
- tauri: add `--watch-translations` cli flag #4925
- tauri: add tray icon #4922
- tauri: add taskbar icon "unread" badge on Windows
- tauri: add `--minimized` flag #4922
- tauri: add theming #4940
- tauri: add autostart #4754
- tauri: add chat background image customization support
- testing: add more e2e tests for onboardings etc. #5001
- clicking info messages with contacts open the contact's profile
- tauri: add deeplinking support and opening `.xdc` files to attach them #4956

### Changed
- switch to account the webxdc is from when sending to chat (tauri and electron edition) #4740
- change the Reply button for messages to be a verb rather than a noun #4853
- only render markdown links when enabled in settings #4875
- Update message-parser to v0.13.0
- slight gradients for avatars for a more modern look #4877
- change usage of `nameAndAddr` to `displayName` #4882
- remove addresses from contact list items unless they are not verified. #4880
- migrate account mute state to new is_muted config option #4888 #4924
- technical: change script format and imports to esm/module #4871
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.159.3`
  - Simplify e2ee decision logic, remove majority vote
  - Stop saving txt_raw
  - Do not fail to send the message if some keys are missing
  - Synchronize contact name changes
  - Remove email address from 'add second device' qr code
  - Fix deadlock in get_all_accounts()
  - Encrypt broadcast lists
- hide 'show classic email' for chatmail, move down otherwise #4902
- profile view redesign #4897
- update translations (2025-04-09)
- show signature/bio in settings #4984
- change to new transport API #4849
- update `sass` from `1.77.8` to `1.86.3` #4940
- improve attachment menu ordering #5000

### Fixed
- tauri: improve security #4826, #4936, #4937, #4944
- improve fatal error dialog readability by removing color from deltachat-rpc-server errors
- prevent dragging around of webxdc icon #4740
- tauri: clear temp folder on exit #4839
- fix wrong punycode warnings in links #4864
- improve image display #4410
- hide additional reactions behind button #4322
- scroll to top when search query changes
- fix esc key closing wrong dialog in settings #4865
- fix member list is not refreshed if it changes while you look at the group profile #4894
- remove unexpected horizontal scroll in gallery #4891
- i18n: fix wrong order of substitutions for some strings #4889
- i18n: translate some more strings
- accessibility: don't announce "padlock" on messages
- fix double escape bypasses dialog attribute `canEscapeKeyClose={false}`
- fix order when sending multiple files at once #4895
- fix error messages not being shown on some errors, e.g. when QR scan action fails
- tauri: fix: sticker picker previews not working
- tauri: fix emoji picker being super ugly
- tauri: fix color picker appearing during initial page load
- tauri: fix fullscreen media pan acting a little weird
- tauri: use current locale in "Help" window when opening it through menu
- tauri: fix launching a second instance of Delta Chat not focusing the main window if it's closed
- fix chatlist items sometimes not updating #4975
- fix sticker folder not resolved on windows #4939
- tauri: improve performance a little #4812
- settings: fix: wait for setting to be applied before calling callback #4754
- tauri: prevent webrtc from being accessed in webxdc apps #4851
- webxdc apps sometimes having wrong `selfAddr`, resulting in apps treating the same user as a new one (e.g. the "Poll" app would allow you to vote twice) #5068
- accessibility: add accessible labels and descriptions to more items #5050, #5055
- accessibility: add `role='tablist'` for accounts list #5040
- accessibility: add alt text for QR invite code image
- accessibility: improve tabbing behavior of searh results
- accessibility: announce when a message gets edited and outgoing message delivery status changes (`aria-live`)
- reduce voice messages to a lower bitrate #4977
- tauri: improve security #4959

### Removed
- remove experimental option to disable IMAP IDLE #4991
- tauri: disable long press link preview

<a id="1_57_1"></a>

## [1.57.1] - 2025-05-03 Test release


<a id="1_57_0"></a>

## [1.57.0] - 2025-04-24 Test release

<a id="1_56_0"></a>

## [1.56.0] - 2025-03-21

### Added
- add a way to edit messages #4717
- delete message for all chat members #4716
- tauri: add support for sticker picker #4707
- tauri: add html email view #4699
- tauri: add titlebar menu #4755 #4787
- tauri: implement runtime.copyFileToInternalTmpDir and allow opening files in temp dir #4778
- add option to reset encryption state for contact in encryption info dialog #4797
- tauri: implement backend translation fn and use it in tauri files as needed #4790
- add withdraw qr code context menu option #4798
- adapt dialogs for small screens
- mute chat for 8 hours
- add a hint to "Edit profile" about how the profile name, image and bio is transferred #5014

### Changed
- tauri: replace `tauri-plugin-shell` with `tauri-plugin-opener` #4699
- new button styles #4741
- removed the option to import encryption keys #4783
- remove end-to-end encryption preferences from settings (e2e encryption is always preferred when available) #4782
- add dialog with hints about invite link #4667
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.157.3`
  - Delete messages on IMAP when deleting chat
  - Allow doubled avatar resolution
  - Update iroh to 0.33
  - Ignore hidden headers in IMF section
  - Prefer hidden Message-ID header if any.
  - Update async-compression to 0.4.21 to fix IMAP COMPRESS getting stuck
- update translations (2025-03-17)
- update local help (2025-03-20)
- remove handling for receiving autocrypt setup message #4822

### Fixed
- fix some webxdc apps showing the "Close app?" prompt unintentionally #4737
- fixed some intermittent e2e test issues
- improve QR scanner performance
- avoid UI freeze when processing QR code from clipboard #4639
- webxdc: fix menu bar hiding when pressing Escape #4753
- tauri: fix blobs and webxdc-icon scheme under windows #4705
- tauri: fix app picker not working for some apps
- tauri: fix: drag regions in navbar #4719
- tauri: fall back to base locale if dialect/variant was not found
- tauri: entire app hanging after clicking "Show Full Message..." or the "Help" window on Windows
- tauri: fix SVG images not being displayed in composer draft
- tauri: fix open logfile from settings, fix opening stickerfolder, fix opening weblinks #4778
- tauri: hardening: allow commands for windows in a white-list manner #4795
- tauri: improve security a little #4813
- tauri: improve performance a little #4810
- tauri: translation fn: added fallback to en when a key doesn't exist in a particular language #4818
- fixed: Mac ask for Microphone access #4986

<a id="1_54_2"></a>

## [1.54.2] - 2025-03-03

### Added
- show error message if backup version is not compatible #4721
- show "Edited" in the message's status line (if it's edited) #4697
- add "learn more"-button to manage-key section that links to local help #4684
- tauri: add support for sticker picker
- add a search field to help page #4691
- update local help (2025-02-21)
- update translations (2025-03-03)
- feature: save messages in self chat and show a bookmark icon #4674

### Changed
- open map in landscape orientation and with a bigger window #4683
- update `esbuild` from `0.23.0` to `0.25.0` #4643
- extend some shortcuts to listen to key OR code #4685
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.156.2`
  - Update mailparse to 0.16.1 to fix panic when parsing a message
  - Don't send a notification when a group member left (#6575).
  - Fail on too new backups (#6580)
  - When reactions are seen, remove notification from second device (#6480).
  - Sort past members by the timestamp of removal.
  - Use UUID v4 to generate Message-IDs.
  - Use dedicated ID for sync messages affecting device chat.
  - Do not allow non-members to change ephemeral timer settings.
  - Show padlock when the message is not sent over the network.
- when searching for messages in a single chat, do not show the redundant chat name in each search result #4696
- html email view: migrate from deprecated `BrowserView` to `WebContentsView` #4689
- update translations (2025-02-28)
- Update local help (2025-03-01)
- Make it possible to pass --allow-unsafe-core-replacement to `pnpm run dev:electron` #4733.

### Fixed
- fix webxdc apps being unclosable, when using `beforeunload` event #4728
- message list being empty when double-clicking the chat before it has loaded (again) #4647
- accessibility: improve tab order of the app #4672
- other minor accessibility improvements #4675
- improve performance a little #4512
- fix missing maps.xdc in flatpak build #4682
- constrain size of webxdc window by available screen-workarea-space #4683
- fix that in html email view links without schema didn't open in browser #4690
- fix clicking on the same anchor multiple timed disn't work in html email view #4690
- close second level settings form with Escape key #4128
- tauri: fix blobs and webxdc-icon scheme under windows #4705

<a id="1_54_1"></a>

## [1.54.1] - 2025-02-17

### Fixed
- fix unread count on "jump down" button not clearing when all messages are read #4648
- keep the order of contacts when calling getContactsByIds #4651, #4652
- improve accessibility #4655, #4656, #4661, #4662

<a id="1_54_0"></a>

## [1.54.0] - 2025-02-15

### Changed
  - Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.155.5`
  - set mentionsEnabled in muted chats to true by default #4633

### Fixed
- "Show in Chat" in Gallery not working #4629
- Fix ~3 second freeze after switching the chat #4638
- fix chat list showing the chat that is different from the currently selected chat when switching chats rapidly, again #4628
- fix source code links in app picker #4637
- fix a resource leak accumulating when opening media in full screen #4634

<a id="1_53_0"></a>

## [1.53.0] - 2025-02-10

### Breaking

 - Due to the Electron update, macOS 10.15 (Catalina) is no longer supported, macOS 11 (Big Sur) or later is the new requirement.

### Added
- highlight the first unread message upon opening a chat #4525
- copy files to internal tmp dir before opening attachements #4498
- enable notifications on mentions in muted chats #4538
- e2e test for group creation #4614
- always show accounts with unread messages, even when they're normally scrolled out of view #4536
- make log additionally available at "Settings / Advanced / View Log" #4610
- improvements to tauri version #4528 #4585 #4533:
  - read images from clipboard, write images to clipboard, write/delete temporary files
  - implement experimental setting: content protection
  - api to change language
  - help window localisation
- display past members in the group member list #4531

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.155.4`
  - Store device token in IMAP METADATA on each connection
  - Deduplicate blob files in chat.rs, config.rs, and integration.rs.
  - Upgrade to iroh@0.32.0 & pgp to 0.15.
  - Use CRLF newlines in vCards
  - fix second device incompatibility v1.155.2 - v1.155.1
- shortcut improvements:
  - Ctrl + F now focuses search, instead of Ctrl + K
  - Ctrl + Shift + F to search in chat
  - Ctrl + M now focuses composer, instead of Ctrl + N
  - Ctrl + N now opens "New Chat" dialog
  - Pressing "Enter" or "Arrow Down" in the search focuses the first item
    (from which point arrow keys can be used to navigate items)
    instead of opening the first chat
  - Focusing the search input with a shortcut now doesn't clear it
- Improve backup transfer dialog (different message for connection step, timed message to tell user to check out troubleshooting, button to link to trouble shooting) #4476
- store last used account in accounts.toml managed by core #4569
- update help menu URLs #4598
- Update local help (2025-02-10)
- tauri: update dependencies #4607
- upgrade Electron from `32.1.0` to `34.0.1` #4568
- Update translations (2025-02-07)

### Fixed
- fix changelog message left unread not in the selected account as it should be but in another account. #4569
- accessibility: some context menu items not working with keyboard navigation #4578
- fix messages sent to "Saved Messages" not being displayed sometimes #4582
- fix "jump down" button displaying incorrect unread count (the value from another chat) #4593
- fix clicking on message search result or "Reply Privately" quote not jumping to the message on first click sometimes, again #4554
- accessibility: not being able to focus arrow-key navigable widgets that contain disabled items with disabled elements (such as in the "add contacts to group" widget)
- fix jumping to message in a different chat momentarily opening the new chat scrolled to bottom before scrolling it to the desired message #4562
- fix log format for logging core events #4572
- fix dragging files out
- memory leak when opening and closing emoji picker #4567
- fix chat list showing the chat that is different from the currently selected chat when switching chats rapidly #4615
- fix selected account not getting scrolled into view in accounts bar on app start #4542
- message list being empty sometimes when a chat gets opened #4556
- accessibility: improve chat list, message list and contact list semantics #4518
- improve performance a little #4561, #4552, #4584
- fix "Empty Hints" in "All Media" view #4609
- fix pasting of (non image) files into composer #4533
- fix translation PluralRules fallback to 'en' not to 'en-US' (en-US isnt valid) #4585

<a id="1_52_1"></a>

## [1.52.1] - 2025-01-27

### Added
- settings: explain "Read Receipts" and adjust "Enter Key Sends" title #4524
- accessibility: focus message when jumping to it in some cases (e.g. when clicking on a quote) #4547
- add special error dialog for the case that deltachat-rpc-server is not found #4479

### Changed
 - Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.155.1`
   - feat: Set BccSelf to true when receiving a sync message
   - improvement: file deduplication
   - fix: Don't accidentally remove Self from groups
   - only accept SetContacts sync messages for broadcast lists

### Fixed
- message list being empty when opening a chat in some cases #4555
- numpad "Enter" not working as regular "Enter" #4546
- improve performance a little

<a id="1_52_0"></a>

## [1.52.0] - 2025-01-23

### Added
- added experimental tauri version (`packages/target-tauri`) #4462

### Changed
- add some missing translations
- order search results by relevance in App Picker #4506
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.154.3`

### Fixed
- fix chat being scrolled up a little right after you switch to it (rev 3) #4521
- fix chat scrolling up a bit when quoting a message or adding attachment to draft (rev 2) #4529
- fix cancelation of account deletion when canceling clicking outside of the dialog
- fix unread counter on "jump to bottom" button showing incorrect count (taking the count from other chats) #4500
- fix unread counter on app's badge not updating when reading messages from other device #4539
- fix clicking on message search result or "reply privately" quote not jumping to the message on first click #4510
- fix messages from wrong chat being shown after clicking on "jump down" button after revealing a message from a "Reply Privately" quote #4511
- accessibility: fix VCards (share contact) being tab-stops even in inactive messages #4519
- fix flickering in "Send to..." appearing on some zoom levels #4534

<a id="1_51_0"></a>

## [1.51.0] - 2025-01-16

### Added
- accessibility: arrow-key navigation for message list, gallery and sticker picker #4294, #4376, #4372,
- accessibility: arrow-key navigation: handle "End" and "Home" keys to go to last / first item #4438
- add show_app_in_chat option to webxdc info message context menu #4459
- add experimental content protection option (to prevent screenshots and screenrecording the app) #4475
- app picker for webxdc apps in attachement menu #4485

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.154.1`
  - New group consistency algorithm
  - fix: Migration: Set bcc_self=1 if it's unset and delete_server_after!=1
- dev: upgrade react to v18 and react pinch pan zoom to v3
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.153.0`
  - rpc-client: Add INCOMING_REACTION to const.EventType
  - Add IncomingWebxdcNotify.chat_id
  - Update shadowsocks crate to 1.22.0 to avoid panic when parsing some QR codes
  - Never change Viewtype::Sticker to Image if file has non-image extension
  - Change BccSelf default to 0 for chatmail
  - Don't treat location-only and sync messages as bot ones
  - Update shadowsocks crate to 1.22.0 to avoid panic when parsing some QR codes.
  - Prefer to encrypt if E2eeEnabled even if peers have EncryptPreference::NoPreference.
  - Allow empty `To` field for self-sent messages.
  - displayname may not be empty anymore #4471
- update `@deltachat/message_parser_wasm` from `0.11.0` to `0.12.0` #4477

### Fixed
- fix draft not getting cleared after sending the message #4493
- fix draft not getting saved after inserting an emoji #4493
- fix chat "scrolls up" right after switching (rev 2) #4431
- when deleting a message from gallery, update gallery items to remove the respective item #4457
- accessibility: fix arrow-key navigation stopping working after ~10 key presses #4441
- accessibility: make more items in messages list keyboard-accessible #4429
- fix "incoming message background color" being used for quotes of outgoing sticker messages #4456
- fix stickers being smaller than they're supposed to be #4432
- fix reactions to sticker messages overlapping with next message #4433
- fix: "Enter" not adding the first contact in "Add Members" dialog #4439
- fix: devmode: fix logging and counting jsonrpc requests #4458
- fix: validate proxy_url before enabling proxy #4470
- performance: don't re-render every time the window is resized #4460
- rename language "Luri Bakhtiari" to the local name #4472

## [1.50.1] - 2024-12-18

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.152.1`

### Fixed
- downgrade rust in core to avoid wrong Windows malware detection https://github.com/deltachat/deltachat-core-rust/issues/6338

## [1.50.0] - 2024-12-17

### Added
- show specific notifications for webxdc events #4400
- expose sendUpdateInterval & sendUpdateMaxSize in webxdc

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.152.0`
- mark bots as such in chat header and in contact view dialog #4405

### Fixed
- handle double escape on Dialog #4365
- fix random crashes on quote reply #4337
- avoid drafts in readonly chats #4349
- fullscreen images getting cropped a little #4402, #4385
- QR code dialog now showing the QR code in full if window is short, and being scrollable instead #4416
- settings: chat background preview element not working for the default background image #4403
- macOS: make area under traffic lights dragable and fix the bug that its size changed based on profile acount and window height #4408
- fix chat "scrolls up" right after switching #4404
- quote text being unreadable for sticker replies in light theme #4417

<a id="1_49_0"></a>

## [1.49.0] - 2024-12-05

### Added
- accessibility: arrow-key navigation for the list of chats, list of accounts, lists of contacts, gallery tabs #4224, #4291, #4361, #4362, #4369, #4377
- Add "Learn More" button to "Disappearing Messages" dialog #4330
- new icon for Mac users
- smooth-scroll to newly arriving messages instead of jumping instantly #4125
- make backup and key export work in browser #4303
- add ability to add private tags to accounts
- dev: run e2e tests in CI

### Changed
- enable Telegram-style Ctrl + ArrowUp to reply by default #4333
- improve performance a little #4334
- extend image max-height in messages
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.151.1`
- dev: inviteCode doesn't needs conversion any more #4363
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.151.2`
- description parameter in webxdc.sendUpdate is deprecated now #4359
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.151.3`
- click on WebxdcInfo Message immediately opens webxdc app #4380
- href can be passed to webxdc sendStatusUpdate to show event related content
- dev: move responsibility for updating account list to core through the `AccountsChanged` and `AccountsItemChanged` event
- add dc version, os name and cpu architecture to fatal errors for better error reports #4384

### Fixed
- "Disappearing Messages" dialog not reflecting the actual current value #4327
- accessibility: make settings keyboard-navigable #4319
- Fix documentation for --allow-unsafe-core-replacement #4341
- fix missing linebreaks in quotes #4360
- avoid showing wrong menu items for blocked users #4353
- fix: save message draft every 200ms if message text changed #3733
- fix mac drag window issues #4300 #4385
- the main window overflowing small screens, or/and if zoom level is high #4156
- do not clear the draft if sending failed. #4340
- "Search in \<chat name\>" divider overflowing for long chat names #4375
- fix startup delay on linux #4379
- fix: remove visible scrollbars in fullscreen media view #4385


<a id="1_48_0"></a>

## [1.48.0] - 2024-11-08

### Changed
- Update translations (2024-11-08)
- Update local help (2024-11-08)
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.148.7`
  - Emit chatlist events only if message still exists
  - send_msg_to_smtp: Do not fail if the message does not exist anymore
- move the "Realtime Webxdc Channels" setting out of the "Experimental" section #4316

### Fixed
- image attachments not being centered within a message #4313


<a id="1_47_1"></a>

## [1.47.1] - 2024-11-01

### Added
- Added support for selecting multiple files in the attachment file picker. #4278
- browser edition:
  - support for selecting custom chat wallpaper #4306
  - support for themes #4304
- improve keyboard and screen-reader accessibility #4210

### Changed
- style: avoid scrolling to account list items such that they're at the very edge of the list #4252
- Update local help (2024-10-25) #4264
- Update translations (2024-27-10) #4281
- Limit options for "Delete Messages from Server" for chatmail accounts #4276
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.148.6`
  - IMAP COMPRESS support.
  - Sort received outgoing message down if it's fresher than all non fresh messages.
  - Auto-restore 1:1 chat protection after receiving old unverified message.
  - Enable Webxdc realtime by default (!)
  - Save full text to mime_headers for long outgoing messages #4289
- when jumping to a message (e.g. when showing the first unread message, or when jumping to a message through "show in chat"), position it more appropriately in the scrollable area #4286
- Dropping multiple files onto deltachat now sends images as compressed images instead of uncompressed files #4278


### Fixed
- image thumbnails not showing in chat list #4247
- progress bar not working #4248
- avoid showing horizontal scrollbars in chat list #4253
- revert debian packagename from `deltachat` back to `deltachat-desktop` #4266
- style: fix VCard color being too bright in dark theme #4255
- style: less vertical space between radio group items #4298
- style: fix the avatar in the profile dialog being oval-shaped #4299
- remove unnecessary horizontal scrollbar in "View Group" dialog #4254
- add missing cancel buttons to import-/export- and reveive-backup progress dialogs #4272
- change title and button label of EditAccountAndPasswordDialog to make it clearer that it is about email account #4271, #4279
- fix styling of progressbars in light theme #4274
- fix Delta Chat not launching on Debian sometimes due to missing package dependencies (`libasound2`) #4275
- fix not being able to remove avatar for a mailing list #4270
- fix compression of images when added with Image option from attachment menu. #4278
- fix deleting messages with broken video attachment from gallery #4283
- accessibility: wrong positioning of some context menus and popups when activating them with keyboard #4246
- "Page Up" / "Page Down" not working on scrollable elements except for messages list #4269
- make name more readable in sticker reply #3291
- fix missing icons in wallpaper settings #4308

<a id="1_47_0"></a>

## [1.47.0] - 2024-09-22

### Added
- Experimental Telegram-style Esc to cancel reply (quote) #4153
- new ViewProfile context menu for blocking/unblocking contact and checking encryption #4043
- added experimental browser version for developers (`packages/target-browser`)

### Changed
- Update electron from `30.3.1` to `32.1.0` #4138
- dev: transformed repo into monorepo
- dev: switched from `npm` to `pnpm`
- dev: esbuild bundling for electron main process js (+minification for releases)
- changed implementation for accepting dropped in files, use browser apis instead of electron specific hack.
- dev: improved `./bin/test_for_missing_translations.sh` script: It is now more correct, helpful and faster
- windows 64bit and 32bit protable and setup now have different filenames #4131
- scroll the selected account into view in the accounts sidebar #4137
- dev: clarify scrolling-related code #4121
- improved performance a bit #4145, #4188, #4206
- show contact / group name & avatar when pasting invite link in the search field #4151, #4178
- Update local help (2024-10-02) #4165
- trim whitepaces when reading from clipboard in qr code reader #4169
- load chat lists faster (the chat list on the main screen, "Forward to..." dialog, etc)
- when jumping to message, don't scroll the message list if the message is already in view #4204
- replace BlueprintJS Button, Icon, Radio, RadioGroup, Collapse, Dialog with our implementation #4006, #4226
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.147.1`
- Update proxy configuration - a full url can be entered now
- show "Mark All As Read" in account menu unconditionally #4234
- Update translations (2024-22-10) #4238

### Fixed
- fix that you can not click header button in dialog when they are on top of the navbar #4093
- fix if Contact has long bio/signature, then shared chats were hidden #4093
- dev: proper native source-map support during development for main process
- dev: use correct log level when logging to console in main process
- security: harden electron_functions, only runtime can use them now
- security: harden runtime interface by deleting the reference on window (`window.r`) after the first use. For development it is now accessible at `exp.runtime` but only in `--devmode` like `exp.rpc`
- dev: update `./bin/update_background_thumbnails.sh` script
- fix chatlist image thumbnails #4101, #4139
- fix: spacing around avatars in reaction details dialog #4114
- fix: wrong translation string for new group creation #4126
- fix: packaging: windows 64bit and 32bit releases now have different filenames, bring back 64bit windows releases. #4131
- some shortcuts (e.g. `Ctrl + N`, `Ctrl + K`) not working on some languages' keyboard layots #4140
- fix chat "scrolling up" when someone adds a reaction, resulting in new messages not getting scrolled into view when they arrive #4120
- fix missing space between overriden sender name and image attachment #3914
- when adding new line for a long multi-line message, the cursor would get out of view #4152
- Chat "scrolling up" when typing a multi-line message, quoting a message, or adding an attachment, resulting in new messages not getting scrolled into view #4119
- crash on clicking "About" when no account is selected (e.g. after deleting an account) #4154
- show "new group" instead of "new contact" when pasting a group invite link in the search field #4151
- message input getting unexpectedly re-focused, and not re-focused after some actions if the draft text is not empty #4136
- fix: exit search when clicking on profile when the selected profile is already the selected account #4166
- "Encryption Info" dialog showing all info in one line #4162
- losing scrolling "momentum" while scrolling the messages list fast #4122
- fix crash when you chose Settings from a context menu on account you haven't selected #4190
- fix All Media not opening from a context menu on account you haven't selected #4191
- cancel old message highlight animations when a new message is highlighted #4203
- fix: packaging: include architecture in filename for all appimages #4202
- fix: make open external link scheme case insensive #4201
- some reactions dialog items not being clickable on secondary accounts (profiles) #4228
- target-electron: make sure log of stdio server is also logged to file
- improve accessibility a little #4133
- fix "Mark All As Read" in account menu mark also archived chats as read
- use authname instead of displayname for vcard filename #4233
- ugly positioning of reactions on image-only messages #4237


<a id="1_46_8"></a>

## [1.46.8] - 2024-09-09

### Changed
- do not display email adresses in reactions dialog #4066
- click on a row in reactions dialog opens contact profile #4066

- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.12`
  - Display `Config::MdnsEnabled` as true by default.

### Fixed
- fix newlines in messages with WebXDC attachments #4079
- being unable to delete a nonfunctional account imported from ArcaneChat #4104
- Ctrl/Cmd+Q (also File->Quit) now should properly close the app when focus is on main window


<a id="1_46_7"></a>

## [1.46.7] - 2024-09-02

### Changed

- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.11`
  - Set backward verification when observing `vc-contact-confirm` or `vg-member-added`


<a id="1_46_6"></a>

## [1.46.6] - 2024-08-29

### Changed

- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.10`
  - Fixed panic on unknown "certificate checks" configuration. This is needed for backwards compatibility with backups imported from future versions of Delta Chat.
  - Fix reading of multiline SMTP greetings.
  - Update preloaded DNS cache.
  - Only include one `From:` header in securejoin messages

### Fixed
- Experimental Telegram-style Ctrl+Up/Down: improve behavior to align more with Telegram #4088
- Allowed webp in image selector, added webp consistantly #4087
- enhance edit name dialog #4090

<a id="1_46_5"></a>

## [1.46.5] - 2024-08-19

### Fixed
- fix blocked composer after secure join #3917

<a id="1_46_4"></a>

## [1.46.4] - 2024-08-16

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.7`
  - Increase timeout for QR generation to 60s #5882
  - Fix default to strict TLS checks if not configured #5888
  - Update rpgp 0.13.2 to fix "unable to decrypt" errors when sending messages to old Delta Chat clients using Ed25519
  - Do not request ALPN on standard ports and when using STARTTLS
  - for more see [Changelog](https://github.com/deltachat/deltachat-core-rust/blob/v1.142.7/CHANGELOG.md)

<a id="1_46_3"></a>

## [1.46.3] - 2024-08-14

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.4`

### Fixed
- Fix account import in BACKUP2 format #4075

<a id="1_46_2"></a>

## [1.46.2] - 2024-08-05

### Added
- New keyboard shortcuts (experimental setting): Telegram-style Ctrl+Up/Down to select the message to reply to #3965
- More shortcuts to switch between chats: `Ctrl + PageDown`, `Ctrl + PageUp`, `Ctrl + Tab`, `Ctrl + Shift + Tab` #3984
- Better keyboard accessibility: make more elements focusable, add outline them #4005
- a way to add contact by pasting invite link to the search field #4041
- add on-screen controls to ImageCropper and the ability to rotate by 90 degrees #3893
- Added UI for read receipts in message info dialog #4036
- add Clone Group functionality to chat list context menu #3933

### Changed
- reword advanced setting "Disable Background Sync For All Accounts" -> "Only Synchronize the Currently Selected Account" #3960
- use 'Info' and 'Message Info' consistently #3961
- consolidate 'Profile' wording #3963
- consolidate 'Export/Import secret keys' button format #4019
- name "Search" fields as such #4015
- Update local help (2024-06-19)
- refactor: safer types #3993
- keep aspect ratio in quoted images #3999
- make ImageCropper use CSS-transforms for UI and canvas API to cut the result #3893
- update stock translations #4051
- show device message only once as unread #4057
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.142.1`
  - explicitly close the database on account removal to avoid crash on Windows #3959
  - fix memory leak in jsonrpc client code (to be specific in yerpc)
  - support vcards exported by protonmail
  - Display vCard contact name in the message summary
  - Case-insensitive search for non-ASCII messages
- upgrade `electron` from `30.0.2` to `30.3.1`
- truncate message previews in chat list #4059
- renderElementPreview calls renderElementPreview for message element children #4059

### Fixed
- Fix crash on "Settings" click when not on main screen (e.g. no account selected): hide the "settings" button
- code: comply with react hook rules #3955
- fix mailto dialog #3976
- "Realtime Webxdc Channels" toggle not reflecting actual setting value #3992
- even faster load of contact lists in "New Chat" and "New Group" #3927
- really hide 3dot menu when it is hidden #3998
- fix react crash when downloading a video message on demand #4000
- fix bug that showed placeholders while searching in chat forward dialog until you scrolled #4001
- Fix the problem of Quit menu item on WebXDC apps closes the whole DC app #3995
- minor performance improvements #3981
- fix chat list items (e.g. Archive) and contacts not showing up sometimes #4004
- fix bug notifications not being removed on Mac  #4010
- fix bug "Mark All as Read" does not remove notifications #4002
- fix update unread badge on when muting / unmuting a chat #4020
- fix update unread badge on receiving device messages #4020
- fix target chat was not opened on notification click #3983
- fix scroll to forwarded message #3834
- fix CSP bypass in webxdc (not a vulnerability) #4011
- fix show new incoming messages after clearing chat #4037
- fix: QR scanning not showing errors on failure #4040
- fix missing remove button in AddMemberChip #393
- fix composite emoji in text avatar #4038
- fix "Password and Account" dialog not indicating invalid credentials, making it seem that you can change password like this #4032
- fix empty context menu and unneccessary separators in HTML mail view #4053
- fix HTML email view empty space before email content #4052
- fix HTML email content not being zoomed #4052
- fix Icon preview of latest WebXDC displayed when summary is reaction event #4062
- fix stretched summaryPreviewIcon #4064
- fix wrong paths in some Window installations #4058
- fix "Contact info" card layout continuously jumping for contact names of certain length #4068

<a id="1_46_1"></a>

## [1.46.1] - 2024-06-17

### Added
- add option to use sytem ui font in appearance settings #3949
- pretty preview for vcard draft #3948

### Changed
- use `SOURCE_DATE_EPOCH` environment var for build timestamp instead of `Date.now()` if set.
- use italic variants of Roboto font correctly #3949
- show chat name when searching in chat #3950

### Fixed
- skip `requestSingleInstanceLock` on mac appstore builds (mas), because it made it unable to start the app on older macOS devices. #3946
- fix tray icon explaination in settings that appears when started with `--minimized` #3949
- performance: memorize MessageBody, don't run message parser multiple times for the same message #3951
- performance: add limits for MessageBody text generally and for quotes, core already has limits on text size, but for the cases where core has a bug it's still useful to have a failsave #3951
- Fix some strings not being translated on some locales (e.g. "1 minute" message age in Indonesian) #3910
- Fix strings being incorrectly pluralized for many locales (such as "2 members" in Russian) #3910
- make search ui visible when searching in a chat when in small screen mode #3950

### Removed
- removed unused Roboto font variants #3949

<a id="1_46_0"></a>

## [1.46.0] - 2024-06-10

### Changed
- Update translations (2024-06-09) #3925

### Fixed
- refresh member list after changes #3807

<a id="1_45_5"></a>

## [1.45.5] - 2024-06-08

### Added
- send contact as VCard from attachment context menu #3830

### Changed
- Update translations (2024-06-08) #3923

### Fixed
- Do not set min window dimensions on screens that are smaller than those min dimensions (such as linux phones) #3919
- packaging: respect `NO_ASAR` env var in `afterPackHook` #3916
- fix image cropper is not started when creating a group #3920

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `1.140.2`

<a id="1_45_4"></a>

## [1.45.4] - 2024-06-06

### Added
- Add image cropper to setting group avatars #3905

### Changed
- do not open last chat when switching accounts in small screen mode #3912
- open last chat when exiting small screen mode #3912
- Fix removing group avatars #3905
- Do not unselect chat when opening global map #3912
- Fix missing translation for broadcastlist name #3913

### Fixed

- Show error to user if core process exits unexpectedly #3904

<a id="1_45_3"></a>

## [1.45.3] - 2024-06-05

### Fix
- Fix map in packaged build #3900

<a id="1_45_2"></a>

## [1.45.2] - 2024-06-04

### Fix
- Fix notifications (was broken in 1.45.1) #3898

<a id="1_45_1"></a>

## [1.45.1] - 2024-06-04

### Added
- Added a Small Screen Mode, when you resize the window to be small it will only show the chatlist with account sidebar or the Chat View with a back button.
- show VCard attachment as VCard in message list #3840
- add contact from VCard & start chat on click #3840
- Webxdc realtime support #3741

### Changed
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `v1.140.0`
- Always show `msg.overrideSenderName` even when the message is sent by yourself
- Secure notifications on linux: escape html, like signal does #3875, #3890
- Update translations (2024-06-04) #3871 #3888 #3895
- adapt title of "Privacy Policy" link for default instance #3872
- ContextMenuItem now can render icons #3811
- use our own ContextMenu for AttachmentMenu #3811
- replace BlueprintJS Button and Icon with our implementation in chat navbar and attachment menu #3811
- update `@deltachat/message_parser_wasm` to `0.11.0` -> Bugfixes for link parsing:
  - restrict what can be in a label for a labled link
  - fix that false-positives in link detection


### Fixed
- fix that map tab is highlighted when you are in the media/gallery tab #3867
- fix message text "wobbling" on hover #3862
- fix: close alternative options dialog when setting up as a second device #3873
- fix map not opening #3876
- fix ImageCropper not working on smaller images
- fix: right click in ContactList should open a context menu #3884


<a id="1_45_0"></a>

## [1.45.0] - 2024-05-24

### Added
- Remember last position & size of webxdc windows #3754 #3755
- add quick-key CtrlOrCmd+q for submenu quit #3758
- add window titlebar for html_email- and help window #3770 #3778
- add quick key `Cmd+W`/`Ctrl+W` to close webxdc-, html_email- and help-window #3770 #3778
- Accept images from clipboard in QR reader #3762
- Introduce new `Spinner` component #3786
- Instant Onboarding #3773 #3801
- Add instructions and troubleshooting button to "Add as Second Device" dialog #3801
- Add image cropper for profile image selector #1779
- add more information to about screen (runtime, where the rpc server is and whether you run under arm translation) #3567
- Use openstreetmap in map
- Open map in a separate window
- Add global map for all chats in account


### Changed
- Update translations (2024-05-20) #3746 #3802 #3827 #3837
- The latest reaction is now shown in the chatlist, if it's newer than the last message #3749
- minor improvements to "add second device" dialog #3748
- Remove deprecated translations #3756
- Refactor chat store into React context #3725
- Improve security: restrict file protocol #3769 #3798 #3800
- Change chatlist to use new chatlist changed event from core #3268
- Refactor QR code reader #3762
- add animations for message shortcuts menu #3759
- reactions: add message height animation #3752
- update `@deltachat/message_parser_wasm` to `0.10.0` -> now parses internationalised Links and some minor bugfixes #3813
- replace emoji regex with message-parser function for counting emojis #3813
- update eslint dependency and its plugins #3808:
  - `eslint`: `8.54.0` -> `8.56.0`
  - `eslint-config-prettier`: `9.0.0` -> `9.1.0`
  - `eslint-plugin-prettier`: `5.0.1` -> `5.1.3`
  - `eslint-plugin-react-hooks`: `4.6.0` -> `4.6.2`
  - `@typescript-eslint/eslint-plugin`: `6.13.1` -> `7.8.0`
  - `@typescript-eslint/parser`: `6.13.1` -> `7.8.0`
- bump nodejs requirement to `>=18.18.0` #3808
- reorganise some settings acording changes on android & ios #3812
- reword password label to 'Existing Password' #3826
- replace `deltachat-node` with `@deltachat/stdio-rpc-server` #3567
- Update `@deltachat/stdio-rpc-server` and `deltachat/jsonrpc-client` to `v1.139.3`
- upgrade `electron` from `28.2.3` to `30.0.2`
- increase minimum nodejs version from `18` to `20`
- hide irrelevant advanced settings for chatmail users #3823
- upgrade `electron-builder` from `24.6.4` to `24.13.3` #3828
- upgrade `mocha` to `10.4.0`


### Fixed
- fix chat audit dialog was going out of viewport on smaller screens #3736
- fix long names breaking layout of reactions dialog #3736
- hide "add second device" instructions when transfer has started #3748
- improve chat scroll performance #3743, #3747
- faster load of contact lists in "New Chat" and "New Group" #3842
- reduce CPU load when moving mouse over chat #3751
- fix chatlistitem background when context menu for it is shown it is now highlighted correctly on pinned chats #3766
- fix add missing top padding to confirm sending files dialog #3767
- remove last selected chat id in ui settings when deleting the selected chat #3772
- fix translation keys in keybindings cheat sheet dialog #3779
- fix random scroll position and missing redraws when opening "Archive" #3268
- fix: clear notifications for a contact request when blocking it #3268
- Unmount QR scanner and disable camera correctly on abort or exit #3762
- Close reactions bar on emoji selection #3788
- fix Clicking notification does not bring Delta Chat to foreground on Windows #3793
- Prevent re-rendering of account sidebar when switching account #3789
- fix help not opening for languages that have no localized help #3801
- quoted messages with single emoji as text look too big #3813
- fix the bug where reactions bar is closed after arriving new message #3760
- fix problem of focus when opening create chat dialogue #3816
- fix the bug where EditAccountAndPassword dialog does not close with OK button
- fix the problem of pressing ENTER when logging in and prompting doing additioanl dialogs #3824


### Removed
- remove disabled composer reason, now composer is just always hidden when `chat.canSend` is `false` #3791
- remove `--multiple-instances` flag #3567


<a id="1_44_1"></a>

## [1.44.1] - 2024-03-09

> Due to the electron update macOS 10.13 (High Sierra) and macOS 10.14 (Mojave)
> are no longer supported, macOS 10.15 (Catalina) or later is the new
> requirement.

### Changed
- Update `deltachat-node` and `deltachat/jsonrpc-client` to `v1.136.3`

### Fixed
- Fix Bug: When switching accounts after deleting a chat, the message list is blank, similar issues can come up when using the 2nd device flow. #3724
- Fix bug where cancellation of configure led to an undefined state where it looked like the account was configured successfully, but it was not. #3729
- Fix double sending #3739

<a id="1_44_0"></a>

## [1.44.0] - 2024-03-05

> Due to the electron update macOS 10.13 (High Sierra) and macOS 10.14 (Mojave)
> are no longer supported, macOS 10.15 (Catalina) or later is the new
> requirement.

### Added
- Add repology badge to README #3696

### Changed
- slightly wider account sidebar (so traffic lights look more centered on macOS) #3698
- refactor some components to not use the chatstore singleton directly #3700
- Reuse new image selector component for group images #3713
- Update `deltachat-node` and `deltachat/jsonrpc-client` to `v1.136.1` #3720
- Update translations (2024-03-05) #3722

### Fixed
- fix broken html email window (CSP got broken with the recent electron update) #3704
- remove unexpected empty space (bottom padding) from view profile dialog #3707
- Button style regression #3712
- Wait until chat id got set before displaying message list #3716
- change export keys open directory confirm button label to "select" #3710
- Make chat title and subtitle unselectable to prevent unusual behaviour #3688
- changing display name of a contact does not change it immediately in the messages #3703
- WebXDC button style regression #3718
- Change wording of "sync all" setting and make it appear disabled by default like the other experimental settings #3717

<a id="1_43_1"></a>

## [1.43.1] - 2024-02-19

> Due to the electron update macOS 10.13 (High Sierra) and macOS 10.14 (Mojave)
> are no longer supported, macOS 10.15 (Catalina) or later is the new
> requirement.

### Changed
- Upgrade `electron` from `v26.6.3` to version `v28.2.3` #3693
- Refactor buttons #3605
- Update translations (2024-02-19)

### Fixed
- Fix broken styles for muted and turned off account badges in multiaccount sidebar #3691
- "Broken protection" message did not allow opening info dialog on tap #3695

<a id="1_43_0"></a>

## [1.43.0] - 2024-02-14

### Added
- ContextMenu now handles multiple sublevels #3116
  - ContextMenuItem has a subitems array
  - Hovering outside of the menu closes last opened sublevel
  - ChatListContextMenu mute option now opens a submenu with duration options instead of a dialog
- Add shortcut to scan qr code to "New Chat" dialog #3623
- Message reactions with emojis #2964
- Show info dialog on tap for invalid unencrypted mails #3652
- Add QR scan button next to search input on main screen #3665
- Add Account Switcher Sidebar #3621
- Add new account deletion screen #3621
- Open DC Invite Links directly inside delta chat from links clicked in messages and html emails #3683
- Add multiaccount notifications and mute/disable notifications for specific accounts #3680

### Changed
- Update `deltachat-node` and `deltachat/jsonrpc-client` to `v1.135.0`
- Update `electron` from `v26.6.0` to version `v26.6.3`
- Update `filesize` dependency from `8.0.6` to `10.1.0`
- Introduce text formatting for chatlist item summary (use message-parser) #3476
- Use native watch mode and CSS modules of esbuild #3571
  - Use native watch mode and CSS modules of esbuild
  - Support SCSS in modules
  - Show eslint errors when bundling during development
  - Use `watch:frontend:types` script for type-checking during development
  - Update esbuild to v0.19.8
  - Update typescript to v5.3.2
- Refactor dialog components, improved styling for settings #3575
- Refactor and improve design of search input components #3572
- Refactor dialog logic and add additional helper methods #3512
- Prefer light theme for the help and webxdc loading pages
- Helper method to easily use confirmation dialogs #3601
- Refactor using new `useConfirmationDialog` hook #3602
- Remember file open dialog locations across the current session and do not persist last save location across sessions anymore #3615
- Disable three-dot-menu when not applicable (map, other gallery tabs) #3523
- Move pin icon in chatlist after date #3636
- Hide email address for guaranteed e2e DM chats in the titlebar #3629
- Use `displayName` for contact in `verified_by` in Contact Dialog (also hide email address) #3629
- Removed minimal theme from offical themes because it is unmaintained #3645
- Do not add changelog device message on fresh accounts #3639
- Copy invite link to clipboard instead of only QR code data #3650
- Remove unessesary z-index css properties and reorganize the remaining ones #3661
- Require setting display name when creating profile after scanning invite code #3663
- Improve design of profile image selector component #3667
- badge count is now across all active accounts #3621
- "sync all accounts" moved to settings under advanced -> experimental #3621
- webxdc stay open when switching accounts (when you have sync all enabled, which is the default) #3621
- Add more versions to about dialog and update the order of information #3677
- Refactor message meta data component #3678
- Use overlay in context menu #3682
- Update local help (2024-02-14) #3686

### Fixed
- Silently fail when notifications are not supported by OS #3613
- Fix uncaught Exception when dismissing notifications on windows #3593
- Introduce own React context for context menus & fix regression #3608
- Improve position of verified icon in profile info #3627
- Hide reactions UI for info-, system- or video-invite messages and chats #3642
- Delete old themes before rebuilding in build process #3645
- More contrast for audio elements in dark mode #3653
- Fix fullscreen view for avatar images #3669
- Fix display of avatars with spaces in the name #3669
- Show search bar when searching chat in archived mode #3679

### Removed
- Remove qr icon in sidebar #3666
- Remove old Account switcher screen #3621
- Remove sidebar menu #3621

<a id="1_42_2"></a>

## [1.42.2] - 2023-12-02

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.131.9`
  - more fixes for mail.163.com
- update esbuild to v0.19.8

### Fixed
- log error when webxdc status update send fails
- make starting of html email view more reliable (remove race condition)

<a id="1_42_1"></a>

## [1.42.1] - 2023-11-23

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.131.7`
  - Revert "fix: check UIDNEXT with a STATUS command before going IDLE". This fixes mail.163.com which has broken STATUS command.

<a id="1_42_0"></a>

## [1.42.0] - 2023-11-23

> Since we needed to upgrade electron this version drops support for windows 7, 8 and 8.1
> https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice
> If you are using DC on these platforms you have the following options:
> - Keep using 1.40.4
> - update windows to 10 or 11
> - switch to linux (or dual boot it)
> - contact delta@merlinux.eu if you have money and want to sponsor the development of a special legacy build of deltachat desktop 1.42 for windows 7/8/8.1.
>
> - Core is now built on Debian 10: now requires glibc 2.28, so ubuntu 18 is not supported anymore.

### Fixed
- fix clear chat sometimes not refreshing the messagelist

<a id="1_41_4"></a>

## [1.41.4] - 2023-11-22

### Changed
- Update local help (2023-11-20)
- Update translations (2023-11-22)
- update deltachat-node and deltachat/jsonrpc-client to `v1.131.6`

### Fixed
- fix displaying sticker that has wrong mimetype
- fix bug where composer was locked after joining a group via qr code
- fix double message context menu #3550
- focus after loading draft fixes:
  - fix composer / draft-area not getting focus after click in command #3493
  - fix composer does not get focused when selecting a chat with a draft #3495
- fix: show error in autocrypt setup enter key dialog when the typed in key is invalid
- fix bug: allow deleting first number in autocrypt enter setup key dialog

<a id="1_41_3"></a>

## [1.41.3] - 2023-11-17

### Added
- Vietnamese language

### Changed
- update `@deltachat/message_parser_wasm` to `0.9.0`, which fixes a bug with BotCommandSuggestion parsing
- update `electron` from `v26.4.2` to version `v26.6.0`
- Select device message chat automatically to welcome first users #3531
- update deltachat-node and deltachat/jsonrpc-client to `v1.131.4`
- update local help (16.nov.2023)
- Update translations (17.11.2023)
- Update options for disappearing messages #3530
- Do not show redundant read-only message when in device messages chat #3532

### Fixed
- fix: files search not case-insensitive
- fix: bug in emoji detection for jumbomoji #3508
- Improve layout and fix unknown locale of DisabledMessageInput #3537
- Fix: Do not show reply option in read-only groups #3536
- Use `dc_chat_can_send` to show or hide reply functionality #3541
- fix translation key for `add_to_sticker_collection` in context menu

<a id="1_41_2"></a>

## [1.41.2] - 2023-11-15

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.131.2`
- Update inApp help (15.11.2023)
- make help's "scroll to top" button less intrusive
- streamline profile titles
- use local help for guaranteed end-to-end encryption more info

### Fixed
- macOS: prevent second instances when runing from terminal
- fix status text overflow in ViewProfile #3515

<a id="1_41_1"></a>

## [1.41.1] - 2023-11-14

### Changed
- fix notarisation for macOS dmg

<a id="1_41_0"></a>

## [1.41.0] - 2023-11-13

> Since we needed to upgrade electron this version drops support for windows 7, 8 and 8.1
> https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice
> If you are using DC on these platforms you have the following options:
> - Keep using 1.40.4
> - update windows to 10 or 11
> - switch to linux (or dual boot it)
> - contact delta@merlinux.eu if you have money and want to sponsor a special legacy build of deltachat desktop 1.41-1.42.
>
> - Core is now built on Debian 10: now requires glibc 2.28, ubuntu 18 is not supported anymore.

### Added
- Global Gallery
- Show date when scrolling gallery
- add option to view images and videos in the gallery cropped to grid or in their original aspect ratio
- mark webxdc app context as secure #3413
- Experimental: Related Chats
- Developer option to disable IMAP IDLE #4803
- add option to save to file system to webxdc "send to chat"-dialog
- Add image compression
- open `mailto:` and `openpgp4fpr:` links from webxdc in deltachat #3355
- show confirm dialogue when creating new chat after clicking mail address #3469
- Ask for broadcast name when creating one
- Automatically create verified group when all users are verified #3492
- register on system as handler for webxdc files

### Changed
- add a dark theme for the "Help" and the webxdc loading screen
- improve the look of the webxdc loading screen
- Update translations (05.11.2023)
- better search in chat design which shows more results (remove redundant chat info and combine both headers)
- shorten package description, because some debian had problems with our large description.
- Images are now compressed unless you send them as files
- move tray icon option to Appearance
- show prettier linter warnings through eslint #3463
- move "Forward" and "Reply" close together in the message menu
- for the "introduced by" line, only use verifier_id (no ContactObject.is_verified)
- show verification icon in title of view profile if verified dm chat exists.
- update dependencies
  - update minimum nodejs version from `16` to `18`
  - update `electron` from `v22.3.24` to version `v26.4.2`
  - update `electron-builder` from `23.0.4` to `24.6.4`
  - update `@electron/notarize` from (`electron-notarize` package name) `^1.0.0` to `^2.1.0`
  - update deltachat-node and deltachat/jsonrpc-client to `v1.131.1`
  - update `@deltachat/message_parser_wasm` to `0.8.0`, which adds linkification to links on more generic URI schemes.
  - Removed `url-parse` dependency replacing it with modern APIs

### Fixed
- fix clipboard not working in webxdc apps
- fix `target=_blank` links in html emails don't work #3408
- add description for enableChatAuditLog setting
- fix: import key from file instead of folder, fixes #1863
- fix webxdc title not updated in document title changes #3412
- fix: remove duplicated search button on "search in chat" #3014
- fix "Verified by" is shown weirdly for contacts that were verified directly #3421
- open help, webxdc and html email windows with always on top flag, if main window has that flag.
- fix copy text inserts extra linebreaks
- improve video message - wide enough to show controls
- gallery: fix scroll to top when switching tabs
- fix: context menu items could take up multiple lines
- fix: retrieve bounds directly from window and check if null on resize or move event #3461
- fix: initialise power monitor after electron signals readyness to avoid electron failing with SIGTRAP #3460
- centering of username component in settings view #3467
- fix wording of autocrypt setup messages
- fix wording of menu entries and dialog titles
- fix window store installation (remove unknown language code from supported languages)
- fix emojis in some html emails (force charset utf-8)
- fix `null` account name when leaving the field empty bug
- fix text truncation so verified icon is always shown on ViewGroup, ViewProfile, ContactListItems, Navbar and on ChatlistItem
- fix scrollbar caused flickering in ViewProfile


### Removed
- remove 40KiB download on demand option

<a id="1_40_4"></a>

## [1.40.4] - 2023-09-14

### Added
- Show video chat instance URLs as subtitles #3369
- Add similar chats to group profile #3379

### Changed
- Offer to copy non-HTTP links to the clipboard instead of trying to open them in webxdc source code link and inside of html emails.
- update electron from `v22.3.23` to version `v22.3.24`

### Fixed
- fix duplicated calling of 'open-url'
- fix html mail getting restrictions of webxdc window
- fix: when clicking on mailto link in html email show main window even when it was hidden.
- Display the toast after successful key import.
- fix the bug where non-contact email addresses are not shown when creating a group #3363

<a id="1_40_3"></a>

## [1.40.3] - 2023-09-08

### Changed
- Offer to copy non-HTTP links to the clipboard instead of trying to open them.

### Fixed
- webxdc: fix a bug where the webxdc was able to open the dev tools.
Also make opening devtools with F12 more reliable.
- packaging: fix corrupted .desktop file

<a id="1_40_2"></a>

## [1.40.2] - 2023-09-07

### Added
- option to delete contacts in list when creating a new chat

### Changed
- update `@deltachat/message_parser_wasm` to `0.7.0`, which adds support for unicode #hashtags
- update electron from `v22.3.2` to version `v22.3.23`
- update deltachat-node and deltachat/jsonrpc-client to `v1.121.0`

<a id="1_40_1"></a>

## [1.40.1] - 2023-09-01

### Added
- add: "always on top" option to webxdc titlebar menu.
- add: context menu entry to resend webxdc messages
- add: context menu entry to resend self sent messages

### Changed
- remove jitsi as a default Video Chat instance, because they added a sign-in requirement #3366
- update deltachat-node and deltachat/jsonrpc-client to `v1.120.0`
    - mainly bugfixes, also fixes a memory leak
- Update translations (01.09.2023)
- update UI for sticker selector

### Fixed
- fix: filename sanitation bug in webxdc send api
- fix: make a chat item background look hovered when a context menu is open for it (#3228)
- fix: show webxdc titlebar also on mac -> make show sourcecode link accessible on macOS
- fix: hide devtool option in webxdc titlebar menu when it is not enabled.
- fix: remove reload options that don't work from webxdc titlebar menu.
- fix: contact creation in new chat dialog not working with leading or trailing spaces. #3357


<a id="1_40_0"></a>

## [1.40.0] - 2023-08-13

### Changed
- update `@deltachat/message_parser_wasm` to `0.6.0`, which fixes 2 bugs:
 - Fixed problem of IPv6 links being detected as punycode
 - Fixed the bug of brackets being parsed as part of the email address

### Fixed
- fix missing translation string in setup second device progress dialog
- fix device message ordering


<a id="1_39_0"></a>

## [1.39.0] - 2023-08-05
### Added
- Guide user tapping "Welcome / Add Second Device" what to do on the other device
- add: `webxdc_custom.desktopDragFileOut` api

### Changed
- Update translations (01.07.2023)
- Update offline help
- changed: make verified icon green
- use filename property for saving files (see #3330 for details)
- update deltachat-node and deltachat/jsonrpc-client to `v1.119.0`

### Fixed
- fix: clicking start on an already open webxdc app now opens it again even when it was minimised #3294
- fix: Including whitespace in search query does not cause problem when if the search query is an email address(#3299)
- fix: text is now smaller in the unread badge on the top of the jump down button(#3068)
- fix: links in quoted texts should not be clickable (#3290)
- fix: move "Sync All" switch in Account List to bottom (#2963)
- fix: fix duplicated status updates race condition bug in webxdc #3296
- fix: remove unsupported language code, this broke the installation from the ms store on windows #3292
- fix: show edit button if a contact's profile is shown from group view(#3267)
- fix: Proper description for Linux packages(#3209)
- fix: When opening new chat dialogue, it's always focused(#3286)
- fix: No draft is saved if the message contains only whitespace(#3220)
- fix: webxdc CSP allow media from `blob:` and `data:`
- fix: Fix colour of clock icon in ViewProfile dialogue (#3329)
- fix: Center the "no media" text in Gallery
- fix: The media fullscreen screen is now always closed using Esc key(#2919)
- fix: Fix problem of crashing Delta Chat when it can't write to standard output (#3323)
- fix: Fix problem of returning exception on quit (#2201)
- fix: same icon size in navbar as in chatlist

<a id="1_38_1"></a>

## [1.38.1] - 2023-06-23

### Changed
- don't close webxdc on `sendToChat()`
- Update translations (22.06.2023)
- WebxdcSaveToChatDialog: show filename in title

### Fixed
- fix: if systemPreferences.askForMediaAccess is not available, then don't call it (broke qr scan under linux (and maybe also under windows, was not tested))
- fix: only allow one instance of `sendToChat()` (the old one is now replaced by the new one) #3281

<a id="1_38_0"></a>

## [1.38.0] - 2023-06-19

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.117.0`
- Update translations (17.06.2023)

<a id="1_37_1"></a>

## [1.37.1] - 2023-06-14

### Changed
- Settings: Move Experimental Features into Advanced
- Settings: Move Connectivity button down and give it an icon (like on android and ios)
- update in-app help (2023-06-07)

### Fixed
- If clipboard contains a file and text, then only paste the file into deltachat. #3261
- possibly fix asking for camera permission on MacOS #3252

<a id="1_37_0"></a>

## [1.37.0] - 2023-06-05

### Added
- Show thumbnail in chatlist summary of image, sticker and webxdc messages
- add webxdc api `sendToChat` #3240
- add webxdc api `importFiles`

### Changed
- exclude more unused files from installation package
- update deltachat-node and deltachat/jsonrpc-client to `v1.116.0`
- remove message id from chatlistitem
- Improved message search results
- Update translations (18.05.2023)
- add Romanian translation
- better profile view for saved messages chat

### Fixed
- fix some emojis not getting larger in emoji only messages
- add missing languages to supported languages in appx manifest
- fix show verification state of chat in chatlist
- fix make self contact not clickable in group member list
- remove pasted images from temp folder #2927
- update timestamps and reconnect after resuming after sleep

<a id="1_36_4"></a>

## [1.36.4] - 2023-04-21

### Added
- add received timestamp to html email view

### Changed
- webxdc message: icon change hover cursor to pointer
- update deltachat-node and deltachat/jsonrpc-client to `v1.112.8`

### Fixed
- fix copy qrcode to clipboard


<a id="1_36_3"></a>

## [1.36.3] - 2023-04-17

### Changed
- remember html email window positioning and size.
- update deltachat-node and deltachat/jsonrpc-client to `v1.112.7`

### Fixed
- always display html emails in black text on white background by default, fixes white text on white background when the OS was in dark theme mode
- fix: webxdc loading progress bar finishing at 50% (not 100)

<a id="1_36_2"></a>

## [1.36.2] - 2023-04-14

### Changed
- Update inApp help (11.4.2023)
- improve confirm abort dialog for setup second device #3173

### Fixed
- do not save custom video chat provider if it only contains whitespaces
- fix show error messages when starting a video chat
- don't show video chat in attachment menu when the feature is turned off
- fix "Always Load Remote Images" should be hidden for contact requests #3180
- always show copy link when right clicking a link in a message #3184

<a id="1_36_1"></a>

## [1.36.1] - 2023-04-09

### Fixed
- add `ws` as explicit dependency, this should hotfix the startup crash #3171

<a id="1_36_0"></a>

## [1.36.0] - 2023-04-08

### Added
- networked setup multidevice
- open html emails in internal window

### Changed
- update electron from `v22.1.0` to version `v22.3.2`
- use the new go based transifex cli (old one stopped working)
- Update translations (08.04.2023)
- update deltachat-node and deltachat/jsonrpc-client to `v1.112.6`
- only allow webxdc devtools when user enabled it in settings #3157
- move webxdc functions in backend from cffi to jsonrpc #3127

### Fixed
- mac: update tray icon menu on hiding/showing #3041
- chat request deletion now asks for confirmation
- fix updating of relative timestamps #3125
- fix account details of old account shown in new second account created via qr code #3154
- fix chat of old account still selected in new account
- fix scroll down when sending video chat invitation
- some webxdc security fixes #3157
- add message metadata to video chat invitiation (encryption and send status and date-time)

### Removed
- removed more bloat (unnessary files) from release packages


<a id="1_34_5"></a>

## [1.34.5] - 2023-02-27

### Added
- Add possibility for themes to change the emoji font. See docs/THEMES.md for a guide.

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.110.0`
- update `@deltachat/message_parser_wasm` to `0.5.1` (`<delimited@emails>` and fix code blocks with emojis)

### Fixed
- better error handling when messages fail to load from db in messagelist and gallery
- make emoji mart use the correct emoji font

### Removed
- remove unused direct dependency on babel: `@babel/core`, `@babel/preset-env` and `@babel/preset-react`
- remove `hallmark` modules, because we never really used it and it has many dependencies.
- remove unused `electron-devtools-installer` - it does not work since our upgrade to electron >=11, so its not used for a long time already


<a id="1_34_4"></a>

## [1.34.4] - 2023-02-09

### Added
- add context menu option to mark all archived chats as noticed
- add reply privately in mailinglists
- html emails are opened shown in a dedicated window

### Changed
- Update translations (07.02.2023)
- restrict web permissions #2548
- update google noto color emoji font to `unicode 15`
- update `emoji-mart` to version `5.5.2` (adds `@emoji-mart/data@1.1.2` & `@emoji-mart/react@1.1.1`)
- emoji picker now closes automatically when selecting an emoji, press `shift` to select multiple emojis
- escape key closes the emoji picker
- removed dependency on `emoji-regex`
- context menu size is updated dynamically, so there shouldn't be any word-wrapping
- remove dependency on `glob-watcher`
- update deltachat-node and deltachat/jsonrpc-client to `v1.107.1`

### Fixed
- improve jumbomoji logic (that emoji only messages appear bigger), now works even with new emojis that are not in delta chat yet.
- css: fix hover overflow on context menu corners
- context menu items are correctly updated when application language changes

### Removed

<a id="1_34_3"></a>

## [1.34.3] - 2023-01-30

### Added
- new dialog to change profile name/photo pops up after logging with a QR-Code
- add progressbar to webxdc loading

### Changed
- upgrade electron to version `22`
  - to make this work, we also moved some electron api invocations from preload script to main process
- update deltachat-node and deltachat/jsonrpc-client to `v1.107.0`

### Fixed
- still show the rest of the chat, even if loading first batch of messages failed

### Removed
- Removed port numbers from advanced settings placeholders.
  Delta Chat core may try multiple ports during autoconfiguration,
  load configuration from the server or from the provider database,
  so displayed placeholder was sometimes incorrect.
  Now a simple string "Default" is displayed instead.
  (<https://github.com/deltachat/deltachat-desktop/pull/3094>)

<a id="1_34_2"></a>

## [1.34.2] - 2023-01-12

### Added
- show count of the archived chats with unread messages

### Changed
- forward message dialog now has a title and a confirmation dialog and chat preview before forwarding
- update deltachat-node and deltachat/jsonrpc-client to `v1.106.0`
- change style of "Archived Chats" chatlist item

### Fixed
- fix default welcome screen height so all buttons fit scrollbar is hidden
- fix unblock contact did not update the chatlist

### Removed
- temporarily remove donate link to make app store release possible again (only on MacOS)

<a id="1_34_1"></a>

## [1.34.1] - 2022-12-22

### Added

### Changed
- show jump down button earlier when scrolling up
- make font-style of info messages consistent with iOS and Android #3034
- Bump `decode-uri-component` from `0.2.0` to `0.2.2`.
- move all verified icons to the end chat/contact name (previously some were still on the avatar image)
- set `ITSAppUsesNonExemptEncryption` to `false` for mac
- update deltachat-node and deltachat/jsonrpc-client to `v1.104.0`
- Update translations (22.12.2022)

### Fixed
- fix "message not found in cache" bug #3039
- fix webxdc: allow `self` and `blob:` in `connect-src` in CSP
- indentation in update device message
- fix "no messages" blinking up for a second when loading a chat
- hide unread count on jump down button if you are at the bottom, fixes #3033
- fix removing group avatar image #3038
- fix chat title in navbar did not update correctly when it should change (disappearing messages & recently seen indicator) #3046
- Control overflow of so text does not escape the code block nor message bubble, for the experimental message markdown mode.

<a id="1_34_0"></a>

## [1.34.0] - 2022-11-27

### Changed
- update deltachat-node and deltachat/jsonrpc-client to `v1.102.0`

### Fixed
- fix jump to message from gallery
- webxdc: allow `data:` in `connect-src` in CSP

## [1.33.2] - 2022-11-16 - Testrelease

> This is a testrelease, learn more at <https://support.delta.chat/t/help-testing-the-upcoming-1-33-x-release/2278>

### Added
- Add experimental option to enable markdown rendering in messages

### Changed

- add ability for experimental testing webxdc apps to have full internet access #3005
- update deltachat-node and deltachat/jsonrpc-client to `v1.101.0`
  - fixes 100% cpu usage bug
- Update translations (16.11.2022)

### Fixed

- fix dclogin scheme in desktop file
- don't log jsonrpc requests to logfile #3015

## [1.33.1] - 2022-11-09 - Testrelease

> This is a testrelease, learn more at <https://support.delta.chat/t/help-testing-the-upcoming-1-33-x-release/2278>

### Added
- add webxdc's icon to webxdc info messages
- show webxdc icon in chat audit log
- add option to jump to message in chat audit log
- add option to jump to webxdc message in chat audit log

### Changed
- Update translations (19.10.2022)
- Tray icon is now by default enabled. Settings got moved to Settings->Advanced
- instantly react to changing chat background color
- made frontend code more independent from electron
- reduce notifications when many messages are received at once.
- update deltachat-node and deltachat/jsonrpc-client to `v1.100.0`
- jump down button: show different icon (one arrow), when jumping to message in jump to message list
- chat audit log also show menu on click
- add context menu option to save a sticker to the own sticker menu

### Fixed

- prevent double context menu on macOS
- fix setting color chat background color #2659
- Fix that results of search in chat are not ordered by newest first
- Fix messagelist overscrolling #2956
- Fix messagelist not jumping to correct message #2953
- fix chat audit log #2967
- fix that results of search in chat are not ordered by newest first
- Fix chat name/avatar in navbar take full width
- don't show dash in mailinlist title if there is no mailinglist address #2965
- fix scan account creation (burner-account/dcaccount: and dclogin:) from MainScreen
- fix contact requests button to run block function and show right label (Group: delete, DM: block) #2877
- Fix notifications when showNotificationContent was disabled
- fix unread count on scroll down button
- make recently seen dot in navbar disappear automatically #2926
- only webxdc info messages jump to parent message on click now
- fix scroll down when sending message
- fix jump to info-message
- don't show "copy text" menu entry for stickers
- fix text and author color in quote in sticker replies

## [1.33.0] - 2022-10-16


### Added
- show mailing list address in chat subtile
- clear webxdc browser data on webxdc instance deletion
- add donate link in settings
- add button to clear chat history (delete all messages of a chat)
- add recently seen indicator
- add jump down button
- add "search for messages in chat"
- show webxdc icon in quote

### Changed
- migrated core communication to jsonrpc api
- migrate event handling to jsonrpc api
- Update translations (22.09.2022)
- click on selected chat in chatlist now goes to bottom or first unread message
- remember last path in "save as" dialog
- allow using `dclogin:` and `dcaccount:` from logged in account, without logging out first
- register in os as handler for the `dcaccount:` and `dclogin:` scheme
- remove loading stage from sending autocrypt setup message
- make contact last seen always display relative time
- hide ephemeral timer menu options for mailing lists #2920
- reposition ConnectivityToast
- only show core events in frontend dev console if deltachat was started with `--log-debug` or `--devmode`
- always show sticker tab now and add a button to quickly open the sticker folder.
- update deltachat-node and deltachat/jsonrpc-client to v1.97.0

### Fixed
- allow scanning of certain qr code types on welcome screen (account, url and text)
- fix selecting chat after forwarding to it
- fixed bug where unread badge on app icon was not updated immediately
- fix notifications are not removed from notification center
- fix quote linebreaks #2870
- fix low resolution of copy qrcode image #2907
- fix group join qr code when creating a new group
- message search: show "1000+ messages", because 1000 as result means the result was truncated most of the time
- fix contact name is not updated in view profile #2945

## [1.32.1] - 2022-08-18

### Changed
- updated deltachat-node to `v1.93.0` to fix flatpak and nix build issues

### Fixed
- fix indentation in --help

## [1.32.0] - 2022-08-09

### Changed
- open mailto links in messages always in deltachat #2835
- update esbuild to 0.14.51
- disable broadcast lists by default, because they are experimental
- updated deltachat-node to `v1.91.0`
- Update translations (09.08.2022)

### Added
- Broadcast lists as experimental feature
- add connectivity status in sidebar/hamburger menu #2819

### Fixed
- fix escape key let sidebar flimmer shortly upon startup bug
- fix double open settings crash #2824
- fix display of quoted forwarded messages
- add warning that broadcast lists are unencrypted
- remove 1px white bottom border on image message

## [1.31.0] - 2022-07-17

### Added
- Floating action button in chatlist to start a new chat

### Fixed
- use addr if displayname is not set for webxdc selfName #2803
- prevent whitescreen on invalid last account id

### Changed
- rename the gallery tab "documents" to "files" #2829
- Less round buttons, more similar to android and better spacing #2813
- Updated deltachat-node to `v1.90.0`
- Update translations (17.07.2022)
- add aeap confirmation dialog and make email address changeable

## [1.30.1] - 2022-06-07

### Added
- Added messageId to MessageDetail dialog
- added custom titlebar menu for webxdc (on linux and windows)
- add open keybindings dialog to window titlebar menu
- exit fullscreen webxdc with escape key
- added cli arguments --help and --version

### Fixed
- "New contact" button hidden if contact already exists (#2646)
- Fix too wide clickable area on forwarded messages @andresmc98 (#2782)
- Fix button label saying open instead of save in export backup file dialog
- Fix display/playing of media files that contain invalid url chars in filename (such as `#`) (#2527)

### Changed
- Updated minimal theme
- Update translations (03.06.2022)
- New login screen layout
- Update translations (07.06.2022)
- Update deltachat-node to `1.86.0`

## [1.30.0] - 2022-05-30

### Added
- add check for compatible node while installing dependencies (#2724)

### Fixed
- remove context menu option "open attachment" for webxdc (#2763)

### Changed
- click on webxdc icon starts it too now (#2775)
- webxdc title is now shown in bold (#2774)
- remove unessesary deltachat-node files from release package
- change composer keybindings (shift+enter now always adds a newline and crtl/cmd+enter now always sends regardless of what the enter key is set up to do)
- update deltachat-node to v1.84.0

## [1.29.1] - 2022-05-20

### Added
- Show settings menu item in titlebar menu
- Sidebar closes on escape key
- add chat name to webxdc window title
- support for webxdc document names
- Access archived chats through sidebar

### Fixed
- Fix crash on migrating accounts from an older version (before 1.21.0)
- Add a guard against selecting accounts with impossible ids (smaller than 0)
- Fix stock translations set too late (after I/0 is started) #2735
- Fix jumping to send video chat invitation
- Fix jumping to last message if sending multiple attachments through drag&drop
- prevent webxdc content from setting the window title
- Fix truncating of names and emails

### Changed
- Update `@deltachat/message_parser_wasm` to `0.4.0` (fixes a email parsing issue)
- Update deltachat-node to v1.83.0


## [1.29.0] - 2022-05-05

> You now need node version `>=16` for building desktop

### Fixed
- Fix: exit search when using it to create a dm chat from an email address (new contact)
- Fix "Send Message" does not always open chat view #2592
- Fix contact name has color in quote when replying with sticker
- Fix startup crash when spam clicking on app icon on mac.
- fix webxdc content not visible in gallery
- unexpected click behavior in gallery/document view #2626
- fix prev/next media had seperate list for images and gifs
- fixed height for webxdc icons in messages
- Better empty gallery tab messages
- allow internal webxdc navigation (multiple html files)
- fix random search result position (#2631)
- fix: signature field in Edit Profile is not labeled when empty (#2579)
- Keyboard shortcut preview for "Send on Enter" setting
- Keyboard shortcut reference dialog (cheatsheet), accessible via `Ctrl + /` or `Cmd + /`
- display `video/quicktime` videos
- Fix chatlist item showed wrong timestamp (jan 1 1970) if there was no timestamp
- Fix bring back get provider info

### Added
- Implement expandable settings
- jump to message from gallery ("show in chat") #2618
- add Webxdc tab to gallery
- handle mailto links in webxdc content in deltachat
- add images to quotes #2628

### Changed
- Move node-fetch to devDependencies
- Update emoji-mart to `^3.0.1`
- Update @types/emoji-mart to `^3.0.9`
- Update deltachat-node to `v1.79.3`
- `ENTER + SHIFT` and `ENTER + CTRL` in the composer do now the same thing: they send or add a newline depending on the `enterKeySends` user preference
- update webxdc setUpdateListener api
- Remove dependency tempy
- Update @blueprintjs/core to `4.1.2`
- use forked version of `react-qr-reader` (@deltachat/react-qr-reader@4.0.0)
- nicer webxdc start button #2723
- update nodejs to version `16`
- update electron to `18.0.3`
- upgrade electron builder to `23.0.4`
- `ENTER + SHIFT` and `ENTER + CTRL` in the composer do now the same thing: they send or add a newline depending on the `enterKeySends` user preference
- Metadata text color is now white on sent media messages

### Removed
- remove dependency `react-qr-svg`


## [1.28.2] - 2022-04-22

### Changed
- Update electron to `14.2.9`
- Enable unread badge counter on windows

### Fixed
- fix Layout issues in Settings window
- Fix chat background on windows
- fix tray icon unread indicator on windows


## [1.28.1] - 2022-04-05

### Changed
- Update translations (25.03.2022)
- Update react-string-replace to `1.0.0`

### Fixed
- remove wrong line (about send on enter) from changelog in device msg
- webxdc allow `blob:` uri scheme


## [1.28.0] - 2022-03-25

### Changed
- Set default of enterKeySends to false again
- remove webxdc clear domstorage settings for now until we know what we want (see https://github.com/deltachat/deltachat-desktop/issues/2638)
- increase composer draft saving debounce timeout to one second

### Fixed
- Fix messages not appearing with download on demand


## [1.27.2] - 2022-03-15

### Added
- webxdc content now has access to persistent DOMStorage

### Fixed
- Fix missing key login_socks5_login
- Fix creating contacts from email address in message
- Fix two different about dialogs on macOS #2280
- Fix error in calculatePageKey
- Fix special messages not getting fetched on incoming messages
- Fix react adjacent warning in info message
- Fix open deltachat from uri doesn't detect the uri on macOS #2257
- show qr code content if decoding failed
- fix openpgp4frp uri opening on macOS
- Fix loading more messages if we only less messages to fill the window size
- Fix chatlist jumps to top after archiving
- Reduce startup lag while fetching messages (fix debouncing of onChatListItemChanged)
- Fix webxdc audio playback
- Fix qr scanning on account screen
- fix: log messageg-parser errors and display plain text message as fallback (instead of crashing)

### Changed
- exclude more unused files from installation package
- Improved videochat instance dialog


## [1.27.1] - 2022-03-10

### Changed
- Update electron to `v14.2.6`

### Fixed
- click on offline toast now opens the connectivity view
- fix error object logging and make "core could not be loaded" error dialog more useful


## [1.27.0] - 2022-03-04

### Added
- It's now possible to add new group members by their email addresses
- Experimental support for webxdc
- Implement jump to message (quotes, search, webxdc info messages)
- Logging for unhandled frontend errors
- Copying image now possible from gallery and chat view
- Add image zoom for full screen views

### Changed
- Update `@deltachat/message_parser_wasm` to `0.3.0` (fixes some link parsing issues)
- Update deltachat-node to `v1.76.0`
- Update electron to `13.6.8`
- Update translations (3.3.2022)
- Make disabled "delete profile image" button more readable in dark themes @ejgonzalez17 #2478
- Update inApp help (3.1.2022)
- Making the minimal theme even more zen
- Drastically improve performance of MessageList
- Switch from tape to mocha for unit tests
- Don't update Timestamps if they are older then one week
- Removed options to watch inbox and Deltachat folder from advanced settings
- Added option to only watch Deltachat folder to advanced settings
- Update error-stack-parser to 2.0.7
- Sending messages on pressing enter is now activated per default
- added `Command ⌘ + Enter` as alias for `Ctrl + Enter` to send message when `Press Enter to Send` is deactivated
- Disabled fetching account provider info as it causes the ui to be blocked
- migrate backend to strict typescript

### Fixed
- fix opening logfolder and logfile in appx
- Fix overflow in long links inside quotes @naomiceron #2467
- Show error if writing an attachment fails @IrvinLara9 #2479
- Fix connectivity view title @IrvinLara9 #2480
- Do not double log core events
- Fix Bulgarian language name (uppercase first letter)
- Fix signature text styling @ejgonzalez17
- Fix missing image formats @ejgonzalez17
- momentjs isn't localized on first startup
- Fix connectivity status hiding composer @trujillo9616
- Fix overflow in Confirmation Dialog @Abhijnan-Bajpai
- Fix the profile picture removal @cavesdev #2472
- Fix the horizontal scroll in autocrypt dialogs @cavesdev #2277
- Add logging in by pressing enter in AccountSetupScreen
- Fix blob width for html messages
- Fix usage of wrong translation key chat_no_contact_requests
- Fullscreen view for group avatar and own avatar in settings
- Fix messagelist sometimes not loading more messages
- Fix rockettheme font color for highlighted settings options
- Fix device messages showing unneccessary elements
- Fix background image url being absolute -> make it portable #2562


## [1.26.0] - 2021-12-15

### Added
- Add an attachment menu

### Fixed
- fix sending POI

### Changed
- Update translations (16.12.2021)


## [1.25.2] - 2021-12-11

### Added
- `PageUp` and `PageDown` keys can now be used to scroll in the MessageList
- Keeping `Alt + ArrowUp/ArrowDown` pressed now keeps selecting the next chat until the key is released
- Download on Demand

### Changed
- update `filesize` dependency to version `8.0.6`
- update deltachat-node to v1.70.0


## [1.25.1] - 2021-11-30

### Fixed
- fixed production builds (`npm run build4production`)


## [1.25.0] - 2021-11-29

> The Downloads of this version are broken because they were done with `npm run build4production` which was broken in this release, please either use `npm run build` or download `1.25.1` instead

> We jumped to `1.25` for the version (should in theory be `1.23`), to be get sync with android and iOS numbering again.

### Added
- Clicking on member in group dialog shows the profile of member
- Implement previous/next buttons for the gallery's media view (the left and right arrow keys can also be used for navigation)
- add update unread counts on account screen on incoming messages
- Clickable bot command suggestions, email addresses and hashtags in messages
- Clickable links in messages on the map
- Tray icon now shows a blue circle over the logo in case of unread messages (only linux + win)
- reload profile image on `DC_EVENT_SELFAVATAR_CHANGED` in settings

### Changed
- Upgrade deltachat-node to `v1.68.0`
- Bring back the back and close button in dialogs, move actions that need an ok/cancel button into it's own dialogs
- show contacts that are already in group in add member dialog, but disabled
- show chips for members to add
- update to typescript `4.4.4` and update eslint to version `8.2.0` (also updated the eslint plugins to their new versions)
- use our new rust (wasm) based message (text) parser instead of `simple-markdown` for making links (and so on) clickable
- remove dependencies that are now not needed anymore (`punycode`, `simple-markdown`)
- dont load quoted messages asynchronously
- Fetch more messages if as close as 200px to top of MessageList
- Join group via qr-code is now async (group already opens, no wait time)
- show only the relevant copy action in the context menu (selection, link, email or text depending on where the context menu was invoked)
- Use Qrcode svg from core
- Update translations (29.11.2021)

### Fixed
- don't show logo twice in notifications (because macOS already shows applogo)
- disable editing of left/readonly groups
- fix member list being incomplete in chat requests
- Fix messagelist not being at the correct position after fetching more messages
- Fix group names/contact names & contact email addresses not being selectable
- Fix scanning QRCode again while the Dialog is still open
- selecting chat now closes all notifications about it again
- fix quotes without message text are empty (#2434)
- Fix react warning in about dialog (#2428)
- Fix bug where wrong message is shown in chatlist item

### Changed
- use strict typescript for ui code

## [1.22.2] - 2021-09-23

### Fixed
- fix copy image to clipboard compatibility on windows (see #2323)
- fix whitescreen crash on startup

## [1.22.1] - 2021-09-22

### Removed
- remove nsis logging again because it breaks the release build

## [1.22.0] - 2021-09-22

### Removed

- Windows installer: don't allow user to choose the installation path. (because user could install to data path and loose data on uninstallation, see #2356)

### Added
- Windows installer: enable logging for installer

### Fixed
- fix unreadable POI message in map in dark themes
- fix map crash on maps in DM chats
- fix account removal on windows

## [1.21.1] - 2021-09-18

### Added
- add switch to toggle simultaneous account syncing off
- Implement settings for socks5 proxy

### Changed
- hide unfinished themes with the prefix `dev_` from the theme selection, unless `--devmode` is active.
- hide rocket theme

### Fixed
- fix flashing up account list on startup
- fix update/load core translation strings
- fix yggmail emailaddress text overflow in qrcode dialog & settings

## [1.21.0] - 2021-09-08

### Added

- Windows installer: Allow user to choose the installation path.
- Copy-paste images into chat
- make chatlist item height changeable by themes.
- "rocket chat"-like experimental theme
- Implement new contact request ui/ux
- Implement new connectivity view

### Changed
- Update translations (06.09.2021)
- Upgrade electron-builder to `22.12.0`
- Upgrade deltachat-node to `v1.60.0`
- Upgrade esbuild to `0.12.15`
- Update testcafe to `1.15.0`
- Upgrade `react` and `react-dom` to `17.0.2`
- refresh theme if there is an update event by electron
- Update to electron `13.1.6`
- Update some dependencies (`classnames`, `emoji-regex`, `mime-types`, `use-debounce`) and remove unused ones (`immutability-helper`, `@blueprintjs/select`, `wolfy87-eventemitter`, `@types/classnames`, `@types/css`, `@types/sass`, `depcheck`, `pngjs`)
- use core method to validate email addresses, this will make tld email addresses possible
- upgrade minimum nodejs to version `14`
- remove dependencies that are now not needed anymore (`fs-extra`)
- Upgrade `error-stack-parser` to `2.0.6`
- Make `sass` and `@types/debounce` development dependencies
- cleanup backend / main process (remove unused functions / variables)
- Remove dependency `array-differ`
- replace `react-virtualized` with `react-window`
- show user-visible error in fullscreen media view if mimetype isn't set or not supported
- migrate to core account system


### Fixed
- rename `--debug` flag to `--devmode` (in order to fix #2315)
- fix duplicated contacts in search
- fix going into archived view starts at bottom

## [1.20.3] - 2021-06-30

### Fixed
- Chat Background fixes (fix black border on bee background, fix preview of background in settings and color picker now is set to the current color when its opened)
- allow brackets in links (see #2238)

### Changed

- Update translations (30.06.2021)
- Update deltachat-node to `v1.56.0`

## [1.20.2] - 2021-06-04

### Added

- Add env option `VERSION_INFO_GIT_REF` to manualy set the git-ref on the version info, so that you can set it manually if needed. (interesting for packagers only)

### Fixed

- Fix "Forwarded by $author" in message and add support for overwritten sender name to it.
- Fix cursor type on hovering over sticker
- Fix links in status (profile view)

### Changed

- Adjust sticker styling (quote styling).

### Removed

- remove unused dependency `spectron`, which also removes `chromedriver` dependency.

## [1.20.1] - 2021-05-28

### Fixed

- fix empty settings after importing backup
- fix archiving/unarchiving chat deselection issues (see #2262)
- clear userfeedback on account switch / logout (see #2261)
- fix link color in quotes
- disable OK button in dialog to add new members to a group if noone is selected

### Changed

- update translations (28.05.2021)

## [1.20.0] - 2021-03-22

### Changed
- use new `decideOnContactRequest` api

### Added
- add option to open message HTML in browser
- encryption info for groups
- Add status text to profile view
- allow sending of ".webp" stickers
- allow starting a video chat in groups
- add local help for zh_CN and fr
- add missing Czech translation #2218
- add Mailinglist support
- add support for overwritten sender name (also sometimes referred to as impersonation)
- add experimental audit log to chats (view where only info/system messages are shown such as member added/removed)
- add `--minimized` CLI option to start DeltaChat minimized as a tray icon. This is useful for setting DeltaChat as a startup application that starts up with your computer.
- add support for handling `mailto:` links.

### Fixed
- Fix source-mapped stack trace on crash screen in bundled production builds
- Don't delete Contact request messages, that are blocked - answered with never. #2225
- hide show encryption info for saved messages (resulted in error)
- Make text of elements like timestamps, chat list summaries etc. non selectable
- remove "file://" scheme from filenames before calling `dc_msg_set_file` for stickers
- initialize name field in contact profile dialog with previously manually set name and use authname as a placeholder
- show context menu also for video chat messages
- Fix a bug where the settings crashed
- Fix a startup crash that sometimes appeared when you had multiple accounts setup.

### Changed

- update translations (22.05.2021)
- Update deltachat-node to `v1.55.0`
- Remove double-click to quote → this allows users to properly use double and triple click to select stuff again

## [1.15.5] - 2021-03-27

### Added

- add Menu item on macOS to show the main window

## [1.15.4] - 2021-03-24

### Fixed

- Fix dragging out file attachments [#2177](https://github.com/deltachat/deltachat-desktop/issues/2177)
- own location and path in maps is not visible in single chats
- Fix crash in settings-profile if account object is empty
- make notifications more reliable and allow multiple ones at a time

### Changed

- Switch back to file scheme [#2171](https://github.com/deltachat/deltachat-desktop/issues/2171) fixes audio and video seeking issues
- adjust warning/hint color of before-login-hint
- increase `DAYS_UNTIL_UPDATE_SUGGESTION` to 120 days
- improve notifications (show chat name and avatar)

## [1.15.3] - 2021-03-18

### Fixed

- Fix qrcode unscanable in darktheme [#2163](https://github.com/deltachat/deltachat-desktop/issues/2163)
- choose better default locations for file open dialogs [#2133](https://github.com/deltachat/deltachat-desktop/issues/2133)

### Changed

- Disable fontligatures completely
- Rename message context menu entry "Copy" to "Copy Text" [#2294](https://github.com/deltachat/deltachat-desktop/issues/2294)

## [1.15.2] - 2021-03-03

### Fixed

- Fix disable contact name edit field on device message
- Fix right click on image mesage opens both context menus [#2122](https://github.com/deltachat/deltachat-desktop/issues/2122)
- Fix Attachment sometimes not being displayed ([#2144](https://github.com/deltachat/deltachat-desktop/issues/2144))
- Fix possible backup corruption (pause io while doing a backup) ([#2148](https://github.com/deltachat/deltachat-desktop/issues/2148))
- Fix some react warnings ([#2152](https://github.com/deltachat/deltachat-desktop/issues/2152))
- Fix crash in settings
- Fix enabling/disabling notifications

### Changed

- update translations (02.03.2021)
- change "Download attachment" to "Export attachment"

### Added

- translations for Khmer, Kurdish, Sardu, Slovak and Norwegian

## [1.15.1] - 2021-02-13

### Fixed

- Package Problems

### Changed

- Update `electron-builder` to `22.9.1`
- Update `electron-notarize` to `1.0.0`

## [1.15.0] - 2021-02-11

### Added

- open message info when clicking on the error status icon of a message
- add deltachat desktop version & build info to the logfiles
- Add warn dialog for urls containing punycode
- add a minimalistic theme featuring an irc like message view
- add a context menu for electron (adds copy/paste options to composer [#1997](https://github.com/deltachat/deltachat-desktop/issues/1997), [#2047](https://github.com/deltachat/deltachat-desktop/issues/2047))
- Add copy button to qrcode text/url result dialog
- Add a confirmation dialog when starting a new videochat

### Changed

- always show timestamp and padlock/nopadlock on messages (previously padlock and timestamp were hidden on error)
- update translations (10.02.2021)
- add Farsi translation
- Try to always focus composer textarea
- Store relative instead of absolute path to last Account [#2028](https://github.com/deltachat/deltachat-desktop/issues/2028)
- replace parcel bunder with esbuild bundler (faster bundle speed)
- turn "theme not found" error from the `--theme` cli option from process exit into normal init fail with a user readable error message in an dialog.
- loghandler: warn on non-writable stream
- move error toast to top in order to free the view onto the message input field.
- overhaul ui of email settings
- overhaul ui of switching between media/message list and map
- overhaul ui of "context" menu button
- ui: integrate map dialog into the main screen
- Upgrade electron to version 11
- use only esbuild for frontend builds (skip typescript build & validation, typescript can now be checked with `npm run test` or `npm run check-types`)
- ui: make videochat invite messages look like on android
- ui: overhaul send message button
- ux: indicate who forwarded the message in groups

### Removed

- Remove intergrated BasicWebRTC, because it was broken and we currently lack the resources to fix and maintain it
- Disable React Devtools as they are broken in the newer electron versions
- remove terser minification, the minfication of esbuild is sufficient and faster

### Fixed

- correctly display RTL text inside of the message input field (see [#2036](https://github.com/deltachat/deltachat-desktop/issues/2036))
- performance: only mark messages read on the currently fetched page instead of all when selecting a chat
- show right default background for theme in background preview in settings
- handle invalid theme metadata better (don't display no themes anymore when one has invalid metadata)
- Fix copy of labeled links
- Fix hard to alter text in the middle of "Video chat instance" input field (see [#2016](https://github.com/deltachat/deltachat-desktop/issues/2016))
- Add missing options (at once, one minute...) for autodelete from server
- Update failed messages also in messagelist
- Fix crash on upgrading from v1.12 or earlier

## [1.14.1] - 2020-12-15

### Added

- Add Press F5 to call dcMaybeNetwork

### Changed

- Show linebreaks in quotes
- trust all labeled links from device chat
- Adjust order of buttons at labeled link dialog
- Change order and ux of context menus, especially for messages
- Increase padding of draft/reply area
- All import of .tar backup
- open profile view instead of chat on click on contact
- Switch to showing archived chats when selecting an archived chat in the chat search and emptying the search
- Switch to archived/normal view accordingly when selecting an archived/unarchived chat
- Update Translations
- call maybe_network on window focus
- Overhaul ui of chat background settings

### Fixed

- Fix "copy link" context menu option for labeled links
- Fix exception when opening second instance of deltachat and tray icon is disabled
- Fix showing/focusing deltachat on second instance
- Hide reply context menu option in device chat
- Fix messages sometimes overflowing
- Fix resizing of quote after fetching author
- Fix state update on unmounted components in Timestamp and LoginScreen
- Fix non emojis getting displayed big (see [#1989](https://github.com/deltachat/deltachat-desktop/issues/1989))
- Fix selecting a chat focus composer input (see [#1986](https://github.com/deltachat/deltachat-desktop/issues/1986))
- Fix processing qr code again while another is still getting processed
- Fix reconnecting logic on suspend/resume or disconnecting/connecting to a network
- Fix using first letter of email address on avatars if there is no username or profile image set
- Fix styling of disabled "remove profile image" button
- Fix bug in tray menu showing hide when the window was visible or vice-versa
- Hopefully fixed rare bug of draft area not getting cleared
- Fix copy text selection from context menu
- Fix Contact Requests (ui was not properly updating)

## [1.14.0] - 2020-11-24

### Added

- Upgrade Emoji Picker(Emoji 12.1) and emojifont(Unicode 13.1) for new emoji support 🦾
- Add Keyboard navigation between accounts in account selection screen
- Add the account name to the account deletion-confirmation dialog
- Add a hover tool-tip with account path and size when hovering over the email address of an account
  (this is useful when importing a backup of an account you already have and can't distinguish which is the old account and which is the imported one)
- Add context menu to gallery
- Option for packagers to disable asar (`NO_ASAR=true npm run pack:generate_config`).
- Added context menu for info messages
- Add simple support for displaying quotes (no attachment preview nor jump to message yet)
- Show sending indicator for outgoing info messages [#1867](https://github.com/deltachat/deltachat-desktop/issues/1867)
- Implement tray icon (huge thanks to [**@pepea28**](https://github.com/pepea28) for contributing & pushing this)
- Add info log message that lists all unconfigured accounts, so you don't need to find them yourself to delete them.  (see [#1952](https://github.com/deltachat/deltachat-desktop/issues/1952))
- Add draft/staging area
  - add a description to the files you send
  - reply to other messages
- Re-add pasting in of qrcode data

### Changed

- Change "More info" translation to "Message Details"
- Through the emoji mart update, frequent emojis are now not sorted immediately, fixes [#1177](https://github.com/deltachat/deltachat-desktop/issues/1177)
- gallery media display type is chosen via viewType now and if the mime type is not displayable by the browser an error is shown
- minor gallery style adjustments
- Own Context Menu Implementation that makes development easier
- Update translations
- Update deltachat-node to v1.50.0
- Update inAppHelp
- hasLocation indicator on messages is now always shown even when the experimental Location streaming feature is not turned on
- localize some unlocalized strings in settings ("select" and "remove" buttons beneath the profile image)
- Overhauled look and feel of the profile editing section in settings
- Overhauled look and feel of about dialog

### Removed

- removed inline message buttons (3dot menu button and download button)

### Fixed

- Fixed missing application icon for linux
- Fixed unselecting current chat after deleting another chat
- Fix hover color on emoji picker for light theme
- Fix missing translations in emoji picker
- Fix broken enlargen group image [#1924](https://github.com/deltachat/deltachat-desktop/issues/1924)
- Fix opening of multiple setting windows via keybinding
- Fix two issues with the labeled link (see  [#1893](https://github.com/deltachat/deltachat-desktop/issues/1893))
- Fix refresh of "empty chat" info meassage on chat changes
- Fix removing incompleted account (see [#1952](https://github.com/deltachat/deltachat-desktop/issues/1952))
- Fix that drag n' drop selection message text resulted in an "send following dropped files" dialog
- Fix adding of multiple members to a group via add member with searches in between (see [#1964](https://github.com/deltachat/deltachat-desktop/issues/1964))

## [1.13.1] - 2020-10-06

### Changed

- order media in gallery after sortTimestamp, newer ones up

### Fixed

- Fix a bug where we render an empty message list
- Hide invalid options in menu (example: send video invitation in device chat)

## [1.13.0] - 2020-10-01

### Fixed

- Fix search shows placeholders
- Fix ok button not being a primary button in EncryptionInfo dialog
- Fix handling of QrReader errors with own logger instead of console.error

## [1.13.0-rc4] - 2020-10-01

### Added

- Added indicator icon if disappearing messages are enabled in a chat/group

### Changed

- Update deltachat-node to v1.45.0
- run npm audit fix
- Overhaul colors of login hint
- Change "remove account" translation to "delete account"
- Disappearing messages are now enabled by default and not experimental anymore

### Fixed

- Fix network errors not shown on failed login
- Fix crash on settings after first login
- Make sure login screen doesn't flash on slow devices
- Fix logging of react crashes.
- Fix confusing error message on wrong autocrypt setup message code
- Fix automatically login to last remembered account
- Fix scanning qr code and general improvement of the whole process
- Fix avatar initials of the text avatars, of people with no displayname, inside of the messagelist
- Fix refreshing message list when disappearing message timed out

## [1.13.0-rc1] - 2020-08-13

### Changed

- Improve UX of changing/updating group & contact names, add buttons in those dialogs to the dialog footer
- Overhaul QR Code dialog and condense scan/show qr code into one dialog
- Implement welcome screen & overhaul login flow & account overview
- Update deltachat-node to v1.44.0

### Fixed

- Fix sluggish ui while typing in email address in login form
- Fix url parsing in labeled link confirmation dialog

## [1.12.0] - 2020-07-31

### Changed

- Updated deltachat-node to v1.42.1

## [1.10.4] - 2020-07-30

### Added

- Implement experimental WebRTC support for 1to1 video chats & audio calls

## [1.10.3] - 2020-07-30

### Fixed

- Fix labeled links (fix the regex, make it dumber)

## [1.10.2] - 2020-07-30

### Fixed

- Fix messagelist being empty when starting chat with contact request
- Fix messagelist not having a scrollbar sometimes
- Fix settings dialog not closable with escape key
- Fix "New contact" in search results

## [1.10.1] - 2020-07-29

### Added

- add hint below ephemeral messages options, that explains the feature

### Fixed

- translate the term "error" in configure dialog
- fix "Invalid date" in message details on searchresult

### Removed

- disable keycombination for Scroll active chat (`alt + left arrow` because this keyboard shortcut is already used by mac to move over words in input fields)

### Updated

- deltachat-node to 1.41.0
- core version 1.41

## [1.10.0] - 2020-07-16

### Added

- :colon-emoji: support for skin tones (:+1::skin-tone-6:)
- :colon-emoji:'s are now replaced with the unicode emoji they represent on send
- add explaination if there are no contact requests
- add support for markdown links `[label](url)` (with a open confirmation dialog to prevent phishing)
- implement disappearing messages as an experimental feature

### Fixed

- fix using the system language if no language is selected
- fix a bug where the user would end up with multiple contexts after reloading from a frontend crash
- fix Chat-view does not scroll down on incoming message [#1783](https://github.com/deltachat/deltachat-desktop/issues/1783)

### Changed

- when opening the emoji picker its search bar gets now focused and when closing it the composer gets focused

### Technical

- removed `styled-components`
- increase the version numbering to 1.10 to sync up with ios & android versioning and to avoid troubles with the ancient tags that still linger in the git history.

### Updated

- updated google-noto color emoji font
- deltachat-node to `1.40.0`
- core version `1.40`

## [1.4.3] - 2020-06-30

### Added

- localize full timestamps (when hovering above the short ones) (issue [#1732](https://github.com/deltachat/deltachat-desktop/issues/1732))

### Fixed

- fix startup with last used language (issue [#1765](https://github.com/deltachat/deltachat-desktop/issues/1765))
- fix language update did not apply instantly (issue [#1637](https://github.com/deltachat/deltachat-desktop/issues/1637))
- fix ChatListItem timestamp bug (issue [#1720](https://github.com/deltachat/deltachat-desktop/issues/1720))

### Changed

### Technical

- `window.translate` is now `window.static_translate`
- also introduced `<i18nContext.Consumer>` & `useTranslationFunction()` which trigger a rerender when the language changes

## [1.4.2] - 2020-06-26

### Added

- Burner accounts with QR code
- Theming (some Dark themes and the possibibilty to add even custom ones)
- Mute Chats
- Add Search for Contacts and Messages
- Add autodelete settings
- add git rev to the version in the about dialog
- Oportunistic reminder to update after 90days
- Add a crash-screen that appears instead of the white-screen on a react crash.
- Add enlarge group image
- Add chat image to navbar

### Fixed

- Pointer cursor on hovering over document item
- update Readme a bit
- Fix whitescreen crash on opening the EncryptionInfoDialog
- Fix drop send multiple files at once ([#1622](https://github.com/deltachat/deltachat-desktop/issues/1622))
- Fix window bounds are not saved correctly [#1705](https://github.com/deltachat/deltachat-desktop/issues/1705)
- Fix export backup progress bar missing
- Fix `dc_get_msg called with special msg_id=0` warnings printed to console
- Fix window position on first start ([#1711](https://github.com/deltachat/deltachat-desktop/issues/1711))
- Fix error message on login starting with ',' [#1702](https://github.com/deltachat/deltachat-desktop/issues/1702)
- Fix offline toast displayed before login [#1729](https://github.com/deltachat/deltachat-desktop/issues/1729)
- Fix "Authentication failed" notification does not disappear even after successfull login [#1594](https://github.com/deltachat/deltachat-desktop/issues/1594)
- Fix login button staying disabled on error [#1661](https://github.com/deltachat/deltachat-desktop/issues/1661)
- Fix use system language until the user chooses their language [#1712](https://github.com/deltachat/deltachat-desktop/issues/1712)
- Fix selecting a non existing chat after restarting DeltaChat

### Changed

- Tweak settings design a bit
- Adjust chatlistitem hover colors
- Improve human-readability of logfiles
- display the offline status as permanent toast instead of the error message
- open an electron error dialog on uncaught Excerptions
- Tweak Login styling
- move qr code description up
- Tweak: Less cursor type switching
- Improve styling of Fullscreen-Attachment buttons
- move the verified icon over the group avatar
- now it is possible to have multiple accounts with the same email address (you can import a backup next to the active account)
- change account path again - now the account folder name isn't tied to the email address anymore.
- Update to deltachat-node v1.39.0 (async core)
- Add open attachment to message context menu and increase clickable area (click to open attachment)
- Overhauled login/update credentials flow & ui/ux to provide a more stable and clear experience
- Importing a backup now automatically loads the imported account
- Save account path instead of account addr for remembering the last selected account
- We don't scroll down on incoming messages anymore
- Solved the macOS appstore issue and the macOS notarizing issue.
- Exclude some unused resources from being bundled with the release.

### Technical

This section is only relevant to contributors.

- Convert everything in the source folder to typescript
- move more styles from styled-components to scss
- Refactor Dialog system to make things easier for developers and fix stacking multiple instances of the same dialog
- split settings dialog into multiple files
- convert `require`s to `import`s
- Refactor Keybindings
- Split Build script into smaller build scripts.
- replace `node-sass` with `sass` to remove the native dependency
- introduce `runtime.ts` as a place to collect electron specific functions (will replace `renderer/ipc.ts`)
- 1.4.0 and 1.4.1 don't have a tag/release as they were test versions only distributed on the Microsoft App Store

### Updates

- update Translations
- update Help

## [1.3.4] - 2020-05-18

### Fixed

- Fix crash on login when entering invalid email
- Fix not being able to login because of old core
- Fix scanning qr code
- Fix error toast only showing the event name and not the error message

### Changed

- Upgrade deltachat-node to v1.33.0

## [1.3.3] - 2020-05-12

### Fixed

- Fix encryption dialog causing white screen

### Changed

- Account Path: old accounts are now migrated to the new account system.

> If you experience startup problems make sure you don't have two account folders of the same account.\\
> This could happen if you duplicated an account folder for backup purposes, for example.
> If you did not modify the account folders please open an issue on github.

## [1.3.2] - 2020-05-11

### Fixed

- Fix not being able to delete the first character when renaming a contact

### Changed

- Mirror picture when scanning a QR code
- Update deltachat-node to v1.32.0

## [1.3.1] - 2020-05-05

### Fixed

- Fix showing the correct menu on Mac
- Fix showing the titlebar on Mac
- Fix qr scanning on Mac

## [1.3.0] - 2020-04-30

### Added

- add Import/Scan QR code which enables you to verify contacts and to join verifed groups from desktop ([#1550](https://github.com/deltachat/deltachat-desktop/issues/1550))
- add pinned chats [#1537](https://github.com/deltachat/deltachat-desktop/issues/1537)
- add big view of profile image (closes [#1356](https://github.com/deltachat/deltachat-desktop/issues/1356))
- add option to change a contacts displayname ([#1502](https://github.com/deltachat/deltachat-desktop/issues/1502))
- add some Mac keybindings (related to [#1451](https://github.com/deltachat/deltachat-desktop/issues/1451))
  - add `cmd + ,` as shortcut to open the settings
  - focus the message composer
  - mac specific hide window (solves [#634](https://github.com/deltachat/deltachat-desktop/issues/634))
- add primitive & experimental contact import (you can import a json array of contacts in the devconsole)
- add archive label to archived chats [#1537](https://github.com/deltachat/deltachat-desktop/issues/1537)
- add support for opening openpgp4fpr uris with deltachat-desktop

### Changed

- `--debug` enables now `--log-debug` & `--log-to-console`
- The forward message dialog now shows `saved messages` as first option.

### Performance Improvements

- remove lag when scolling the settings (add thumbnails for chat backgrounds in settings screen)

### Bugfixes

- Info events are now always logged (not only when `--log-debug` is enabled)
- fix that emojis get displayed right in the popups
- fix composer whitescreen when having a zoomlevel
- Some styling fixes:
  - remove unneccessary border on chatlist
  - changer caret color of sarch input to the same color as the placeholder
  - make dialog height overlap navbar/composer for fixed dialogs
  - Fix fake-contact-item label [#1529](https://github.com/deltachat/deltachat-desktop/issues/1529)
- fixes help won't open on mac (open help in seperate electron window)
- fix hover color for selected chats and make it a lot more slight

### Technical

This section is only relevant to contributors.

- Convert project files to typescript (75% complete)
- Move more styled components to scss and cleanup some unsused classes
- add top-evil script (shows places that need work)

### Updated

- Update translations & languages shown in menu, change prefix of npm translation scripts
- Update Core to [`deltachat-core-rust @ 979d7c5`](https://github.com/deltachat/deltachat-core-rust/tree/979d7c562515da2a30983993048cd5184889059c) (deltachat-node `v1.29.1`)

## [1.2.0] - 2020-03-30

### Changed

- Update deltachat-node/deltachat-core-rust to v1.28.0
- Some typescript convertions [**@Simon-Laux**](https://github.com/Simon-Laux)

### Fixed

- Fix a bug on incoming message where screen went blank [**@Simon-Laux**](https://github.com/Simon-Laux) [#1523](https://github.com/deltachat/deltachat-desktop/issues/1523)
- Copy whole message to clipboard [**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix about dialog links [**@Simon-Laux**](https://github.com/Simon-Laux)
- Make e2e tests more stable [**@nicodh**](https://github.com/nicodh)

## [1.1.1] - 2020-03-14

### Changed

- Update deltachat-node/deltachat-core-rust to v1.27.0
  - This fixes a bug of undecryptable messages

## [1.1.0] - 2020-03-10

### Added

- Add copy qr code manually
- Add zoom factor option in order to adjust font size. (It's found under `View`->`Zoom Factor`)

### Changed

- Development related:
  - new code formatter (prettier insted of standardjs)
  - convert some more code to typescript
- update deltachat node 1.26.0
  - update core in order to get the [`Ed25519`](https://github.com/deltachat/deltachat-desktop/commit/Ed25519)-key bugfix in [deltachat/deltachat-core-rust#1327](https://github.com/deltachat/deltachat-core-rust/pull/1327)

### Fixed

- fix focus composer textarea when chat id changes
- fix group name editable
- fix avatar shrink bug on too long names (profile view)
- fix emoji name/initial avatars in message list
- fix a css bug that destroyed the app layout in media view ([`eadd487`](https://github.com/deltachat/deltachat-desktop/commit/eadd48719f5b796e3c6c53f3bc04fe348b97abfe))
- fix copy to selection button shown even when nothing was selected.

### Removed

- removed some unused dependencies

### Known Bugs

- inApp help is broken on MacOS Help

## [1.0.0] - 2020-02-22

### Known Bugs

- [`Ed25519`](https://github.com/deltachat/deltachat-desktop/commit/Ed25519) keys are broken sometimes due to a bug in core ([deltachat/deltachat-core-rust#1326](https://github.com/deltachat/deltachat-core-rust/issues/1326))
- inApp help is broken on MacOS Help

### Added

- open help via F1
- button to open DM chat in profile view
- info messages are now selecteable
- provider info
- info message in empty chats
- `--multiple-instances` flag to allow multiple deltachat instances

### Changed

- Upgrade deltachat-node to `v1.25.0`
- upgrade electron builder to `22.3.2`
- upgrade electron to `6.1.7`
- Open Help in browser
- improved build process
- Chat scrolling improvements
- replace webpack with parcel
- convert more
- Restyle main menu
- Media view doesn't go into fullscreen anymore.

### Fixed

- Small styling fixes
- Fix qr images getting scrollable
- Duplicate language entries in Language selection menu
- Fix Message state was not updated in ChatView
- Fix images so they don't cause horizontal scrolling anymore.

### Removed

- remove version from titlebar

## [0.999.1] - 2020-02-02

### Fixed

- Fix crash on help in distributed packages

## [0.999.0] - 2020-02-02

### Added

- Fullscreen view for media files
- Select last openend chat after starting app
- Implement In-App Help
- Implement BCC-Self setting
- Add TypeScript support
- Add/Move to TestCafe as testing framework
- Add windows icons

### Changed

- Improve chatlist performance
- Removed welcome screen and image
- Rewrite account folder logic
- Improve styling of media gallery
- Show Verified Icon in Navbar
- Disable search when showing archived chats
- Update deltachat-node to v1.0.0-beta23.1

### Fixed

- Fix importing keys
- Various login & account setting fixes
- Fix unread counter
- Fix clicking on notifications and focusing app
- Map dialog styling
- Fix qr images overflowing on small screens
- Fix missing avatars in groups
- Fix sometimes not loading all messages
- Fix destination of DeltaChatData folder if run as portable app
- Delete old logs
- Fix showing spinner more noticable
- Fix video attachment play button

## [0.901.0] - 2019-12-20

### Changed

- reword the hints when the user cannot write to a chat [#1231](https://github.com/deltachat/deltachat-desktop/pull/1231) [**@r10s**](https://github.com/r10s) [**@hpk42**](https://github.com/hpk42)
- Internal: fix logger format when logging to console is enabled for translation errors [#1061](https://github.com/deltachat/deltachat-desktop/issues/1061)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Improve confirm dialogs [#1249](https://github.com/deltachat/deltachat-desktop/pull/1249) [**@Simon-Laux**](https://github.com/Simon-Laux)

### Removed

- markdown removed (will come back in the future)

### Fixed

- Fix the desktop side of the bug where when a user changed their name the new name wasn't displayed see [#1228](https://github.com/deltachat/deltachat-desktop/issues/1228) for more info on that bug.

- Fix MessageList not updating/scrolling down on incoming message [#1229](https://github.com/deltachat/deltachat-desktop/pull/1229) [**@Jikstra**](https://github.com/Jikstra)

- Fix subtitle missing in device-chat [#1225](https://github.com/deltachat/deltachat-desktop/issues/1225)[**@Simon-Laux**](https://github.com/Simon-Laux)

- Fix CHAT_MODIFIED state update [#1247](https://github.com/deltachat/deltachat-desktop/pull/1247) [**@nicodh**](https://github.com/nicodh)

- Fix POI only visible after reloading map [#1351](https://github.com/deltachat/deltachat-desktop/issues/1251) [**@nicodh**](https://github.com/nicodh)

- Avoid update draft loop [#1248](https://github.com/deltachat/deltachat-desktop/pull/1248) [**@nicodh**](https://github.com/nicodh)

- Make sure all layers are removed before updates [#1259](https://github.com/deltachat/deltachat-desktop/pull/1259) [**@nicodh**](https://github.com/nicodh)

- Fix bug: chat was still selected active after switching accounts [#1260](https://github.com/deltachat/deltachat-desktop/issues/1260) [**@nicodh**](https://github.com/nicodh)

- Don't fetch chat twice [#1262](https://github.com/deltachat/deltachat-desktop/pull/1262) [**@nicodh**](https://github.com/nicodh)

- Update deltachat-node to 1.0.0-beta.21
  - upgrade core [1.0.0-beta.21](https://github.com/deltachat/deltachat-core-rust/blob/master/CHANGELOG.md#100-beta21)

## [0.900.0] - 2019-12-12

### Changed

- rename `logout` to `switch account` [fdb62d7](https://github.com/deltachat/deltachat-desktop/commit/fdb62d7c50b645518b2d57f1d7434b45e327ae14) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Save log to file containing correct day and month (starting at 1 rather than at 0 for january) [#1145](https://github.com/deltachat/deltachat-desktop/pull/1145)[**@pabzm**](https://github.com/pabzm)
- Improve Background Selection layout (refactor) [#1162](https://github.com/deltachat/deltachat-desktop/pull/1162) [**@nicodh**](https://github.com/nicodh)
- New Background Images [**@paulaluap**](https://github.com/paulaluap) [**@nicodh**](https://github.com/nicodh)
- make messageStatusIcon in chatlistitem green [#1173](https://github.com/deltachat/deltachat-desktop/pull/1173)[**@Simon-Laux**](https://github.com/Simon-Laux)

### Added

- DOCUMENTATION: guidelines for css [#1072](https://github.com/deltachat/deltachat-desktop/pull/1123) [**@Simon-Laux**](https://github.com/Simon-Laux)
- possibility to make truly portable windows builds [forum topic](https://support.delta.chat/t/please-make-deltachat-for-windows-a-truly-portable-standalone-program/675) [#1138](https://github.com/deltachat/deltachat-desktop/pull/1138/files) [**@Simon-Laux**](https://github.com/Simon-Laux)
- (Map) add an icon for Point of Interest [#1127](https://github.com/deltachat/deltachat-desktop/issues/1127)[**@nicodh**](https://github.com/nicodh)
- Add map marker icon to messages with location [#1127](https://github.com/deltachat/deltachat-desktop/issues/1127)[**@nicodh**](https://github.com/nicodh)
- Add "Copy link" into context menu [#1153](https://github.com/deltachat/deltachat-desktop/pull/1153)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Add setting to set & change profile image [#1151](https://github.com/deltachat/deltachat-desktop/pull/1151)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Implement keybindings [#1157](https://github.com/deltachat/deltachat-desktop/pull/1157)[**@Jikstra**](https://github.com/Jikstra)[**@missytake**](https://github.com/missytake)
- Add file drag-in confirmation dialog [#1174](https://github.com/deltachat/deltachat-desktop/pull/1174)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Add forwarded message indicator [#1183](https://github.com/deltachat/deltachat-desktop/pull/1183)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Make chat title and group name clickable [#1192](https://github.com/deltachat/deltachat-desktop/pull/1192)[**@nicodh**](https://github.com/nicodh)
- Create device chat and saved message chat on first login [#1199](https://github.com/deltachat/deltachat-desktop/pull/1199)[**@Jikstra**](https://github.com/Jikstra)

### Removed

- remove Terrain view (mapbox) [#1127](https://github.com/deltachat/deltachat-desktop/issues/1127)[**@nicodh**](https://github.com/nicodh)

### Fixed

- Fix empty lines are not preserved [#1119](https://github.com/deltachat/deltachat-desktop/issues/1119) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix appdata.xml for flatpak builds [#1125](https://github.com/deltachat/deltachat-desktop/issues/1125) [**@muelli**](https://github.com/muelli)
- Fix Theming issues (theming is still WIP) [#1072](https://github.com/deltachat/deltachat-desktop/pull/1072) [**@MIntrovrt**](https://github.com/MIntrovrt)
- Fix devbuilds to really use an own data directory [ffcfb52](https://github.com/deltachat/deltachat-desktop/commit/ffcfb528d926c7e0fe4e46e028e57bffdb3ee55d)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix first message missing in messagelist [2d2ad4a](https://github.com/deltachat/deltachat-desktop/commit/2d2ad4ac9c1103547752d67f63c335fa54b5e1db)[**@Jikstra**](https://github.com/Jikstra)
- Fix subtitle disappears in chatview [#1130](https://github.com/deltachat/deltachat-desktop/issues/1130)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix selecting a file to import a secret key. [#1144](https://github.com/deltachat/deltachat-desktop/pull/1144) [**@pabzm**](https://github.com/pabzm)
- Fix incoming image metadata unreadable [#1135](https://github.com/deltachat/deltachat-desktop/pull/1135)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix freeze when clicking on POI and a few other map bugs [#1127](https://github.com/deltachat/deltachat-desktop/issues/1127)[**@nicodh**](https://github.com/nicodh)
- Fix background color selector disappearing [a6f837f](https://github.com/deltachat/deltachat-desktop/commit/a6f837ffb895790112409ee64349c67fb687c794)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix groupname in show group qr code [#1154](https://github.com/deltachat/deltachat-desktop/pull/1154)[**@link2xt**](https://github.com/link2xt)
- Fix New group chat isn't selected [#1155](https://github.com/deltachat/deltachat-desktop/issues/1155)[**@nicodh**](https://github.com/nicodh)
- Fix Show encryption info crashes [#1166](https://github.com/deltachat/deltachat-desktop/issues/1166)[**@Jikstra**](https://github.com/Jikstra)
- Messages appear in wrong chat (on scrolling up) [#1158](https://github.com/deltachat/deltachat-desktop/issues/1158)[**@Jikstra**](https://github.com/Jikstra)
- Chat scrolls not to completely to bottom if pictures are present [#477](https://github.com/deltachat/deltachat-desktop/issues/477)[**@Jikstra**](https://github.com/Jikstra)
- Chat updates (such as delete or new incoming message) result in jumping to the end [#712](https://github.com/deltachat/deltachat-desktop/issues/712)[**@Jikstra**](https://github.com/Jikstra)
- Fix dispatching select chat action [#1205](https://github.com/deltachat/deltachat-desktop/pull/1205)[**@Jikstra**](https://github.com/Jikstra)
- Message does't resize to chat area if display_name is long [#1188](https://github.com/deltachat/deltachat-desktop/issues/1188)[**@Jikstra**](https://github.com/Jikstra)
- Playing audio from "audio" tab opens fullscreen preview window and play in background [#1168](https://github.com/deltachat/deltachat-desktop/issues/1168)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix login progress bar [#1211](https://github.com/deltachat/deltachat-desktop/pull/1211)[**@Jikstra**](https://github.com/Jikstra)
- Fix take message height from core into account [#1210](https://github.com/deltachat/deltachat-desktop/pull/1210)[**@Simon-Laux**](https://github.com/Simon-Laux)

### Refactorings

- Message component (scss classes edition) [#1072](https://github.com/deltachat/deltachat-desktop/pull/1123) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Message component Part 2 [#1147](https://github.com/deltachat/deltachat-desktop/pull/1147) [**@Simon-Laux**](https://github.com/Simon-Laux)
- MainScreen and split MessageList component into two components [#1128](https://github.com/deltachat/deltachat-desktop/pull/1128)[**@Jikstra**](https://github.com/Jikstra)
- Background Selection layout [#1162](https://github.com/deltachat/deltachat-desktop/pull/1162) [**@nicodh**](https://github.com/nicodh)
- Rewrite MessageList store logic and refactor chat store [#1161](https://github.com/deltachat/deltachat-desktop/pull/1161)[**@Jikstra**](https://github.com/Jikstra)
- Refactor \_messagesToRender [#1114](https://github.com/deltachat/deltachat-desktop/pull/1114)[**@link2xt**](https://github.com/link2xt)

### Mentions

- [**@adbenitez**](https://github.com/adbenitez) fixed some types
- Thanks to our translators


- Update deltachat-node to 1.0.0-beta.15
  - upgrade core [1.0.0-beta.15](https://github.com/deltachat/deltachat-core-rust/blob/master/CHANGELOG.md#100-beta15)

## [0.840.0] - 2019-11-05

### Changed

- ChatView refactoring [#1017](https://github.com/deltachat/deltachat-desktop/issues/1017) [**@nicodh**](https://github.com/nicodh)
- Add janka's welcome image [**@jankass**](https://github.com/jankass) [**@Simon-Laux**](https://github.com/Simon-Laux) [**@jikstra**](https://github.com/jikstra)
- Rename the `Create group` button to a more generic `ok` button [**@Jikstra**](https://github.com/Jikstra)
- Improve backend & frontend logging [#1026](https://github.com/deltachat/deltachat-desktop/issues/1026) [#1030](https://github.com/deltachat/deltachat-desktop/issues/1030) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Various styling tweaks [**@Simon-Laux**](https://github.com/Simon-Laux) [#1039](https://github.com/deltachat/deltachat-desktop/issues/1039)
- Improve backend deltachat controller [**@Simon-Laux**](https://github.com/Simon-Laux) [#1056](https://github.com/deltachat/deltachat-desktop/issues/1056)
- Reorder settings [**@jikstra**](https://github.com/jikstra) ([#1035](https://github.com/deltachat/deltachat-desktop/issues/1035))
- Upload preview builts to download.delta.chat (CI) [**@lefherz**](https://github.com/lefherz) [#1088](https://github.com/deltachat/deltachat-desktop/issues/1088)
- Implement ssl certificate settings [**@link2xt**](https://github.com/link2xt) [#1076](https://github.com/deltachat/deltachat-desktop/issues/1076)
- Restyle user-feedback [**@jikstra**](https://github.com/jikstra) [#1100](https://github.com/deltachat/deltachat-desktop/issues/1100)
- Add new zealand background image of [**@nicodh**](https://github.com/nicodh) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Update deltachat-node to v1.0.0-alpha.11
- Restyle about dialog [**@jikstra**](https://github.com/jikstra)
- Implement maybeNetwork [**@jikstra**](https://github.com/jikstra)
- Hide retry send from message context menu [**@nicodh**](https://github.com/nicodh)
- Call setCoreStrings after opening the context [**@link2xt**](https://github.com/link2xt)
- Add confirm delete message dialog [**@hansal7014**](https://github.com/hansal7014) [#1083](https://github.com/deltachat/deltachat-desktop/issues/1083)

### Fixed

- Fix windows background [**@Simon-Laux**](https://github.com/Simon-Laux) ([#1016](https://github.com/deltachat/deltachat-desktop/issues/1016))
- Fix constants in serverFlags conversion [#1028](https://github.com/deltachat/deltachat-desktop/issues/1028) [**@link2xt**](https://github.com/link2xt)
- Fix showing user feedback/errors again [**@Simon-Laux**](https://github.com/Simon-Laux) [#1047](https://github.com/deltachat/deltachat-desktop/issues/1047)
- Fix mark message as seen [**@Simon-Laux**](https://github.com/Simon-Laux) [#1054](https://github.com/deltachat/deltachat-desktop/issues/1054)
- Fix showing line breaks in Messages [**@Jikstra**](https://github.com/Jikstra) [#1062](https://github.com/deltachat/deltachat-desktop/issues/1062)
- Close edit group dialog when clicking on save button [**@jikstra**](https://github.com/jikstra) ([#1067](https://github.com/deltachat/deltachat-desktop/issues/1067))
- Fix broken notificatins [**@nicodh**](https://github.com/nicodh) [#1071](https://github.com/deltachat/deltachat-desktop/issues/1071)
- Fix media view [**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix showing qr code on group creation [**@Jikstra**](https://github.com/Jikstra) [#1101](https://github.com/deltachat/deltachat-desktop/issues/1101)
- Fix various key warnings [**@Jikstra**](https://github.com/Jikstra) [#1103](https://github.com/deltachat/deltachat-desktop/issues/1103)
- Do not call messageToJson for daymarker messages [**@link2xt**](https://github.com/link2xt)
- Fix updating account settings [**@nicodh**](https://github.com/nicodh)
- Fix serverFlags [**@link2xt**](https://github.com/link2xt)

### Added

- Implement experimental sticker support [**@jikstra**](https://github.com/jikstra) [#1032](https://github.com/deltachat/deltachat-desktop/issues/1032)
- Add react dev tools [#1029](https://github.com/deltachat/deltachat-desktop/issues/1029) [**@simon-laux**](https://github.com/simon-laux)

## [0.201.0] - 2019-09-27

### Added

- A few default chat background images to choose from [**@Simon-Laux**](https://github.com/Simon-Laux)

### Fixed

- fixed new Language Strings and fixed a11y strings

## [0.200.0] - 2019-09-26

### Added

- Add user customizable message list backgrounds [**@Simon-Laux**](https://github.com/Simon-Laux) [#1001](https://github.com/deltachat/deltachat-desktop/issues/1001)
- Add placeholder chatlist items [**@Simon-Laux**](https://github.com/Simon-Laux) [#1007](https://github.com/deltachat/deltachat-desktop/issues/1007)
- Implement lazy loading chatlist [**@Jikstra**](https://github.com/Jikstra) [#997](https://github.com/deltachat/deltachat-desktop/issues/997)
- Add labels for icon buttons to improve Accessability [**@Simon-Laux**](https://github.com/Simon-Laux) [#966](https://github.com/deltachat/deltachat-desktop/issues/966)
- Add basic theming support and some themes, major css refactoring included (not yet exposed in Settings, needs cli parameter) [**@Simon-Laux**](https://github.com/Simon-Laux) [**@MIntrovrt**](https://github.com/MIntrovrt) [#911](https://github.com/deltachat/deltachat-desktop/issues/911)

### Changed

- Upgrade deltachat-node to v1.0.0-alpha.8 [**@Jikstra**](https://github.com/Jikstra)
- Use hooks for loading contacts/chats [**@Jikstra**](https://github.com/Jikstra)
- UI Rework: Create Chat/Group [**@Jikstra**](https://github.com/Jikstra) [#957](https://github.com/deltachat/deltachat-desktop/issues/957)
- UI Rework: Edit Group [**@nicodh**](https://github.com/nicodh) [#970](https://github.com/deltachat/deltachat-desktop/issues/970)
- UI Rework: Put most screen changes into dialogs
- UI Rework: Settings
- Upgrade standard [**@ralphtheninja**](https://github.com/ralphtheninja) [#900](https://github.com/deltachat/deltachat-desktop/issues/900)

### Fixed

- Fix typos in \_experimental_en.json [**@OzancanKaratas**](https://github.com/OzancanKaratas) [#1003](https://github.com/deltachat/deltachat-desktop/issues/1003)
- Fix copy/paste log path on Mac [**@clemens-tolboom**](https://github.com/clemens-tolboom) [#988](https://github.com/deltachat/deltachat-desktop/issues/988)

## [0.104.0] - 2019-06-09

### Added

- Add ci deb building scripts [**@hpk42**](https://github.com/hpk42) [**@jikstra**](https://github.com/jikstra) [#752](https://github.com/deltachat/deltachat-desktop/issues/752)
- Add ci deb build instructions for ubuntu 19.04 [**@jikstra**](https://github.com/jikstra)
- Add ci deb build instructions for 19.04 with netpgp [**@jikstra**](https://github.com/jikstra) [#814](https://github.com/deltachat/deltachat-desktop/issues/814)
- Add settings for displayname and signature [**@Simon-Laux**](https://github.com/Simon-Laux) [#810](https://github.com/deltachat/deltachat-desktop/issues/810)
- Add progress indicator on login [**@Simon-Laux**](https://github.com/Simon-Laux) [#811](https://github.com/deltachat/deltachat-desktop/issues/811)
- Add incremental builds on watching [**@Jikstra**](https://github.com/Jikstra) [#827](https://github.com/deltachat/deltachat-desktop/issues/827)
- Refactor message body and implement simple markdown [**@Simon-Laux**](https://github.com/Simon-Laux) [#833](https://github.com/deltachat/deltachat-desktop/issues/833)
- Add advanced settings section and switch to turn on/off location streaming [**@jikstra**](https://github.com/jikstra) [#832](https://github.com/deltachat/deltachat-desktop/issues/832)

### Changed

- Open files in media view directly [**@Simon-Laux**](https://github.com/Simon-Laux) [#817](https://github.com/deltachat/deltachat-desktop/issues/817)
- Refactor chatlist & messagelist, use async approach, improves performance a lot [**@nicodh**](https://github.com/nicodh) [#835](https://github.com/deltachat/deltachat-desktop/issues/835) [#840](https://github.com/deltachat/deltachat-desktop/issues/840)
- Remove unused dependencies [**@Simon-Laux**](https://github.com/Simon-Laux) [#835](https://github.com/deltachat/deltachat-desktop/issues/835)
- remove i18n property and replace each occurence with the transifex one [**@Simon-Laux**](https://github.com/Simon-Laux) [#843](https://github.com/deltachat/deltachat-desktop/issues/843)

### Fixed

- Fix ci deb building, add building .debs for 18.10 (backported to 0.103.0) [**@Jikstra**](https://github.com/Jikstra) [#805](https://github.com/deltachat/deltachat-desktop/issues/805)
- Fix ci testing [**@Jikstra**](https://github.com/Jikstra) [#826](https://github.com/deltachat/deltachat-desktop/issues/826)
- Update fstream dependency [**@jikstra**](https://github.com/jikstra) [#825](https://github.com/deltachat/deltachat-desktop/issues/825)
- Use a friendlier file name for logs on windows [**@ralphtheninja**](https://github.com/ralphtheninja) [#828](https://github.com/deltachat/deltachat-desktop/issues/828)
- Fix images in media gallery showing as squares again [**@Simon-Laux**](https://github.com/Simon-Laux) [#847](https://github.com/deltachat/deltachat-desktop/issues/847)
- Update rpgp to 0.2.1 [**@jikstra**](https://github.com/jikstra) [#844](https://github.com/deltachat/deltachat-desktop/issues/844)

## [0.103.0] - 2019-05-22

### Added

- add context menu to ChatList [**@Simon-Laux**](https://github.com/Simon-Laux) [#698](https://github.com/deltachat/deltachat-desktop/issues/698)
- Add location streaming support [**@nicodh**](https://github.com/nicodh) [#747](https://github.com/deltachat/deltachat-desktop/issues/747)
- Add map controls [**@nicodh**](https://github.com/nicodh) [#765](https://github.com/deltachat/deltachat-desktop/issues/765)
- Add react-debugger [**@Simon-Laux**](https://github.com/Simon-Laux)
- Update and integrate appstream file (flatpaks) [**@flub**](https://github.com/flub) [#730](https://github.com/deltachat/deltachat-desktop/issues/730)
- Implement drafts [**@jikstra**](https://github.com/jikstra) [#721](https://github.com/deltachat/deltachat-desktop/issues/721)

### Changed

- simplify chat object creation, optimisations & remove unpkg from whitelist [**@Simon-Laux**](https://github.com/Simon-Laux)
- Refactor sass [**@nicodh**](https://github.com/nicodh)
- Update deltachat-node to 0.43.0 [**@ralphtheninja**](https://github.com/ralphtheninja)
- New state handling [**@nicodh**](https://github.com/nicodh) [#785](https://github.com/deltachat/deltachat-desktop/issues/785)
- Change backend into multiple files [**@jikstra**](https://github.com/jikstra) [#787](https://github.com/deltachat/deltachat-desktop/issues/787)
- Update deltachat-node to 0.44.1 [**@jikstra**](https://github.com/jikstra) [#796](https://github.com/deltachat/deltachat-desktop/issues/796)

### Fixed

- Import/Export keys [**@nicodh**](https://github.com/nicodh) [**@karissa**](https://github.com/karissa) [#251](https://github.com/deltachat/deltachat-desktop/issues/251) [#707](https://github.com/deltachat/deltachat-desktop/issues/707)
- Updated emoji-mart [**@Simon-Laux**](https://github.com/Simon-Laux)
- Make sure images don't overflow in ChatView [**@Jikstra**](https://github.com/Jikstra) [#734](https://github.com/deltachat/deltachat-desktop/issues/734)
- Fix crash on contact requests [**@Simon-Laux**](https://github.com/Simon-Laux) [#755](https://github.com/deltachat/deltachat-desktop/issues/755) [#776](https://github.com/deltachat/deltachat-desktop/issues/776)
- Fix broken render when archiving/deleting chats [**@ralphtheninja**](https://github.com/ralphtheninja) [#762](https://github.com/deltachat/deltachat-desktop/issues/762)
- Prevent select all [**@Simon-Laux**](https://github.com/Simon-Laux) [#774](https://github.com/deltachat/deltachat-desktop/issues/774)
- Remember map settings [**@nicodh**](https://github.com/nicodh) [#777](https://github.com/deltachat/deltachat-desktop/issues/777)
- Update readme for new dc-node [**@flub**](https://github.com/flub) [#779](https://github.com/deltachat/deltachat-desktop/issues/779)
- Improve chatlist performance [**@karissa**](https://github.com/karissa) [#782](https://github.com/deltachat/deltachat-desktop/issues/782)
- Change emoji picker behaviour [**@Simon-Laux**](https://github.com/Simon-Laux) [#795](https://github.com/deltachat/deltachat-desktop/issues/795)
- Fix delete account [**@jikstra**](https://github.com/jikstra) [#799](https://github.com/deltachat/deltachat-desktop/issues/799)
- Reapply lost changes [**@nicodh**](https://github.com/nicodh) [#800](https://github.com/deltachat/deltachat-desktop/issues/800)

## [0.102.0] - 2019-03-12

### Added

- Send file by drag&drop to ChatView [**@Simon-Laux**](https://github.com/Simon-Laux)
- Add native badge count for osx and linux [#696](https://github.com/deltachat/deltachat-desktop/issues/696) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Add setting for changing newline/message sending with enter/shift-enter/ctr-enter [#662](https://github.com/deltachat/deltachat-desktop/issues/662) [**@Simon-Laux**](https://github.com/Simon-Laux) [**@Jikstra**](https://github.com/Jikstra)

### Changed

- Open context menu on right click [**@nicodh**](https://github.com/nicodh)
- Change background color for success feedback [#703](https://github.com/deltachat/deltachat-desktop/issues/703) [**@nicodh**](https://github.com/nicodh)
- Make elements on Settings screen unselectable [#705](https://github.com/deltachat/deltachat-desktop/issues/705) [**@nicodh**](https://github.com/nicodh)
- Improved ui/ux of fullscreen images/videos [#710](https://github.com/deltachat/deltachat-desktop/issues/710) [**@nicodh**](https://github.com/nicodh) [**@jikstra**](https://github.com/jikstra)

### Fixed

- Log file catch when deltachat-node dependency is missing [#693](https://github.com/deltachat/deltachat-desktop/issues/693) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix updating login credentials in settings [#695](https://github.com/deltachat/deltachat-desktop/issues/695) [**@nicodh**](https://github.com/nicodh)
- Fix multinline composer performance [#704](https://github.com/deltachat/deltachat-desktop/issues/704) [**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix showing media buttons [#717](https://github.com/deltachat/deltachat-desktop/issues/717) [**@Jikstra**](https://github.com/Jikstra)

### Removed

- Remove devtron so we can remove highlight.js [**@ralphtheninja**](https://github.com/ralphtheninja)

## [0.101.0] - 2019-02-27

### Changed

- Sort languages alphabetically ([#640](https://github.com/deltachat/deltachat-desktop/issues/640)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Set this.chatView.current from the start ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix some typos and tweak logging docs ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update github issue template ([#647](https://github.com/deltachat/deltachat-desktop/issues/647)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Cleanup ipc ([#641](https://github.com/deltachat/deltachat-desktop/issues/641)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Hide error message when attempting to login ([#644](https://github.com/deltachat/deltachat-desktop/issues/644)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add more detailed info about deltachat-core to About sreen ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Improve hanlde position for context menu of messages ([#666](https://github.com/deltachat/deltachat-desktop/issues/666)) ([**@nicodh**](https://github.com/nicodh))
- Use vertical ellipsis for context handle ([#671](https://github.com/deltachat/deltachat-desktop/issues/671)) ([**@nicodh**](https://github.com/nicodh))
- Update deltachat-node dependency to v0.40.2 ([#678](https://github.com/deltachat/deltachat-desktop/issues/678)) ([**@ralphtheninja**](https://github.com/ralphtheninja)) ([**@jikstra**](https://github.com/jikstra))

### Added

- Add logging documentation ([#628](https://github.com/deltachat/deltachat-desktop/issues/628)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Add line break between advanced button and login button ([#635](https://github.com/deltachat/deltachat-desktop/issues/635)) ([**@Jikstra**](https://github.com/Jikstra))
- Prevent running multiple instances ([#649](https://github.com/deltachat/deltachat-desktop/issues/649)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Resize the composer based on the newlines in the text (multiline composer) ([#654](https://github.com/deltachat/deltachat-desktop/issues/654)) ([**@jikstra**](https://github.com/jikstra))
- Added MAC install information to README ([#660](https://github.com/deltachat/deltachat-desktop/issues/660)) ([**@zafai**](https://github.com/zafai))

### Removed

- Remove misleading/Uninformative lefticons in login form ([#637](https://github.com/deltachat/deltachat-desktop/issues/637)) ([**@Jikstra**](https://github.com/Jikstra))
- Remove style specific components ([#645](https://github.com/deltachat/deltachat-desktop/issues/645)) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Show leading digits in Autocrypt Setup ([#651](https://github.com/deltachat/deltachat-desktop/issues/651)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Change `chown` to `chmod` in README.md ([#655](https://github.com/deltachat/deltachat-desktop/issues/655)) /([**@naltun**](https://github.com/naltun))
- Remove/Hide scrollbar in groupname & and fix emoji in avatar ([#661](https://github.com/deltachat/deltachat-desktop/issues/661)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Do not send empty messages (i.e. only spaces) ([#670](https://github.com/deltachat/deltachat-desktop/issues/670)) ([**@nicodh**](https://github.com/nicodh))
- Fix layout breaking when pasting long multiline messages to composer
- Focus the composer position on the current selection/cursor ([#677](https://github.com/deltachat/deltachat-desktop/issues/677)) ([**@jikstra**](https://github.com/jikstra))

## [0.100.0] - 2019-01-27

### Changed

- Simplify logging ([#602](https://github.com/deltachat/deltachat-desktop/issues/602)) ([@ralphtheninja](https://github.com/ralphtheninja))
- change language dropdown to use the local names ([@Simon-Laux](https://github.com/Simon-Laux))
- Pass in logHandler to menu.init() from ipc ([@ralphtheninja](https://github.com/ralphtheninja))
- Be explicit when ignoring \_\*.json, \_languages.json should be ignored ([@ralphtheninja](https://github.com/ralphtheninja))
- Selected chat now uses the delta (light) color ([@jikstra](https://github.com/jikstra))
- Update translations ([@ralphtheninja](https://github.com/ralphtheninja))

### Added

- Implement login instruction ([#607](https://github.com/deltachat/deltachat-desktop/issues/607)) ([@jikstra](https://github.com/jikstra))
- Add emoji picker ([#615](https://github.com/deltachat/deltachat-desktop/issues/615)) ([@jikstra](https://github.com/jikstra))

### Fixed

- Fix message duplication ([#613](https://github.com/deltachat/deltachat-desktop/issues/613)) ([@Simon-Laux](https://github.com/Simon-Laux))
- Appdata updates and cleanup ([@har9862](https://github.com/har9862))
- For some reasons emoji-mart doesn't pull in a required dependency, we need to require it manually ([@jikstra](https://github.com/jikstra))

## [0.99.0] - 2019-01-20

### Changed

- Update copyright year in readme ([@jikstra](https://github.com/jikstra))
- Use path.join() for getLogsPath() ([@ralphtheninja](https://github.com/ralphtheninja))
- Upgrade bindings ([#595](https://github.com/deltachat/deltachat-desktop/issues/595)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Wrap application-config module for proper appConfig during production and testing ([#598](https://github.com/deltachat/deltachat-desktop/issues/598)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Use electron v4 ([#581](https://github.com/deltachat/deltachat-desktop/issues/581)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Misc cleanup ([#588](https://github.com/deltachat/deltachat-desktop/issues/588)) ([@ralphtheninja](https://github.com/ralphtheninja))
- State refactor ([#583](https://github.com/deltachat/deltachat-desktop/issues/583)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Update translations ([@ralphtheninja](https://github.com/ralphtheninja))
- Rename Home component to ScreenController ([@ralphtheninja](https://github.com/ralphtheninja))

### Added

- Login automatically if last credentials were saved in state ([#589](https://github.com/deltachat/deltachat-desktop/issues/589)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Add devtron ([@ralphtheninja](https://github.com/ralphtheninja))

### Removed

- Remove password and account settings label ([#538](https://github.com/deltachat/deltachat-desktop/issues/538)) ([@ralphtheninja](https://github.com/ralphtheninja))
- Remove window.state, not used ([@ralphtheninja](https://github.com/ralphtheninja))

### Fixed

- Do not send uncaughtError to render process, just log and die ([#593](https://github.com/deltachat/deltachat-desktop/issues/593)) ([@ralphtheninja](https://github.com/ralphtheninja))

## [0.98.2] - 2019-01-11

### Changed

- Tweak search button ([#568](https://github.com/deltachat/deltachat-desktop/issues/568)) ([**@jikstra**](https://github.com/jikstra))
- Convert `src/config.js` to `src/applications-constants.js` with a functional API ([#578](https://github.com/deltachat/deltachat-desktop/issues/578)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Improve css building for conversations stylesheets ([#573](https://github.com/deltachat/deltachat-desktop/issues/573)) ([**@jikstra**](https://github.com/jikstra))
- Update install instructions in README ([**@jikstra**](https://github.com/jikstra), [**@ralphtheninja**](https://github.com/ralphtheninja))
- Restyle create chat buttons ([#563](https://github.com/deltachat/deltachat-desktop/issues/563)) ([**@jikstra**](https://github.com/jikstra))
- Update outdated watch script ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Hide known accounts section when it's empty ([#567](https://github.com/deltachat/deltachat-desktop/issues/567)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Set minimum window height to 450px ([**@jikstra**](https://github.com/jikstra))
- Upgrade `deltachat-node` to `^0.36.0` for Mac OS prebuilt binaries ([#570](https://github.com/deltachat/deltachat-desktop/issues/570)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make unit tests less spammy ([#554](https://github.com/deltachat/deltachat-desktop/issues/554)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Simplify state load ([#540](https://github.com/deltachat/deltachat-desktop/issues/540)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make converting translations less spammy ([#547](https://github.com/deltachat/deltachat-desktop/issues/547)) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `rc` module for configuration ([#574](https://github.com/deltachat/deltachat-desktop/issues/574)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add logging functionality ([#497](https://github.com/deltachat/deltachat-desktop/issues/497)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Add `hallmark` module for markdown linting ([#548](https://github.com/deltachat/deltachat-desktop/issues/548)) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `bin/clean.js` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Clean up unused configuration code ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix non verified contacts in verified groups ([#580](https://github.com/deltachat/deltachat-desktop/issues/580)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix escaped characters in translations ([#569](https://github.com/deltachat/deltachat-desktop/issues/569)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Adjust login form so it's not hidden below navigation bar ([#564](https://github.com/deltachat/deltachat-desktop/issues/564)) ([**@jikstra**](https://github.com/jikstra))
- Fix broken `rimraf` dependency ([**@jikstra**](https://github.com/jikstra))

## [0.98.1] - 2019-01-06

### Changed

- Use google noto emojis and remove image emojis ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Tweak functionality in edit group page ([**@Simon-Laux**](https://github.com/Simon-Laux))

## [0.98.0] - 2019-01-05

### Changed

- Use language fallback for missing language variants ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translations now based on xml and shared with other Delta Chat projects ([**@karissa**](https://github.com/karissa), [**@jikstra**](https://github.com/jikstra), [**@ralphtheninja**](https://github.com/ralphtheninja))
- Made more elements unselectable ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Improve build/run instructions ([**@obestwalter**](https://github.com/obestwalter))
- Upgrade `deltachat-node` to `^0.35.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add settings for configuring `mvbox` and `sentbox` threads ([**@jikstra**](https://github.com/jikstra))
- Add divider between chat list and chat view ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Write output of `dc.getInfo()` to console ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove all `.ts`/`.tsx` based code ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Message input field keeps focus ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Fix issue with Autocrypt setup dialog not closing ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add back menu item for unblocking contacts ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix group image issue ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Only run `dc.getConfig()` on valid account folders ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Handle `DC_EVENT_SELF_NOT_IN_GROUP` error ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix icon rotation ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Fix issues related to media height ([**@Simon-Laux**](https://github.com/Simon-Laux))

## [0.97.0] - 2018-12-24

### Changed

- Upgrade `deltachat-node` to `0.30.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.96.0] - 2018-12-11

### Added

- Improve experience for inputting Autocrypt setup codes ([**@karissa**](https://github.com/karissa))
- Media view for chats ([**@karissa**](https://github.com/karissa))
- See encryption info for contacts in a chat ([**@karissa**](https://github.com/karissa))
- List contact requests ([**@karissa**](https://github.com/karissa))
- File->Quit in the menu to quit the application ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Drag a file out of the chat window to the filesystem to copy it locally ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Settings option for sending read receipts ([**@karissa**](https://github.com/karissa))
- Settings option for preferring encryption ([**@karissa**](https://github.com/karissa))
- Forget account button in the Login screen ([**@karissa**](https://github.com/karissa))
- Update account settings while logged in ([**@karissa**](https://github.com/karissa))

### Fixed

- Make button hover state a pointer cursor ([**@karissa**](https://github.com/karissa))
- Read and delivered checkmarks are now green ([**@Jikstra**](https://github.com/Jikstra) )
- Display filename and size for downloadable files in messages ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Richer file messages, including displaying webm videos ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Ask user before leaving group ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Mark messages read properly ([**@karissa**](https://github.com/karissa))
- Small bug with exporting backups ([**@Jikstra**](https://github.com/Jikstra))

### Changed

- Upgrade `deltachat-node` to `0.29.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove single-folder compatibility message ([**@karissa**](https://github.com/karissa))
- Update to electron `3.0` ([**@karissa**](https://github.com/karissa))

## [0.90.1] - 2018-12-11

### Changed

- Upgrade `deltachat-node` dependency to `^0.28.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Deploy on Mac for Travis ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Disable reply button ([#400](https://github.com/deltachat/deltachat-desktop/issues/400)) ([**@jikstra**](https://github.com/jikstra))

### Added

- Add colored avatars ([**@jikstra**](https://github.com/jikstra))
- Add notifications ([#246](https://github.com/deltachat/deltachat-desktop/issues/246)) ([**@karissa**](https://github.com/karissa))
- Add import/export backup in settings dialog ([#267](https://github.com/deltachat/deltachat-desktop/issues/267)) ([**@karissa**](https://github.com/karissa))
- Add multiline composer ([#394](https://github.com/deltachat/deltachat-desktop/issues/394)) ([**@jikstra**](https://github.com/jikstra))

### Fixed

- Add `imageFailedToLoad` translation ([#385](https://github.com/deltachat/deltachat-desktop/issues/385)) ([**@karissa**](https://github.com/karissa))
- Fix accidentally skipped message ([#378](https://github.com/deltachat/deltachat-desktop/issues/378)) ([**@jikstra**](https://github.com/jikstra))

**Historical Note** We decided to change the versionining scheme to be more in line with the android app.

**Historical Note 2** We removed the older changelog, you can look at the git history to get it. (version numbers made hallmark crazy)


[unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v2.33.0...HEAD
[2.33.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.25.3...v2.33.0
[2.25.3]: https://github.com/deltachat/deltachat-desktop/compare/v2.25.2...v2.25.3
[2.25.2]: https://github.com/deltachat/deltachat-desktop/compare/v2.25.1...v2.25.2
[2.25.1]: https://github.com/deltachat/deltachat-desktop/compare/2.25.0...v2.25.1
[2.25.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.22.0...v2.25.0

[2.22.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.20.0...v2.22.0

[2.20.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.15.0...v2.20.0

[2.15.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.11.1...v2.15.0

[2.11.1]: https://github.com/deltachat/deltachat-desktop/compare/v2.11.0...v2.11.1

[2.11.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.10.0...v2.11.0

[2.10.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.9.0...v2.10.0

[2.9.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.8.0...v2.9.0

[2.8.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.7.0...v2.8.0

[2.7.0]: https://github.com/deltachat/deltachat-desktop/compare/v2.6.0...v2.7.0

[2.6.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.60.1...v2.6.0

[1.60.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.60.0...v1.60.1

[1.60.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.59.2...v1.60.0

[1.59.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.59.1...v1.59.2

[1.59.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.59.0...v1.59.1

[1.59.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.58.2...v1.59.0

[1.58.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.58.1...v1.58.2

[1.58.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.58.0...v1.58.1

[1.58.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.57.1...v1.58.0

[1.57.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.57.0...v1.57.1

[1.57.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.56.0...v1.57.0

[1.56.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.54.2...v1.56.0

[1.54.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.54.1...v1.54.2

[1.54.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.54.0...v1.54.1

[1.54.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.53.0...v1.54.0

[1.53.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.52.1...v1.53.0

[1.52.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.52.0...v1.52.1

[1.52.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.51.0...v1.52.0

[1.51.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.50.1...v1.51.0

[1.50.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.50.0...v1.50.1

[1.50.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.49.0...v1.50.0

[1.49.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.48.0...v1.49.0

[1.48.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.47.1...v1.48.0

[1.47.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.47.0...v1.47.1

[1.47.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.8...v1.47.0

[1.46.8]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.7...v1.46.8

[1.46.7]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.6...v1.46.7

[1.46.6]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.5...v1.46.6

[1.46.5]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.4...v1.46.5

[1.46.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.3...v1.46.4

[1.46.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.2...v1.46.3

[1.46.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.1...v1.46.2

[1.46.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.46.0...v1.46.1

[1.46.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.5...v1.46.0

[1.45.5]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.4...v1.45.5

[1.45.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.3...v1.45.4

[1.45.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.2...v1.45.3

[1.45.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.1...v1.45.2

[1.45.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.45.0...v1.45.1

[1.45.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.44.1...v1.45.0

[1.44.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.44.0...v1.44.1

[1.44.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.43.1...v1.44.0

[1.43.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.43.0...v1.43.1

[1.43.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.42.2...v1.43.0

[1.42.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.42.1...v1.42.2

[1.42.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.42.0...v1.42.1

[1.42.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.41.3...v1.42.0

[1.41.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.41.2...v1.41.3

[1.41.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.41.1...v1.41.2

[1.41.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.41.0...v1.41.1

[1.41.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.40.4...v1.41.0

[1.40.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.40.3...v1.40.4

[1.40.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.40.2-fixed-tag...v1.40.3

[1.40.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.40.1...v1.40.2-fixed-tag

[1.40.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.40.0...v1.40.1

[1.40.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.39.0...v1.40.0

[1.39.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.38.1...v1.39.0

[1.38.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.38.0...v1.38.1

[1.38.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.37.1...v1.38.0

[1.37.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.37.0...v1.37.1

[1.37.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.36.4...v1.37.0

[1.36.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.36.3...v1.36.4

[1.36.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.36.2...v1.36.3

[1.36.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.36.1...v1.36.2

[1.36.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.36.0...v1.36.1

[1.36.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.5...v1.36.0

[1.34.5]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.4...v1.34.5

[1.34.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.3...v1.34.4

[1.34.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.2...v1.34.3

[1.34.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.1...v1.34.2

[1.34.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.34.0...v1.34.1

[1.34.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.33.2...v1.34.0

[1.33.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.33.1...v1.33.2

[1.33.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.33.0...v1.33.1

[1.33.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.32.1...v1.33.0

[1.32.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.32.0...v1.32.1

[1.32.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.31.0...v1.32.0

[1.31.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.30.1...v1.31.0

[1.30.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.30.0...v1.30.1

[1.30.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.29.1...v1.30.0

[1.29.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.29.0...v1.29.1

[1.29.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.28.2...v1.29.0

[1.28.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.28.1...v1.28.2

[1.28.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.28.0...v1.28.1

[1.28.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.27.2...v1.28.0

[1.27.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.27.1...v1.27.2

[1.27.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.27.0...v1.27.1

[1.27.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.26.0...v1.27.0

[1.26.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.25.2...v1.26.0

[1.25.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.25.1...v1.25.2

[1.25.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.25.0...v1.25.1

[1.25.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.22.2...v1.25.0

[1.22.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.22.1...v1.22.2

[1.22.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.22.0...v1.22.1

[1.22.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.21.1...v1.22.0

[1.21.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.21.0...v1.21.1

[1.21.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.20.2...v1.21.0

[1.20.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.20.1...v1.20.2

[1.20.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.20.0...v1.20.1

[1.20.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.5...v1.20.0

[1.15.5]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.4...v1.15.5

[1.15.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.3...v1.15.4

[1.15.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.2...v1.15.3

[1.15.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.1...v1.15.2

[1.15.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.0...v1.15.1

[1.15.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.14.1...v1.15.0

[1.14.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.14.0...v1.14.1

[1.14.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.13.1...v1.14.0

[1.13.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.13.0...v1.13.1

[1.13.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.13.0-rc4...v1.13.0

[1.13.0-rc4]: https://github.com/deltachat/deltachat-desktop/compare/v1.13.0-rc1...v1.13.0-rc4

[1.13.0-rc1]: https://github.com/deltachat/deltachat-desktop/compare/v1.12.0...v1.13.0-rc1

[1.12.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.10.4...v1.12.0

[1.10.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.10.3...v1.10.4

[1.10.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.10.2...v1.10.3

[1.10.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.10.1...v1.10.2

[1.10.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.10.0...v1.10.1

[1.10.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.4.3...v1.10.0

[1.4.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.4.2...v1.4.3

[1.4.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.4...v1.4.2

[1.3.4]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.3...v1.3.4

[1.3.3]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.2...v1.3.3

[1.3.2]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.1...v1.3.2

[1.3.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.0...v1.3.1

[1.3.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.2.0...v1.3.0

[1.2.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.1.1...v1.2.0

[1.1.1]: https://github.com/deltachat/deltachat-desktop/compare/v1.1.0...v1.1.1

[1.1.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.0.0...v1.1.0

[1.0.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.999.1...v1.0.0

[0.999.1]: https://github.com/deltachat/deltachat-desktop/compare/v0.999.0...v0.999.1

[0.999.0]: https://github.com/deltachat/deltachat-desktop/compare/0.901.0...v0.999.0

[0.901.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.900.0...0.901.0

[0.900.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.840.0...v0.900.0

[0.840.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.201.0...v0.840.0

[0.201.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.200.0...v0.201.0

[0.200.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.104.0...v0.200.0

[0.104.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.103.0...v0.104.0

[0.103.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.102.0...v0.103.0

[0.102.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.101.0...v0.102.0

[0.101.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.100.0...v0.101.0

[0.100.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.99.0...v0.100.0

[0.99.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.2...v0.99.0

[0.98.2]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.1...v0.98.2

[0.98.1]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.0...v0.98.1

[0.98.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.97.0...v0.98.0

[0.97.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.96.0...v0.97.0

[0.96.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.90.1...v0.96.0

[0.90.1]: https://github.com/deltachat/deltachat-desktop/compare/5a94d4e...v0.90.1
