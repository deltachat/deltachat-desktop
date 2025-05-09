# Experiments

Documentation about experiments that are not ready enough yet to be included in the readme file.

## Build for mobile

### iOS

Note that this was just a fun sidequest for simon at the time, so don't expect it to work.

```
pnpm tauri ios init
pnpm tauri ios dev --no-dev-server
```

This currently doens't work for me, it shows a runtime error, but installing the IPA generated by this command over xcode devices window works fine:

```
pnpm tauri ios build
```

### Android

Note that this was just a fun sidequest for simon at the time, so don't expect it to work.

```
npm run tauri android init
```

```
pnpm tauri android build
```

#### you might need older java on macOS, if so here is how I solved it

`export JAVA_HOME=$(/usr/libexec/java_home -v 21)` after installing with homebrew and running

```
brew install openjdk@21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

##### needs to be signed to be able to be installed

```
keytool -genkey -v -keystore ~/sign-tauri-android-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

then create file: `gen/android/keystore.properties`:

```
password=<password defined when keytool was executed>
keyAlias=upload
storeFile=~/sign-tauri-android-keystore.jks
```

and modify `[project]/src-tauri/gen/android/app/build.gradle.kts` according to <https://v2.tauri.app/distribute/sign/android/>.

##### logging

We were unable to find logs in first try, but we managed to get some with https://devtools.crabnebula.dev/ (over adb forward) and chrome remote webview debugging.

```
pnpm tauri android build --target aarch64 --features crabnebula_extras,inspector_in_production
# install apk manually
adb forward tcp:3000 tcp:3000
```

Update: We made it log to logcat, read it with:

```sh
# if you have ripgrep
adb logcat | rg delta
# if you only have grep
adb logcat | grep delta
```

#### Building apk

You might get strange errors with the other methods like `tauri android dev`, if you do try out this:

```sh
pnpm tauri android build --apk --target aarch64
adb install src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

#### Note about Older browsers

It didn't work on android with chromium 91, because https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks are only supported from chrome 94 onwards. It worked when I installed the beta version (135) of the webview from the playstore and chose it in the android developer settings as webview provider.
