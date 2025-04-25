#!/bin/bash
set -e

# This script builds and packages the example into a macOS bundle so it can be properly tested on macOS

cargo build --example test

export TARGET_DIR=../../../../target

mkdir -p $TARGET_DIR/TestExample.app/Contents/MacOS

cp $TARGET_DIR/debug/examples/test $TARGET_DIR/TestExample.app/Contents/MacOS

cat <<EOF > "$TARGET_DIR/TestExample.app/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>TestExample</string>
    <key>CFBundleDisplayName</key>
    <string>Test Example</string>
    <!-- TODO set icon -->
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>CFBundleIdentifier</key>
    <string>test-example.tauri.chat.delta</string>
    <key>CFBundleExecutable</key>
    <string>test</string>
</dict>
</plist>
EOF

# echo "> code signing"
codesign -s "$APPLE_SIGNING_IDENTITY" ./$TARGET_DIR/TestExample.app/ || (echo "APPLE_SIGNING_IDENTITY env var missing" && exit 1)
# echo "> run it"
RUST_LOG=trace ./$TARGET_DIR/TestExample.app/Contents/MacOS/test
