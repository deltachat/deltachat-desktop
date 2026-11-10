# Emoji picker data

`emoji.json` is generated; do not edit it manually.

It is needed to add new emojis, since the emoji-mart package is not updated anymore.

To regenerate run this from the repository root:

```sh
pnpm --filter @deltachat-desktop/frontend generate:emoji-data
```

Inputs (pinned in `packages/frontend/package.json`):

- [emoji-datasource](https://github.com/iamcal/emoji-data) determines the
  supported Emoji version and supplies sequences, ordering, categories, short
  names and skin tones.
- [@emoji-mart/data](https://github.com/missive/emoji-mart) keeps existing IDs,
  names, search keywords, emoticons and aliases stable.

To update, pin a newer `emoji-datasource`, regenerate, review the output and
check that the bundled Noto font supports the new sequences. Their MIT notices
are in `static/emoji-data-LICENSE`.

The picker passes the Emoji version from these data to emoji-mart via
`nativeEmojiVersion`, added by `patches/emoji-mart-awesome@3.0.0.patch`. Because the app ships its own font, this replaces emoji-mart's system-font detection, which stops at Emoji 15 and hides flags.
