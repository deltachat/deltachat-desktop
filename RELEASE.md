# How to do releases

> We distinct between "test" releases and "official" releases. Test releases
> serve as "Release Candidates" which do not land in the official app stores
> yet.

## Test releases

- Before every official release we make at least one test release, similar to
  "Release Candidates"
- Test releases are published to supporters and the userbase through our
  community channels, but not through official app stores
- Incite more broad user testing, look for issues which came up and gather feedback
  - Create a forum post to inform about the test release, mention what this
    release is about and what should be tested, here is an
    [example](https://support.delta.chat/t/help-testing-the-upcoming-1-41-x-release/2793)
  - Create a delta post in testing groups and channels, and the delta chat dev group
  - toot on mastodon, from private account,
    with `#deltachat` and `#deltachat_desktop` hashtag with release highlights
    and pointing users to the forum post
- Usually after a round of feedback and bug reports we do another test release
  and repeat, until the release stabilized
- Optional: We can use flatpak for test releases as well (they have a
  "testing" branch users can opt-in)
- Optional: Draft an in-app device message for the new version informing users
  of the release highlights and also thanking the testers for testing the app

## Official releases

- Make sure the latest version number is reflected on the official DeltaChat
  website, adjust the constants in this file:
  <https://github.com/deltachat/deltachat-pages/blob/master/_includes/download-boxes.html>
- An in-app device message for the new official release should exist, if there
  is no highlight to mention we can say it's a release focused on stability and
  bug fixes
- Official releases require individual building steps for each platform we
  support. The exact steps are not further defined in this document (yet).
  Please consult one of the maintainers of this repository
- When making an official release create a new issue following this template to
  track its status:
  ```
  - [ ] DeltaChat Website
  - [ ] flathub
  - [ ] GitHub release
       - [ ] downloadable files also on GitHub
  - [ ] MacOS store
  - [ ] Windows store
  - [ ] homebrew
  - [ ] arch
  - [ ] nix
  - [ ] (community) snap
  ```
  See [example](https://github.com/deltachat/deltachat-desktop/issues/3582)

---

> Both test and official releases follow similar steps described further below.

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

## Releasing

1. Create a new branch for the new version (you could name it
   `prepare_versioncode`, for example `prepare_1.3.0`)
2. Update the `CHANGELOG.md` file (put the stuff in "unreleased" under a
   section with your new version code)
3. Do not forget to update the tag links at the end of the `CHANGELOG.md` file!
4. Change `version` field in `package.json` to `X.Y.Z`
5. Run `pnpm -w update:target-versions` to update versions in the other packages
6. Open a PR for your branch and get it reviewed.
7. As soon as your PR is approved merge it to `main`
8. After the PR is merged, checkout the latest version on `main`. Tag the latest commit
   with your version number:
   ```bash
   git tag <tagname> # for example v1.43.2
   git push origin main --tags
   ```
9. Now create a GitHub release for your tag:
   - Copy the relevant part of the `CHANGELOG.md` file into the description field
     - for fresh releases this includes the changelog of the test releases
     - for patch releases the full changelog is not needed, the part that changed from the last release is enough
   - Add a header `# Downloads` with a link to the download page.
     If it's an official release, add a link to the release progress issue.
   - for testing releases add a link to the testing forum topic:
     ```md
     > This release candidate is currently in the testing phase, to learn more read https://support.delta.chat/t/<rest of link>
     ```
10. As soon as the new tag is detected by our build machine, it will start
    building releases for various platforms (MacOS, Windows, Linux) and upload
    them to: `https://download.delta.chat/desktop/[version_code]`. This process
    takes 2-3 hours.

## What if the `main` branch changed in the meantime

Rebase your PR and redo the steps as necessary. If you are unsure ask another
contributor on how to proceed in your case.

## Upload build artefacts to GitHub release

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
