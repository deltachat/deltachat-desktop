# Changelog

## [Unreleased]

## [1.7.0] - 2018-10-25

### Changed
* Update translations from transifex (@ralphtheninja)
* Upgrade `deltachat-node` to `^0.22.0` (@ralphtheninja)
* Disable `eval()` in render process (@ralphtheninja)
* Disable navigation (@ralphtheninja)
* Disable opening new windows for now (@ralphtheninja)
* Update output of logged events (@ralphtheninja)
* Don't call `render()` when dispatching calls from render process to main process (@ralphtheninja)
* Move `Logout` button to hamburger menu (@ralphtheninja)
* Move state handling selected chat and archived chats to main process (@jikstra)
* Move logged in account email to window title (@ralphtheninja)
* Replace `(BETA)` with `(preview-$VERSION)` in window title (@ralphtheninja)
* Replace all `Delta.Chat` resources with `DeltaChat` (@ralphtheninja)

### Added
* Add fresh message counter in `ChatList` (@jikstra)
* Log when `render()` is called (@ralphtheninja)
* Add archived chats button in `ChatList` (@ralphtheninja)
* Add menu alternative for un-archiving chats (@ralphtheninja)

### Removed
* Remove `Go Back` menu item (#158) (@ralphtheninja)
* Remove `window.main.dispatch()` (@ralphtheninja)

### Fixed
* Fix `'stateSaveImmediate'` event issue during quit (@ralphtheninja)
* Propagate `'uncaughtError'` event to render process and log it (@ralphtheninja)
* Let unknown translations fall back to resource key (@ralphtheninja)

## [1.6.0] - 2018-10-23

### Changed
* Update translations from transifex (@ralphtheninja)
* Translate message input field and send button (@ralphtheninja)
* Translate Autocrypt key transfer dialogs (@ralphtheninja)
* Move avatar out of message and display it next to the message (@jikstra)
* Upgrade `electron` devDependency to `^3.0.5` (@ralphtheninja)
* Upgrade `spectron` devDependency to `^5.0.0` (@ralphtheninja)

### Added
* Add `Paste` menu item, fixes #161 (@ralphtheninja)

### Removed
* Remove `babel-eslint` devDependency (@ralphtheninja)

## [1.5.0] - 2018-10-20

### Changed
* Consolidate chat list and chat view (@jikstra)
* Upgrade `deltachat-node` to `^0.21.0` (@ralphtheninja)
* Update translations from transifex (@ralphtheninja)

### Added
* Add functionality to edit groups, e.g. group name, adding and removing members (@ralphtheninja)
* Add functionality to leave group (@ralphtheninja)

### Fixed
* Use default sort order from core in chat list (@ralphtheninja)
* If creating a chat that is already archived, unarchive it (@ralphtheninja)
* Fix issues with author name in group chats (@ralphtheninja)

## [1.4.0] - 2018-10-16

### Changed
* Pull in `conversations` module (@jikstra)
* Change window title (@ralphtheninja)
* Show full language names (and translate them) instead of abbreviations (@ralphtheninja)
* Upgrade `deltachat-node` to `^0.20.0` (@ralphtheninja)
* Update logins in login page on successful configure (@ralphtheninja)
* Translate all strings on login and create chat/group pages (@ralphtheninja)
* Translate all menu items (@ralphtheninja)
* Enable going to `Create Group` page from chat list page (@ralphtheninja)

### Added
* Implement delete message (@ralphtheninja)
* Add screenshot to README (@ralphtheninja)
* Add descriptions to language resources (@ralphtheninja)
* Add `Archive Chat` menu item (@ralphtheninja)
* Add `Delete Chat` menu item (@ralphtheninja)

### Removed
* Remove `+ Group` button from `Create Chat` page (moved to chat list, see above) (@ralphtheninja)

### Fixed
* Do not scroll to bottom when opening message context menu (@ralphtheninja)
* Make sure `Float on Top` menu item stays checked/unchecked when language is changed (@ralphtheninja)

[Unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.0...v1.4.0
