# Changelog

## [Unreleased][unreleased]

## Changed
- use new `decideOnContactRequest` api

### Added
- add option to open message html in browser
- encryption info for groups
- Add status text to profile view
- allow sending of ".webp" stickers
- allow starting a viedochat in groups
- add local help for zh_CN and fr
- add missing Czech translation #2218

## Fixed
- Fix soure-mapped stacktrace on crashscreen in bundled production builds
- Don't delete Contactrequest messages, that are blocked - answered with never. #2225
- hide show encryption info for saved messages (resulted in error)
- Make text of elments like timestamps, chat list summaries etc. non selectable
- remove "file://" scheme from filenames before calling `dc_msg_set_file` for stickers
- initialize name field in contact profile dialog with previouly manually set name and use authname as a placeholder
- show context menu also for videochat messages

### Changed

- update translations (02.05.2021)
- Update deltachat-node to `v1.54.0`

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
- Fix incomming image metadata unreadable [#1135](https://github.com/deltachat/deltachat-desktop/pull/1135)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix freeze when clicking on POI and a few other map bugs [#1127](https://github.com/deltachat/deltachat-desktop/issues/1127)[**@nicodh**](https://github.com/nicodh)
- Fix background color selector disappearing [a6f837f](https://github.com/deltachat/deltachat-desktop/commit/a6f837ffb895790112409ee64349c67fb687c794)[**@Simon-Laux**](https://github.com/Simon-Laux)
- Fix groupname in show group qr code [#1154](https://github.com/deltachat/deltachat-desktop/pull/1154)[**@link2xt**](https://github.com/link2xt)
- Fix New group chat isn't selected [#1155](https://github.com/deltachat/deltachat-desktop/issues/1155)[**@nicodh**](https://github.com/nicodh)
- Fix Show encryption info crashes [#1166](https://github.com/deltachat/deltachat-desktop/issues/1166)[**@Jikstra**](https://github.com/Jikstra)
- Messages appear in wrong chat (on scrolling up) [#1158](https://github.com/deltachat/deltachat-desktop/issues/1158)[**@Jikstra**](https://github.com/Jikstra)
- Chat scrolls not to completely to bottom if pictures are present [#477](https://github.com/deltachat/deltachat-desktop/issues/477)[**@Jikstra**](https://github.com/Jikstra)
- Chat updates (such as delete or new incomming message) result in jumping to the end [#712](https://github.com/deltachat/deltachat-desktop/issues/712)[**@Jikstra**](https://github.com/Jikstra)
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

[unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v1.15.5...HEAD

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
