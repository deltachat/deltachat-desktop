# Changelog

## [Unreleased][unreleased]

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

[unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v0.100.0...HEAD

[0.100.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.99.0...v0.100.0

[0.99.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.2...v0.99.0

[0.98.2]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.1...v0.98.2

[0.98.1]: https://github.com/deltachat/deltachat-desktop/compare/v0.98.0...v0.98.1

[0.98.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.97.0...v0.98.0

[0.97.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.96.0...v0.97.0

[0.96.0]: https://github.com/deltachat/deltachat-desktop/compare/v0.90.1...v0.96.0

[0.90.1]: https://github.com/deltachat/deltachat-desktop/compare/5a94d4e...v0.90.1
