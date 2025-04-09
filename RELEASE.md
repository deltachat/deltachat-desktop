# How to do releases

> Every new git tag triggers a build script which will create a new release on github,
> build binaries for the different platforms and add a new release folder on
> delta.chat/downloads/vX.Y.Z/ which includes all generated apps

## Test releases

- Before every official release we build release previews, similar to
  "Release Candidates"
- by adding a #public-preview token to the PR description preview builds
  will be uploaded to delta.chat/download/previews/. The branch name of the
  PR will be used as filename, so the branch name should be something like
  "preview-release-X.Y.Z". The package.json version should be updated to the
  release version, but no git tag should be pushed, since that would trigger
  the final release.
- Release previews are published to supporters and the userbase through our
  community channels, but not through official app stores
- Incite more broad user testing, look for issues which came up and gather feedback
  - Create a forum post to inform about the release preview, mention what this
    release is about and what should be tested, here is an
    [example](https://support.delta.chat/t/help-testing-the-upcoming-1-41-x-release/2793)
  - Create a delta post in testing groups and channels and the delta chat dev group
  - toot on mastodon, from private account,
    with `#deltachat` and `#deltachat_desktop` hashtag with release highlights
    and pointing users to the forum post
- After a round of feedback and bug reports we can do another release preview (with a
  new revision number) and repeat, until the release stabilized
- Optional: We can use flatpak for test releases as well (they have a
  "testing" branch users can opt-in)
- Optional: Draft an in-app device message for the new version informing users
  of the release highlights and also thanking the testers for testing the app

## Official releases

- Versioning: every deltachat client app should follow this versiong rule:
  the two first digits (Major.Minor) should reflect the current core version and
  only the revision might be client specific. So if core is on 2.23.0 the first
  release with that core should have 2.23.0. If more releases are needed with the
  same core they will have 2.23.1, 2.23.2 etc.
- Update the official DeltaChat website by adjusting the constants in this file:
  <https://github.com/deltachat/deltachat-pages/blob/master/_includes/download-boxes.html>
- An in-app device message for the new official release should exist (except for minor
  changes or revisions), if there is no highlight to mention we can say it's a
  release focused on stability and bug fixes
- Official releases require individual building steps for each platform we
  support. The exact steps are not further defined in this document (yet).
  Please consult one of the maintainers of this repository
- When making an official release create a new issue following this template to
  track its status:
  ```
  - [ ] [DeltaChat Website](https://delta.chat/en/download)
  - [ ] [flathub](https://flathub.org/apps/chat.delta.desktop)
  - [ ] [GitHub release](https://github.com/deltachat/deltachat-desktop/releases)
       - [ ] downloadable files also on [GitHub](https://download.delta.chat/desktop/)
  - [ ] [MacOS store](https://apps.apple.com/us/app/delta-chat-desktop/id1462750497)
  - [ ] [Windows store](https://apps.microsoft.com/detail/9pjtxx7hn3pk)
  - [ ] [homebrew](https://formulae.brew.sh/cask/deltachat)
  - [ ] [arch](https://archlinux.org/packages/extra/any/deltachat-desktop/)
  - [ ] [nix](https://search.nixos.org/packages?channel=unstable&show=deltachat-desktop&from=0&type=packages&query=deltachat)
  - [ ] [snap](https://snapcraft.io/deltachat-desktop) (community)
  - [ ] [FreeBSD](https://www.freshports.org/net-im/deltachat-desktop)
  ```
  See [example](https://github.com/deltachat/deltachat-desktop/issues/3582)

---

## Before Releasing

1. Make sure no "blocking" bugs are in the issue tracker. If there's any, try
   to solve them first:
   <https://github.com/deltachat/deltachat-desktop/issues?q=is%3Aopen+is%3Aissue+label%3Ablocker>
2. Pull translations via `pnpm -w translations:update` in a separate PR
3. Update the local help files if necessary in a separate PR:
   Run `./bin/help/create-local-help.sh` with an updated checkout of deltachat-pages on the same level ../
   <https://github.com/deltachat/deltachat-pages/blob/master/tools/create-local-help.py>
4. If you've updated any translations or local help files, make sure that the
   date of your update is mentioned in the `CHANGELOG.md`
5. Optional: from time to time, it's good to check
   whether our webxdc implementation still properly isolates webxdc apps
   from network.
   Follow the instructions in
   https://github.com/webxdc/webxdc-test?tab=readme-ov-file#testing-network-isolation.

## Releasing

1. Create a new branch for the new version (you could name it
   `prepare-version-<version>`, for example `prepare-release-2.23.0`)
2. Run `pnpm prepare-release <version>`
3. check and cleanup the changes added to CHANGELOG
4. Open a PR for your branch and get it reviewed.
5. As soon as your PR is approved merge it to `main`
6. After the PR is merged, checkout the latest version on `main`. Tag the latest commit
   with your version number:
   ```bash
   git tag v<version> # for example v2.23.0
   git push origin main --tags
   ```
7. The deployment script creates a [release](https://github.com/deltachat/deltachat-desktop/releases)
   draft on github which needs to be updated and published manually:

- Copy the relevant part of the `CHANGELOG.md` file into the description field
  - for fresh releases this includes the changelog of the test releases
  - for patch releases the full changelog is not needed, the part that changed from the last release is enough
- Add a header `# Downloads` with a link to the download page.
  If it's an official release, add a link to the release progress issue.
- for testing releases add a link to the testing forum topic:
  ```md
  > This release candidate is currently in the testing phase, to learn more read https://support.delta.chat/t/<rest of link>
  ```

1.  As soon as the new tag is detected by our build machine, it will start
    building releases for various platforms (MacOS, Windows, Linux) and upload
    them to: `https://download.delta.chat/desktop/[version_code]`. This process
    takes 2-3 hours.

## What if the `main` branch changed in the meantime

Rebase your PR and redo the steps as necessary. If you are unsure ask another
contributor on how to proceed in your case.

## Upload build artefacts to GitHub release (if deployment script failed)

You can easily upload the build artefacts into the GitHub release with the help
of the [GitHub command line tool](https://cli.github.com/). Make sure you've
followed all steps above and the CI finished its build.

```bash
# Specify the version you've just released
export DC_VERSION=v1.42.2

# Download build artefacts from CI
wget -r --no-parent -l1 --reject html https://download.delta.chat/desktop/$DC_VERSION
rm download.delta.chat/desktop/$DC_VERSION/*index.html*

# Upload them to the GitHub release
gh release upload -R deltachat/deltachat-desktop $DC_VERSION download.delta.chat/desktop/$DC_VERSION/*
```
