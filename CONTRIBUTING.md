# Contributing Guidelines

Thank you for looking for ways to help on Delta Chat Desktop!

This document tries to outline some conventions that may not be obvious
and aims to give a good starting point to new contributors.

## Reporting Bugs

If you found a bug, [report it on Github](https://github.com/deltachat/deltachat-desktop/issues).

Project maintainers may transfer bugs that are not UI specific
(eg. network, database or encryption related)
to [Delta Chat Core](https://github.com/deltachat/deltachat-core-rust/issues).
If you assume beforehand, that the bug you've found belongs to Core,
you can report there directly.

Please search both open and closed issues to make sure your bug report is not a duplicate.

For community interactions around Delta Chat
please read our [Community Standards](https://delta.chat/community-standards).

## Proposing Features

If you have a feature request,
create a new topic on the [Forum](https://support.delta.chat/c/features/6).
Please also search if it exists already, before opening a duplicate.

## Rough UX Philosophy

Some rough ideas, that may be helpful when thinking about how to enhance things:

- Work hard to avoid options and up-front choices.
  Thinking about concrete user stories may help on that.
- Avoid to speak about keys and other hard to understand things in the primary UI.
- The app shall work offline as well as with bad network.
- Users do not read (much).
- Consistency matters.
- Offer only things that are highly useful to many people in primary UI.
  If really needed, bury other things eg. in some menus.
- The app should be for the many, not for the few.

## Contributing Code

The [README](./README.md) explains how to set up the build environment
If you run into troubles,
ask on one of the [communication channels](https://delta.chat/contribute) for help.

You can find more specific documentation in the docs folder, it is also linked from the readme.

To contribute code,
[open a Pull Request](https://github.com/deltachat/deltachat-ios/pulls).

If you have write access to the repository,
push a branch named `<username>/<feature>`
so it is clear who is responsible for the branch,
and open a PR proposing to merge the change.
Otherwise fork the repository and create a branch in your fork.

Please add a meaningful description to your PR
so that reviewers get an idea about what the modifications are supposed to do.
Add a meaningful line to CHANGELOG.md that is at least roughly understandable by the end user.

If the changes affect the user interface,
screenshots are very helpful,
esp. before/after screenshots.

### Coding Conventions

Source files are partly derived from different other open source projects
and may follow different coding styles and conventions.

If you do a PR fixing a bug or adding a feature,
please embrace the coding convention you see in the corresponding files,
so that the result fits well together.

Do not refactor or rename things in the same PR
to make the diff small and the PR easy to review. (Generally try to do only one thing per pr).

Try to avoid premature optimisation
and complexity because it "may be needed in some future".
Usually, it is not.

Readable code is better than having some paradigms fulfilled.
Keep things really on point and simple.
If this gets in conflict with embracing existing style, however,
consistency with existing code is more important.

The "Delta Chat Core" is a high-level interface to what the UI actually needs,
data should be served in a form that the UI do not need much additional work.
If this is not the case, consider a feature proposal to "Delta Chat Core".

For CSS specific codestyle see [docs/STYLES.md](./docs/STYLES.md).

For coding style of other files and other development topics refer to [docs/DEVELOPMENT.md#code-style](docs/DEVELOPMENT.md#code-style).

### Merging Conventions

PR are merged usually to the branch `master` from which [releases](./RELEASE.md) are done.

As a default, do a `git rebase master` in case feature branches and `master` differ too much.
(please do **not** merge `master` into your feature branch)

Once a PR has an approval, unless stated otherwise, it can be merged by the author.
A PR may be approved but postponed to be merged eg. because of an ongoing release.

To ensure the correct merge merge strategy, merging left up to the PR author:

- Usually, PR are squash-merged
  as UI development often results in tiny tweak commits that are not that meaningful on their own.
- If all commits are meaningful and have a well-written description,
  they can be rebased-merged.

If you do not have write access to the repository,
you may leave a note in the PR about the desired merge strategy.

Project maintainers can also merge it, as long as they take on the responsibility (care for fixing `master` again if the pr broke it).

## Translations

Translations are done via [Transifex](https://explore.transifex.com/delta-chat/),
you can log in there with your E-Mail Address or with a Github or Google handle.
You find two projects there:

- "Delta Chat App" contains the strings used in the app's UI
- "Delta Chat Website" contains the offline help from "Settings / Help"
  as well as the pages used on <https://delta.chat>

Most strings and the whole help are used for all systems
(Android, iOS, Linux, Windows, macOS)
and should be formulated accordingly.

The english sources are in the "Android" and "Pages" repositories.
If you want to change them,
do a PR to [`strings.xml`](https://github.com/deltachat/deltachat-android/blob/main/res/values/strings.xml)
or to [`help.md`](https://github.com/deltachat/deltachat-pages/blob/master/en/help.md).
Again, please do not mix adding things and refactorings, esp. for `help.md`,
this would require retranslations and should be considered carefully.

Refer to [docs/DEVELOPMENT.md#translations](docs/DEVELOPMENT.md#translations) for more technical information on translation.

## Other Ways To Contribute

For other ways to contribute, refer to the [website](https://delta.chat/contribute).

If you think, something important is missed in this overview,
please do a PR to this document :)
