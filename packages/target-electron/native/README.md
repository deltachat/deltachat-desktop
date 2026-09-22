# Native addon: user presence

`os-auth` asks the operating system to confirm that the person in front of the
device is the account owner, for actions that should not be triggerable from an
unattended machine.

| platform | mechanism                                                                      |
| -------- | ------------------------------------------------------------------------------ |
| macOS    | LocalAuthentication, `deviceOwnerAuthentication`: Touch ID or account password |
| Windows  | Windows Hello via `IUserConsentVerifierInterop` (needs the window handle)      |
| others   | not implemented, every call reports `unsupported`                              |

## What it does not do

The result is a status this process decides on and passes through IPC. Anyone
who can modify the installed app can skip the check, so this is a barrier
against someone using an unlocked device, not a protection against software
running as the user. Protecting data against that would mean deriving a key
from the authentication (Keychain with `kSecAccessControlUserPresence`,
`KeyCredentialManager` on Windows) instead of returning a status.

Callers have to handle `unsupported` with their own confirmation, otherwise the
action is unreachable on Linux and in the browser target.

## Building

```sh
cd packages/target-electron
pnpm native:build                     # host platform
pnpm native:build x86_64-apple-darwin # or any target triple from bin/build-native.mjs
```

The result goes to `packages/target-electron/native-dist/` and is not checked
in. `pnpm build` does not build it, so a checkout without a Rust toolchain
works as before — the addon is simply missing and user presence reports
`unsupported`.

macOS builds both architectures and merges them with `lipo` into a single
`os-auth.darwin.node`, because the release build is a universal app and
electron-builder merges the two per-architecture bundles.

The CI builds the addon in the macOS and Windows packaging jobs only.

`electron-builder` unpacks `native-dist/` from the asar archive (native code
can not be loaded from inside an archive) and drops the other platforms'
binaries, see `build/gen-electron-builder-config.js`.

## Checking the platform code without those platforms

The platform specific code compiles on any host, only linking needs the real
SDKs:

```sh
cd native/os-auth
cargo check --target aarch64-apple-darwin
cargo check --target x86_64-pc-windows-msvc
```
