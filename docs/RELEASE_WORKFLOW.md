# How to do releases

## Test releases

* Before every official release we make a test release, similar to "Release
  Candidates"
* Test releases are published to supporters and the userbase through our
  community channels, but not throught he official app stores
* Create a forum post to inform about the test release, mention what this
  release is about and what should be tested, here is an
  [example](https://support.delta.chat/t/help-testing-the-upcoming-1-41-x-release/2793)
* The goal is to do more broad user testing, looking for issues which came up
  and gathering feedback
* Usually after a round of feedback and bug reports we do another test release
  and repeat, until the release stabilized
* Optional: We can use flatpack for test releases as well (they have a
  "testing" branch users can opt-in)
* Test releases follow the steps described below. Official "stable" releases
  follow them as well, but require further steps for pushing the builds into
  the app store

## Before Releasing

1. Make sure no `blocker` bugs are in the issue tracker. If they are some, try
   to solve them first.
2. Pull translations via `npm run translations-update`.
3. Update the local help files.

## Releasing

1. Create a new branch for the new version (you could name it
   `prepare_versioncode`, for example `prepare_1.3.0`)
2. Update the change log (put the stuff in unreleased under a section with your
   new version code)
3. Change `version` field in `package.json` to `X.Y.Z`.
4. Run `npm install` to update `package-lock.json`
5. Open a PR for your branch and get it reviewed.
6. As soon as your pr is approved / before merging: tag the latest commit with
   your version number:
    ```bash
    git tag <tagname>
    git push --tags
    ```
7. After the pr is merged create a GitHub release for your tag an copy the
   relevant part of the change log into the description field.
8. Done as soon as the new tag is merged to master our build machine should
   pick it up, build the new release and upload it to
   `https://download.delta.chat/desktop/[version_code]`

## What if the master branch changed in the meantime

Rebase your PR and redo the steps as necessary. If you are unsure ask another
contributor on how to proceed in your case.

## Update to latest version on DeltaChat website

Make sure the latest version number is reflected on the official DeltaChat
website, adjust the constants in this file:
https://github.com/deltachat/deltachat-pages/blob/master/_includes/download-boxes.html
