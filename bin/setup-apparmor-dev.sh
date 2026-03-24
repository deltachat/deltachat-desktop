#!/bin/bash
# Sets up an AppArmor profile for the development Electron binary
# so that the Chromium sandbox works on Ubuntu 24.04+ without --no-sandbox.
#
# Background: Ubuntu 24.04 restricts unprivileged user namespaces via AppArmor.
# Electron's sandbox needs user namespaces, so a profile granting "userns" is required.
# See: https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md
#
# This script requires sudo and needs to be re-run when the Electron version changes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check we're on Linux
if [[ "$(uname)" != "Linux" ]]; then
  echo "This script is only needed on Linux. Exiting."
  exit 0
fi

# Check if AppArmor is available
if ! command -v apparmor_parser &>/dev/null; then
  echo "apparmor_parser not found — AppArmor does not appear to be installed."
  echo "If you're not on Ubuntu 24.04+, you probably don't need this script."
  exit 0
fi

if ! apparmor_status --enabled &>/dev/null 2>&1; then
  echo "AppArmor is not enabled. You probably don't need this script."
  exit 0
fi

# Find the electron binary
ELECTRON_BIN=$(cd "$REPO_ROOT/packages/target-electron" && node -e "process.stdout.write(require('electron'))" 2>/dev/null || true)

if [[ -z "$ELECTRON_BIN" || ! -f "$ELECTRON_BIN" ]]; then
  echo "Error: Could not find the Electron binary."
  echo "Make sure you have run 'pnpm install' first."
  exit 1
fi

echo "Electron binary: $ELECTRON_BIN"

PROFILE_NAME="deltachat-desktop-dev"
PROFILE_PATH="/etc/apparmor.d/$PROFILE_NAME"

PROFILE_CONTENT="abi <abi/4.0>,
include <tunables/global>

profile ${PROFILE_NAME} \"${ELECTRON_BIN}\" flags=(unconfined) {
  userns,

  # Site-specific additions and overrides. See local/README for details.
  include if exists <local/${PROFILE_NAME}>
}"

# Dry-run check: verify the profile is valid for this AppArmor version
if ! echo "$PROFILE_CONTENT" | apparmor_parser --skip-kernel-load --debug /dev/stdin &>/dev/null; then
  echo "This version of AppArmor does not support the required profile syntax (abi/4.0)."
  echo "You probably don't need this script (the restriction was introduced in Ubuntu 24.04)."
  exit 0
fi

echo ""
echo "This will install an AppArmor profile to: $PROFILE_PATH"
echo "It grants the Electron dev binary permission to use user namespaces (for the Chromium sandbox)."
echo ""

sudo tee "$PROFILE_PATH" > /dev/null <<EOF
$PROFILE_CONTENT
EOF

sudo apparmor_parser --replace --write-cache --skip-read-cache "$PROFILE_PATH"

echo ""
echo "AppArmor profile installed and loaded successfully."
echo ""
echo "Note: Re-run this script after changing the Electron version (pnpm install)."
