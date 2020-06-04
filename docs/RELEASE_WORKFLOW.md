# Release Workflow

## Before Releasing

1. make sure no `blocker` bugs are in the issue tracker. If they are some, try to solve them first.

2. Pull translations: `npm run translations-update`

3. Update the help file. (TODO: information on how do that)

## Releasing

1. create a new branch for the new version (you could name it `prepare_versioncode`, for example `prepare_1.3.0`)

2. update the changelog (put the stuff in unreleased under a section with your new version code)

3. Change `version` field in `package.json` to `X.Y.Z`.

4. run `npm install` to update `package-lock.json`

5. Update, commit and push `static/chat.delta.desktop.appdata.xml`
   with the new release information (TODO make script to automate this step #1697)

6. open a pr for your branch and get it reviewed

7. as soon as your pr is approved / before merging: tag the latest commit with your version number:

```
git tag <tagname>
git push --tags
```

9. After the pr is merged create a github release for your tag an copy the relevant part of the changelog into the description field.

10. Done as soon as the new tag is merged to master our build machine should pick it up, build the new release and upload it to `https://download.delta.chat/desktop/[version_code]`

## What if the master branch changed in the meantime

rebase your pr and redo the steps as nessesary.
If you are unsure ask another contributor on how to proceed in your case.
