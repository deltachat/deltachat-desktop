# Changelog

## [Unreleased][unreleased]

### Changed
- slightly wider account sidebar (so traffic lights look more centered on macOS) #3698

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

## Changed
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

[unreleased]: https://github.com/deltachat/deltachat-desktop/compare/v1.43.1...HEAD

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
