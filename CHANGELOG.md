# Changelog

## [Unreleased]

## [1.6.0] - 2018-10-23

### Added
* Add `Paste` menu item, fixes #161 (@ralphtheninja)

### Changed
* Update translations from transifex (@ralphtheninja)
* Translate message input field and send button (@ralphtheninja)
* Translate Autocrypt key transfer dialogs (@ralphtheninja)
* Move avatar out of message and display it next to the message (@jikstra)
* Upgrade `electron` devDependency to `^3.0.5` (@ralphtheninja)
* Upgrade `spectron` devDependency to `^5.0.0` (@ralphtheninja)

### Removed
* Remove `babel-eslint` devDependency (@ralphtheninja)

## [1.5.0] - 2018-10-20

### Added
* Add functionality to edit groups, e.g. group name, adding and removing members (@ralphtheninja)
* Add functionality to leave group (@ralphtheninja)

### Changed
* Consolidate chat list and chat view (@jikstra)
* Upgrade `deltachat-node` to `^0.21.0` (@ralphtheninja)
* Update translations from transifex (@ralphtheninja)

### Fixed
* Use default sort order from core in chat list (@ralphtheninja)
* If creating a chat that is already archived, unarchive it (@ralphtheninja)
* Fix issues with author name in group chats (@ralphtheninja)

## [1.4.0] - 2018-10-16

### Added
* Implement delete message (@ralphtheninja)
* Add screenshot to README (@ralphtheninja)
* Add descriptions to language resources (@ralphtheninja)
* Add `Archive Chat` menu item (@ralphtheninja)
* Add `Delete Chat` menu item (@ralphtheninja)

### Changed
* Pull in `conversations` module (@jikstra)
* Change window title (@ralphtheninja)
* Show full language names (and translate them) instead of abbreviations (@ralphtheninja)
* Upgrade `deltachat-node` to `^0.20.0` (@ralphtheninja)
* Update logins in login page on successful configure (@ralphtheninja)
* Translate all strings on login and create chat/group pages (@ralphtheninja)
* Translate all menu items (@ralphtheninja)
* Enable going to `Create Group` page from chat list page (@ralphtheninja)

### Removed
* Remove `+ Group` button from `Create Chat` page (moved to chat list, see above) (@ralphtheninja)

### Fixed
* Do not scroll to bottom when opening message context menu (@ralphtheninja)
* Make sure `Float on Top` menu item stays checked/unchecked when language is changed (@ralphtheninja)

[Unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/deltachat/deltachat-desktop/compare/v1.3.0...v1.4.0
