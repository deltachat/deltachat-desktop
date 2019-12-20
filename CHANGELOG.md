# Changelog

## [Unreleased][unreleased]

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
- Fix some typos and tweak logging docs  ([**@ralphtheninja**](https://github.com/ralphtheninja))
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

## 2.1.0 - 2018-12-06

### Changed

- Update translations ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make buttons unselectable ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Redesign of chat list and chat view ([**@jikstra**](https://github.com/jikstra))
- Upgrade `deltachat-node` dependency to `^0.27.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Cleanup composer css and move focus message to composer ([**@karissa**](https://github.com/karissa))
- Display info text differentely than regular messages ([**@karissa**](https://github.com/karissa))
- Use `version-unchanged` to shortcut `electron-builder` on master branch for faster builds ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Wrap integration tests with `xvfb-run` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Refactor state render ([**@jikstra**](https://github.com/jikstra))
- Update `AUTHORS.md` ([**@jikstra**](https://github.com/jikstra), [**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `Unselectable` helper component ([**@Simon-Laux**](https://github.com/Simon-Laux))

### Removed

- Remove `DC_STR_NONETWORK` ([#300](https://github.com/deltachat/deltachat-desktop/issues/300)) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix broken default group image ([#382](https://github.com/deltachat/deltachat-desktop/issues/382)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix deaddrop background ([#247](https://github.com/deltachat/deltachat-desktop/issues/247)) ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Upgrade `linkify-it` dependency to `^2.1.0` ([#325](https://github.com/deltachat/deltachat-desktop/issues/325)) ([**@jikstra**](https://github.com/jikstra))
- Properly set `viewType` when sending an attachment image ([**@karissa**](https://github.com/karissa))
- Error code was removed from `DC_EVENT_ERROR` event ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Don't fetch more messages if all the messages have already been fetched ([#353](https://github.com/deltachat/deltachat-desktop/issues/353)) ([**@karissa**](https://github.com/karissa))
- Render all available messages in a page ([#354](https://github.com/deltachat/deltachat-desktop/issues/354)) ([**@karissa**](https://github.com/karissa))
- Fix broken integration tests ([#357](https://github.com/deltachat/deltachat-desktop/issues/357)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix deaddrop accept ([#332](https://github.com/deltachat/deltachat-desktop/issues/332)) ([**@jikstra**](https://github.com/jikstra))
- Turn contact into json before passing to frontend ([#360](https://github.com/deltachat/deltachat-desktop/issues/360))

## 2.0.0 - 2018-11-23

### Changed

- Simplify and refactor dialogs ([**@karissa**](https://github.com/karissa))
- Refactor hamburger menu code ([**@karissa**](https://github.com/karissa))
- Use `webpack` instead of `buble` ([**@karissa**](https://github.com/karissa))
- Stop deploying from Travis (old Ubuntu caused problems with Debian and libssl) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Options passed to node bindings should be in camelCase ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-node` dependency from `^0.23.0` to `^0.24.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Introduce `styled-components` ([**@jikstra**](https://github.com/jikstra))
- Add single folder banner ([**@jikstra**](https://github.com/jikstra))
- Add `Content-Security-Policy` ([**@karissa**](https://github.com/karissa))
- Add verified icon for verified users ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `jenkins/Jenkinsfile.linux` for building and deploying on [Jenkins](https://ci.delta.chat) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix chat view scroll jumping ([**@jikstra**](https://github.com/jikstra))
- Fix links containing a double dash `--` ([**@jikstra**](https://github.com/jikstra))
- Clicking links opens up window in external browser ([**@karissa**](https://github.com/karissa))
- `libetpan-dev` can be installed globally without messing up compilation ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** This release contains an update to `deltachat-core` which contains the single folder implementation. See the [upgrade guide](UPGRADING.md) for more details.

## 1.7.5 - 2018-11-17

### Changed

- Load messages on demand using a paging model ([**@karissa**](https://github.com/karissa))
- Improve troubleshooting section in README ([**@ralphtheninja**](https://github.com/ralphtheninja))
- CSS tweaks to chat view ([**@karissa**](https://github.com/karissa))
- Mark messages as seen when fetched ([**@karissa**](https://github.com/karissa))
- Tweak group image and chat name margin ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add verified groups with QR codes for group invite and user verification ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add group image to chat list ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `appstream` data ([**@muelli**](https://github.com/muelli))
- Send messages with a file attachment ([**@karissa**](https://github.com/karissa))
- Add message details dialog ([**@karissa**](https://github.com/karissa))
- Allow user to save a file attachment to disk ([**@karissa**](https://github.com/karissa))

### Fixed

- Back button should go back to create chat screen from both create group and add contact ([**@karissa**](https://github.com/karissa))
- Back button for edit group should go back to split view ([**@alfaslash**](https://github.com/alfaslash))
- Add unique 'key' for messages in order to remove React warning ([**@karissa**](https://github.com/karissa))
- Prevent the scrollbar from jiggling when new message arrives ([**@karissa**](https://github.com/karissa))
- Only try setting group image if it's different ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Reference correct target when sending a message ([**@karissa**](https://github.com/karissa))

## 1.7.4 - 2018-11-07

### Changed

- Upgrade `@sindresorhus/is` to `^0.13.0` ([**@greenkeeper**](https://github.com/greenkeeper))
- Update UI for Autocrypt key exchange ([**@jikstra**](https://github.com/jikstra))
- Main window and about dialog should show same version ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Tweak language resources for `New chat`, `New group` and `Add contact` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add search box for chat list ([**@karissa**](https://github.com/karissa))
- Add group image ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix rendering of video messages ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add back currently logged in user to main window title ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make links clickable in About dialog ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Ensure `CONFIG_PATH` exists at startup ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Tweak Autocrypt Setup Message ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Pass configuration settings to core in `snake_key` format ([**@ralphtheninja**](https://github.com/ralphtheninja))

## 1.7.3 - 2018-11-02

### Added

- Add about dialog ([**@jikstra**](https://github.com/jikstra), [**@ralphtheninja**](https://github.com/ralphtheninja))
- Add confirmation dialog when deleting chat ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Hide password by default and add button to show it ([**@jikstra**](https://github.com/jikstra))

### Fixed

- Translate buttons in confirmation dialog ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Install `libssl-dev` on Travis ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Contact requests properly resolve when request is from a group chat ([**@karissa**](https://github.com/karissa))
- Add key for chatlist to remove console warning ([**@karissa**](https://github.com/karissa))

## 1.7.2 - 2018-10-31

### Changed

- Update translations from transifex ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make conversations build only when necessary to improve build time ([**@karissa**](https://github.com/karissa))
- Move `Preferences` menu ([**@karissa**](https://github.com/karissa))
- Consolidate `'New Chat'` menu ([**@karissa**](https://github.com/karissa))
- Upgrade `deltachat-node` to `^0.23.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translate strings coming from `deltachat-core` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add watch script for development ([**@karissa**](https://github.com/karissa))
- Implement advanced login settings ([**@jikstra**](https://github.com/jikstra))
- Add functionality for blocking/unblocking contacts ([**@karissa**](https://github.com/karissa))

### Removed

- Remove `nodemon` devDependency ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Don't select recent chat by default ([**@karissa**](https://github.com/karissa))

## 1.7.1 - 2018-10-29

### Fixed

- Downgrade to electron 2 (fixes window bug on Debian) ([**@substack**](https://github.com/substack))

## 1.7.0 - 2018-10-25

### Changed

- Update translations from transifex ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-node` to `^0.22.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Disable `eval()` in render process ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Disable navigation ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Disable opening new windows for now ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update output of logged events ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Don't call `render()` when dispatching calls from render process to main process ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Move `Logout` button to hamburger menu ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Move state handling selected chat and archived chats to main process ([**@jikstra**](https://github.com/jikstra))
- Move logged in account email to window title ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Replace `(BETA)` with `(preview-$VERSION)` in window title ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Replace all `Delta.Chat` resources with `DeltaChat` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add fresh message counter in `ChatList` ([**@jikstra**](https://github.com/jikstra))
- Log when `render()` is called ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add archived chats button in `ChatList` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add menu alternative for un-archiving chats ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `Go Back` menu item ([#158](https://github.com/deltachat/deltachat-desktop/issues/158)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `window.main.dispatch()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix `'stateSaveImmediate'` event issue during quit ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Propagate `'uncaughtError'` event to render process and log it ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Let unknown translations fall back to resource key ([**@ralphtheninja**](https://github.com/ralphtheninja))

## 1.6.0 - 2018-10-23

### Changed

- Update translations from transifex ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translate message input field and send button ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translate Autocrypt key transfer dialogs ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Move avatar out of message and display it next to the message ([**@jikstra**](https://github.com/jikstra))
- Upgrade `electron` devDependency to `^3.0.5` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `spectron` devDependency to `^5.0.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `Paste` menu item, fixes [#161](https://github.com/deltachat/deltachat-desktop/issues/161) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `babel-eslint` devDependency ([**@ralphtheninja**](https://github.com/ralphtheninja))

## 1.5.0 - 2018-10-20

### Changed

- Consolidate chat list and chat view ([**@jikstra**](https://github.com/jikstra))
- Upgrade `deltachat-node` to `^0.21.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update translations from transifex ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add functionality to edit groups, e.g. group name, adding and removing members ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add functionality to leave group ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Use default sort order from core in chat list ([**@ralphtheninja**](https://github.com/ralphtheninja))
- If creating a chat that is already archived, unarchive it ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Fix issues with author name in group chats ([**@ralphtheninja**](https://github.com/ralphtheninja))

## 1.4.0 - 2018-10-16

### Changed

- Pull in `conversations` module ([**@jikstra**](https://github.com/jikstra))
- Change window title ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Show full language names (and translate them) instead of abbreviations ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-node` to `^0.20.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update logins in login page on successful configure ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translate all strings on login and create chat/group pages ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Translate all menu items ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Enable going to `Create Group` page from chat list page ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Implement delete message ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add screenshot to README ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add descriptions to language resources ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `Archive Chat` menu item ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `Delete Chat` menu item ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `+ Group` button from `Create Chat` page (moved to chat list, see above) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Do not scroll to bottom when opening message context menu ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make sure `Float on Top` menu item stays checked/unchecked when language is changed ([**@ralphtheninja**](https://github.com/ralphtheninja))

[unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v0.201.0...HEAD

[0.201.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.104.0...v0.201.0

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
